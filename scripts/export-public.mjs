// ---------------------------------------------------------------------------
// export-public.mjs — Gera a versão pública do Brain em dist/public (ADR-017).
//
// Privado por padrão: só sai o que está na allowlist de
// scripts/export-manifest.json (strings, globs simples com ** e renames
// {"from","to"}). Depois da cópia, uma varredura de redação roda sobre TODO o
// conteúdo exportado com os padrões do manifest (regex, case-insensitive,
// linha a linha); qualquer ocorrência FALHA o export (exit 1) e, no modo
// --write, apaga dist/public/.
//
// Uso (funciona a partir de qualquer diretório; a raiz do Brain é resolvida
// como a pasta pai de scripts/):
//   bun scripts/export-public.mjs            # dry-run: lista e varre, sem escrever
//   bun scripts/export-public.mjs --write    # apaga e regrava dist/public/
//   (compatível com node >= 20: node scripts/export-public.mjs)
//
// Nota: como scripts/** está na allowlist, o próprio manifest é exportado e
// varrido; os padrões de redação do manifest usam escapes equivalentes
// (\x2D, \x5F, classes [x]) exatamente para não detectarem a si mesmos.
// ---------------------------------------------------------------------------

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

function raizDoBrain() {
  let p = decodeURIComponent(new URL(".", import.meta.url).pathname);
  if (/^\/[A-Za-z]:/.test(p)) p = p.slice(1);
  return path.resolve(p, "..");
}

const RAIZ = raizDoBrain();
const ESCREVER = process.argv.includes("--write");
const rel = (abs) => path.relative(RAIZ, abs) || ".";
const relPosix = (abs) => rel(abs).split(path.sep).join("/");

function falhar(msg) {
  console.error(`[ERRO] ${msg}`);
  process.exit(1);
}

// --- manifest ----------------------------------------------------------------

const manifestPath = path.join(RAIZ, "scripts", "export-manifest.json");
let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
} catch (e) {
  falhar(`${rel(manifestPath)} — falha ao ler ou interpretar o manifest: ${e.message}`);
}
if (!Array.isArray(manifest.allowlist) || manifest.allowlist.length === 0) {
  falhar(`${rel(manifestPath)} — "allowlist" ausente ou vazia`);
}
// Os padrões de redação vivem FORA deste manifest, e por um motivo que só fica
// óbvio depois de escrito: scripts/** é exportado, então o manifest viaja no
// pacote público — e a lista de padrões contém slugs de cliente em quarentena,
// fragmentos da identidade do operador e o nome da máquina. Publicar a lista de
// redação é publicar exatamente aquilo que ela existe para esconder. Os escapes
// que impedem um padrão de casar a si mesmo protegem o arquivo do próprio
// scanner; não protegem contra um leitor humano.
//
// O arquivo apontado nunca é exportado. Quem clona o framework copia
// scripts/redaction-patterns.example.json e preenche com os seus próprios
// valores. Sem esse arquivo o export não roda: export público sem redação é
// proibido (ADR-017), e falhar fechado é o comportamento certo.
const padroesRel = manifest.redaction_patterns_file;
if (typeof padroesRel !== "string" || !padroesRel) {
  falhar(`${rel(manifestPath)} — "redaction_patterns_file" ausente; export público sem redação é proibido (ADR-017)`);
}
const padroesPath = path.join(RAIZ, ...padroesRel.split("/"));
if (!fs.existsSync(padroesPath)) {
  falhar(
    `${padroesRel} — arquivo de padrões de redação não encontrado.\n` +
    `  Copie scripts/redaction-patterns.example.json para esse caminho e preencha com os seus\n` +
    `  próprios valores (e-mail, nome da máquina, slugs de cliente, caminhos de trabalho).\n` +
    `  Export público sem redação é proibido (ADR-017).`,
  );
}
let listaPadroes;
try {
  const bruto = JSON.parse(fs.readFileSync(padroesPath, "utf8"));
  listaPadroes = bruto.patterns;
} catch (e) {
  falhar(`${padroesRel} — falha ao ler ou interpretar: ${e.message}`);
}
if (!Array.isArray(listaPadroes) || listaPadroes.length === 0) {
  falhar(`${padroesRel} — "patterns" ausente ou vazio; export público sem redação é proibido (ADR-017)`);
}
const padroes = listaPadroes.map((p) => {
  try {
    return { fonte: p, re: new RegExp(p, "i") };
  } catch (e) {
    falhar(`${padroesRel} — padrão de redação inválido "${p}": ${e.message}`);
  }
});

// --- expansão da allowlist ---------------------------------------------------

function globParaRegex(padrao) {
  const esc = padrao.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  const corpo = esc.replace(/\*\*/g, "\u0000").replace(/\*/g, "[^/]*").replaceAll("\u0000", ".*");
  return new RegExp(`^${corpo}$`);
}

function listarArquivos(dir, saida = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === ".git" || ent.name === "node_modules" || ent.name === "dist") continue;
      listarArquivos(abs, saida);
    } else if (ent.isFile()) {
      saida.push(abs);
    }
  }
  return saida;
}

const errosExpansao = [];
const porDestino = new Map(); // destinoRel -> origemAbs

function adicionar(origemAbs, destinoRel) {
  const existente = porDestino.get(destinoRel);
  if (existente && existente !== origemAbs) {
    errosExpansao.push(`destino duplicado "${destinoRel}" (origens: ${rel(existente)} e ${rel(origemAbs)})`);
    return;
  }
  porDestino.set(destinoRel, origemAbs);
}

for (const entrada of manifest.allowlist) {
  const de = typeof entrada === "string" ? entrada : entrada && entrada.from;
  const para = typeof entrada === "string" ? entrada : entrada && entrada.to;
  if (typeof de !== "string" || typeof para !== "string") {
    errosExpansao.push(`entrada inválida na allowlist (esperado string ou {"from","to"}): ${JSON.stringify(entrada)}`);
    continue;
  }
  if (de.includes("*")) {
    const reGlob = globParaRegex(de);
    const base = de.slice(0, de.indexOf("*")).replace(/\/+$/, "");
    const dirBase = base ? path.join(RAIZ, base) : RAIZ;
    if (!fs.existsSync(dirBase)) {
      errosExpansao.push(`allowlist: caminho base do glob "${de}" não existe (${base || "."})`);
      continue;
    }
    const encontrados = listarArquivos(dirBase).filter((abs) => reGlob.test(relPosix(abs)));
    if (encontrados.length === 0) {
      errosExpansao.push(`allowlist: nenhum arquivo casa com o glob "${de}"`);
      continue;
    }
    for (const abs of encontrados) adicionar(abs, relPosix(abs));
    continue;
  }
  const abs = path.join(RAIZ, de);
  if (!fs.existsSync(abs)) {
    errosExpansao.push(`allowlist: arquivo inexistente: ${de}`);
    continue;
  }
  if (fs.statSync(abs).isDirectory()) {
    errosExpansao.push(`allowlist: "${de}" é um diretório — use "${de}/**"`);
    continue;
  }
  adicionar(abs, para);
}

if (errosExpansao.length) {
  console.error(`[ERRO] allowlist com problemas (${errosExpansao.length}):`);
  for (const e of errosExpansao) console.error(`  - ${e}`);
  process.exit(1);
}

const destinos = [...porDestino.keys()].sort();
const destRoot = path.join(RAIZ, "dist", "public");

// --- cópia (somente --write) -------------------------------------------------

// Frontmatter é o contrato interno do Brain (ADR-018) e vale para todo documento
// da instância. Mas o GitHub renderiza frontmatter YAML de arquivo .md como uma
// TABELA no topo da página — e num README isso põe uma tabela de metadados acima
// do título, que é a primeira coisa que o visitante vê. Nos arquivos de vitrine
// do repositório público (README, QUICKSTART, CONTRIBUTING, CHANGELOG, AGENTS) o
// frontmatter é ruído para quem chega, não governança para quem opera.
//
// Só os destinos nomeados em `strip_frontmatter` perdem o bloco. skills/,
// templates/ e o exemplo mantêm o seu: ali o frontmatter É o produto.
const SEM_FRONTMATTER = new Set(manifest.strip_frontmatter || []);

function semFrontmatter(texto) {
  // Remove um único bloco "---\n...\n---" no topo, e só ali.
  const m = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/.exec(texto);
  return m ? texto.slice(m[0].length).replace(/^\s*\r?\n/, "") : texto;
}

if (ESCREVER) {
  fs.rmSync(destRoot, { recursive: true, force: true });
  for (const destinoRel of destinos) {
    const destinoAbs = path.join(destRoot, ...destinoRel.split("/"));
    fs.mkdirSync(path.dirname(destinoAbs), { recursive: true });
    if (SEM_FRONTMATTER.has(destinoRel)) {
      const bruto = fs.readFileSync(porDestino.get(destinoRel), "utf8");
      fs.writeFileSync(destinoAbs, semFrontmatter(bruto));
    } else {
      fs.copyFileSync(porDestino.get(destinoRel), destinoAbs);
    }
  }
}

// --- varredura de redação sobre o conteúdo exportado -------------------------

function ehTexto(buf) {
  return !buf.subarray(0, 8192).includes(0);
}

const ocorrencias = [];
for (const destinoRel of destinos) {
  const lidoDe = ESCREVER
    ? path.join(destRoot, ...destinoRel.split("/"))
    : porDestino.get(destinoRel);
  const buf = fs.readFileSync(lidoDe);
  if (!ehTexto(buf)) continue; // binário: copiado, mas fora da varredura textual
  const linhas = buf.toString("utf8").split(/\r?\n/);
  linhas.forEach((linha, i) => {
    for (const { fonte, re } of padroes) {
      if (re.test(linha)) {
        ocorrencias.push(`${destinoRel}:${i + 1} — padrão de redação "${fonte}" (origem: ${rel(porDestino.get(destinoRel))})`);
      }
    }
  });
}

if (ocorrencias.length) {
  console.error(`[ERRO] Redação falhou — ${ocorrencias.length} ocorrência(s) de conteúdo privado no export:`);
  for (const o of ocorrencias) console.error(`  - ${o}`);
  if (ESCREVER) {
    fs.rmSync(destRoot, { recursive: true, force: true });
    console.error(`dist${path.sep}public${path.sep} apagada: nada foi exportado.`);
  } else {
    console.error("(dry-run: nada foi escrito)");
  }
  process.exit(1);
}

// --- relatório final ---------------------------------------------------------

console.log(ESCREVER
  ? `Export público gravado em ${rel(destRoot)} (${destinos.length} arquivo(s)):`
  : `Dry-run — ${destinos.length} arquivo(s) seriam exportados (use --write para gravar):`);
for (const d of destinos) console.log(`  - ${d}`);
console.log("Redação: nenhuma ocorrência encontrada. Resultado: OK");
process.exit(0);

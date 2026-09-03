// ---------------------------------------------------------------------------
// validate-prose-refs.mjs — Verifica referências a arquivos feitas EM PROSA.
//
// O validate-links.mjs cobre link markdown: [texto](caminho). Não cobre a
// citação em prosa entre crases — `ALGUM-ARQUIVO.md` —, que é como um
// documento normativo pode passar meses apontando para um arquivo que não
// existe. Este validador fecha essa lacuna.
//
// Erro (exit 1): nome de arquivo citado entre crases, com extensão conhecida
// do repositório, que não existe em lugar nenhum da árvore.
//
// ESCAPE DECLARADO: uma ausência conhecida e intencional se declara com um
// comentário HTML na mesma seção do documento:
//
//   <!-- ref-ausente-ok: NOME-DO-ARQUIVO.md — motivo da ausência -->
//
// Ausência declarada é achado registrado; ausência silenciosa é dívida. A
// declaração vale para o arquivo nomeado, no documento inteiro.
//
// ESCOPO — a distinção que torna o validador útil em vez de barulhento:
// só são verificados os documentos que descrevem ESTE repositório (raiz
// canônica, governance/, skills/, templates/, agents/, docs/, metrics/,
// references/, examples/). Ficam de fora logs/ e projects/, que são registros
// e dossiês descrevendo repositórios de terceiros: citar `check-db.mjs` de
// outro projeto não é referência quebrada daqui. Referência quebrada num
// contrato é defeito de governança; num log é descrição do mundo lá fora.
//
// Ignora: blocos de código cercados (``` e ~~~), placeholders com <>, NNN ou
// reticências, caminhos fora do repositório (~/..., /abs, D:\...), nomes com
// curinga, extensões não pertencentes ao repositório, e archive/, dist/,
// .git/ e node_modules/. Modo padrão também ignora as pastas legadas
// congeladas; --strict as inclui.
//
// Uso (funciona a partir de qualquer diretório; a raiz do Shizune é resolvida
// como a pasta pai de scripts/):
//   bun scripts/validate-prose-refs.mjs
//   bun scripts/validate-prose-refs.mjs --strict
//   (compatível com node >= 20: node scripts/validate-prose-refs.mjs)
// ---------------------------------------------------------------------------

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

function raizDoShizune() {
  let p = decodeURIComponent(new URL(".", import.meta.url).pathname);
  if (/^\/[A-Za-z]:/.test(p)) p = p.slice(1);
  return path.resolve(p, "..");
}

const RAIZ = raizDoShizune();
const ESTRITO = process.argv.includes("--strict");
const erros = [];
const declaradas = [];
const rel = (abs) => path.relative(RAIZ, abs) || ".";

const IGNORAR_TOP = new Set(["archive", "dist", ".git", "node_modules"]);
// Ver a nota em validate-structure.mjs: a arvore legada e de cada instancia,
// nao do framework. Ausente = zero legado.
const PASTAS_LEGADAS = new Set((() => {
  const arq = path.join(RAIZ, "governance", "legacy-tree.json");
  if (!fs.existsSync(arq)) return [];
  try {
    const j = JSON.parse(fs.readFileSync(arq, "utf8"));
    return Array.isArray(j.folders) ? j.folders : [];
  } catch { return []; }
})());

// Só extensões que pertencem ao repositório. Citar `package.json` ou
// `tsconfig.json` de um projeto externo não é referência quebrada daqui.
const EXTENSOES = new Set([".md", ".mjs", ".json", ".yaml", ".yml", ".ps1"]);

// Nomes genéricos que aparecem em prosa como conceito, não como arquivo deste
// repositório. Citá-los não é afirmar que existem aqui.
const GENERICOS = new Set([
  "package.json", "tsconfig.json", "vercel.json", ".env", "CLAUDE.md",
  "AGENTS.md", "SKILL.md", "CONTEXT.md", "DOMAIN.md", "README.md",
  "handoff.json", "handoff.md", "settings.json", "settings.local.json",
]);

function andarPastas(fn) {
  const ignorarTop = new Set(IGNORAR_TOP);
  if (!ESTRITO) for (const p of PASTAS_LEGADAS) ignorarTop.add(p);
  (function andar(dir) {
    let entradas;
    try { entradas = fs.readdirSync(dir, { withFileTypes: true }); }
    catch { return; }
    for (const ent of entradas) {
      const abs = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (dir === RAIZ && ignorarTop.has(ent.name)) continue;
        andar(abs);
      } else if (ent.isFile()) {
        fn(abs, ent.name);
      }
    }
  })(RAIZ);
}

// Índice de todo nome de arquivo existente na árvore (inclusive nas pastas
// legadas e em archive/): a referência é válida se o arquivo existe em
// QUALQUER lugar, porque a prosa cita o nome, não o caminho.
const nomesExistentes = new Set();
(function indexarTudo(dir) {
  let entradas;
  try { entradas = fs.readdirSync(dir, { withFileTypes: true }); }
  catch { return; }
  for (const ent of entradas) {
    const abs = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (dir === RAIZ && (ent.name === ".git" || ent.name === "node_modules")) continue;
      indexarTudo(abs);
    } else if (ent.isFile()) {
      nomesExistentes.add(ent.name);
      nomesExistentes.add(rel(abs).replace(/\\/g, "/"));
    }
  }
})(RAIZ);

// Pastas cujos documentos descrevem repositórios de TERCEIROS, não este.
const FORA_DO_ESCOPO = new Set(["logs", "projects"]);

const mds = [];
andarPastas((abs, nome) => {
  if (!nome.toLowerCase().endsWith(".md")) return;
  const topo = rel(abs).replace(/\\/g, "/").split("/")[0];
  if (FORA_DO_ESCOPO.has(topo)) return;
  mds.push(abs);
});

let totalRefs = 0;

function verificarArquivo(abs) {
  const caminho = rel(abs);
  let texto;
  try { texto = fs.readFileSync(abs, "utf8"); }
  catch (e) { erros.push(`${caminho} — falha de leitura: ${e.message}`); return; }

  // Ausências declaradas neste documento, com o motivo.
  const declaradasAqui = new Map();
  const reDecl = /<!--\s*ref-ausente-ok:\s*([^\s—-][^—\n]*?)\s*(?:—|--)\s*([^>]*?)\s*-->/g;
  let d;
  while ((d = reDecl.exec(texto)) !== null) {
    declaradasAqui.set(d[1].trim(), d[2].trim());
  }

  const linhas = texto.split(/\r?\n/);
  let cerca = null;

  linhas.forEach((linhaBruta, idx) => {
    const n = idx + 1;
    const mCerca = /^\s*(`{3,}|~{3,})/.exec(linhaBruta);
    if (mCerca) {
      const tipo = mCerca[1][0];
      const tam = mCerca[1].length;
      if (!cerca) cerca = { tipo, tam };
      else if (tipo === cerca.tipo && tam >= cerca.tam && /^\s*(`{3,}|~{3,})\s*$/.test(linhaBruta)) cerca = null;
      return;
    }
    if (cerca) return;
    if (/^\s*<!--/.test(linhaBruta)) return; // a própria declaração de escape

    // Ao contrário do validate-links, aqui o alvo É o código inline.
    const reInline = /`([^`\n]+)`/g;
    let m;
    while ((m = reInline.exec(linhaBruta)) !== null) {
      const bruto = m[1].trim();
      if (bruto === "" || /[<>*\s]/.test(bruto)) continue; // placeholder, curinga ou frase
      if (/^[~/]|^[A-Za-z]:[\\/]/.test(bruto)) continue;   // fora deste repositório
      if (/\.\.\.|NNN|nnn/.test(bruto)) continue;          // placeholder de nome
      // A normalização de `\` para `/` tem de vir ANTES de basename/extname, e
      // esta ordem é o conserto de uma falha que só aparecia no CI. No Windows,
      // path.basename("00-governanca\\DECISOES.md") devolve "DECISOES.md"; no
      // Linux devolve a string inteira, porque `\` não é separador em POSIX.
      // Com o basename errado, tanto a busca em nomesExistentes quanto a
      // consulta às ausências declaradas falhavam, e o validador acusava
      // arquivo inexistente para caminho que existe. Usar path.posix depois de
      // normalizar dá o mesmo resultado nos dois sistemas.
      const normalizado = bruto.replace(/\\/g, "/").replace(/^\.\//, "");

      const ext = path.posix.extname(normalizado).toLowerCase();
      if (!EXTENSOES.has(ext)) continue;

      const base = path.posix.basename(normalizado);
      if (GENERICOS.has(base)) continue;

      totalRefs++;

      if (nomesExistentes.has(normalizado) || nomesExistentes.has(base)) continue;

      const motivo = declaradasAqui.get(base) ?? declaradasAqui.get(normalizado);
      if (motivo !== undefined) {
        declaradas.push(`${caminho}:${n} — ausência declarada: \`${bruto}\` — ${motivo}`);
        continue;
      }

      erros.push(
        `${caminho}:${n} — referência em prosa a arquivo inexistente: \`${bruto}\`` +
        ` (declare com <!-- ref-ausente-ok: ${base} — motivo --> se a ausência for intencional)`,
      );
    }
  });
}

console.log(`validate-prose-refs — raiz: ${RAIZ}`);
console.log(`Modo: ${ESTRITO ? "estrito (--strict)" : "padrão"}\n`);

for (const abs of mds) verificarArquivo(abs);

if (erros.length) {
  console.log(`REFERÊNCIAS QUEBRADAS EM PROSA (${erros.length}):`);
  for (const e of erros) console.log(`  [ERRO] ${e}`);
  console.log("");
}
if (declaradas.length) {
  console.log(`AUSÊNCIAS DECLARADAS (${declaradas.length}) — aceitas, registradas:`);
  for (const a of declaradas) console.log(`  [OK] ${a}`);
  console.log("");
}

console.log(`Resumo: ${mds.length} arquivo(s) .md verificados, ${totalRefs} referência(s) em prosa analisada(s), ` +
  `${erros.length} quebrada(s), ${declaradas.length} ausência(s) declarada(s).`);
console.log(erros.length ? "Resultado: FALHA" : "Resultado: OK");
process.exit(erros.length ? 1 : 0);

// ---------------------------------------------------------------------------
// validate-state.mjs — A máquina de estados da governança vale para ela mesma.
//
// Regra: um documento VIGENTE não deve citar como norma um documento que
// ainda está PROPOSTO. Se a decisão não foi aceita, nada que está em vigor
// pode depender dela — e, se algo já depende, ou o documento precisa ser
// aceito, ou a dependência é indevida. As duas saídas são do operador; o
// validador só torna a dívida visível.
//
// Este validador nasceu vermelho de propósito: o ADR-014 está `Proposto` e
// suas consequências já foram executadas (base de memórias zerada, ressalvas
// aplicadas em vários documentos). Isso é dívida real, não ruído.
//
// Erro (exit 1): aresta de um documento com status vigente/aprovado/aceito
// para um documento com status proposto/rascunho.
//
// ESCAPE DECLARADO: quando a citação apenas RELATA o status do outro
// documento (ex.: "os ADRs aguardando aceite são 014, 015...") em vez de
// depender dele, declare na mesma seção:
//
//   <!-- cita-proposto-ok: <arquivo-ou-id> — motivo -->
//
// ESCOPO — só o lado que CITA é filtrado. Os status são indexados na árvore
// inteira, inclusive nas pastas legadas, porque é lá que os ADRs vivem hoje.
// Ficam fora do lado citante: logs/ (registros históricos imutáveis, que
// citam ADRs como fato do passado) e archive/ (documentos superados).
//
// Uso:
//   bun scripts/validate-state.mjs
//   bun scripts/validate-state.mjs --strict   # inclui projects/ no lado citante
//   (compatível com node >= 20: node scripts/validate-state.mjs)
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

const IGNORAR_TOP = new Set([".git", "node_modules", "dist"]);
const FORA_DO_LADO_CITANTE = new Set(["logs", "archive"]);

const NORMATIVOS = new Set(["vigente", "aprovado", "aceito"]);
const NAO_ACEITOS = new Set(["proposto", "rascunho"]);

function coletar() {
  const resultado = [];
  (function andar(dir) {
    let entradas;
    try { entradas = fs.readdirSync(dir, { withFileTypes: true }); }
    catch { return; }
    for (const ent of entradas) {
      const abs = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (dir === RAIZ && IGNORAR_TOP.has(ent.name)) continue;
        andar(abs);
      } else if (ent.isFile() && ent.name.toLowerCase().endsWith(".md")) {
        resultado.push(abs);
      }
    }
  })(RAIZ);
  return resultado;
}

// Extrai o status de um documento. Aceita as duas convenções vivas no Shizune:
// frontmatter v2 (`status: proposto`) e o cabeçalho dos ADRs legados
// (`**Status:** Aprovado` / `- **Status**: \`Proposto\``).
function lerStatus(texto) {
  const mFm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(texto);
  if (mFm) {
    const mSt = /^status:\s*(.+)$/m.exec(mFm[1]);
    if (mSt) return mSt[1].trim().toLowerCase().replace(/[`'"]/g, "");
  }
  // ADR legado: o status vive no cabeçalho, nas primeiras linhas. Buscar no
  // documento inteiro seria errado em catálogos como DECISOES.md, que embutem
  // o corpo de vários ADRs — o primeiro `**Status**` encontrado lá é de OUTRO
  // documento, não do catálogo.
  const cabecalho = texto.split(/\r?\n/).slice(0, 15).join("\n");
  const mLeg = /^[-*]?\s*\*\*Status:?\*\*:?\s*(.+)$/m.exec(cabecalho);
  if (mLeg) {
    const bruto = mLeg[1].trim().toLowerCase().replace(/[`'"]/g, "");
    if (/^superado/.test(bruto)) return "superado";
    const primeira = bruto.split(/[\s(—-]/)[0];
    return primeira;
  }
  return null;
}

const docs = new Map(); // caminho relativo normalizado -> { status, abs }
const todos = coletar();
for (const abs of todos) {
  let texto;
  try { texto = fs.readFileSync(abs, "utf8"); } catch { continue; }
  docs.set(rel(abs).replace(/\\/g, "/"), { status: lerStatus(texto), abs });
}

let totalArestas = 0;

function verificarArquivo(abs) {
  const caminho = rel(abs).replace(/\\/g, "/");
  const meu = docs.get(caminho);
  if (!meu || !NORMATIVOS.has(meu.status ?? "")) return; // só o que está em vigor cita norma

  let texto;
  try { texto = fs.readFileSync(abs, "utf8"); } catch { return; }

  // Documento GERADO não cita: ele cataloga. Um índice lista todo documento
  // com o status dele — apontar `proposto` ali é relatar, não depender. E uma
  // declaração de escape seria apagada na próxima regeneração.
  if (/<!--\s*GERADO por /i.test(texto)) return;

  const declaradasAqui = new Map();
  const reDecl = /<!--\s*cita-proposto-ok:\s*([^\s—-][^—\n]*?)\s*(?:—|--)\s*([^>]*?)\s*-->/g;
  let d;
  while ((d = reDecl.exec(texto)) !== null) declaradasAqui.set(d[1].trim(), d[2].trim());

  const linhas = texto.split(/\r?\n/);
  let cerca = null;

  linhas.forEach((linhaBruta, idx) => {
    const n = idx + 1;
    const mCerca = /^\s*(`{3,}|~{3,})/.exec(linhaBruta);
    if (mCerca) {
      const tipo = mCerca[1][0], tam = mCerca[1].length;
      if (!cerca) cerca = { tipo, tam };
      else if (tipo === cerca.tipo && tam >= cerca.tam && /^\s*(`{3,}|~{3,})\s*$/.test(linhaBruta)) cerca = null;
      return;
    }
    if (cerca) return;
    if (/^\s*<!--/.test(linhaBruta)) return;

    const reLink = /\[[^\]]*\]\(([^)\s]+)\)/g;
    let m;
    while ((m = reLink.exec(linhaBruta)) !== null) {
      let alvo = m[1].trim();
      if (/^(https?:|mailto:|tel:|file:)/i.test(alvo)) continue;
      const hash = alvo.indexOf("#");
      if (hash >= 0) alvo = alvo.slice(0, hash);
      if (alvo === "" || /[<>]/.test(alvo) || !alvo.toLowerCase().endsWith(".md")) continue;

      const resolvido = path.resolve(path.dirname(abs), alvo);
      const chave = rel(resolvido).replace(/\\/g, "/");
      const destino = docs.get(chave);
      if (!destino || !destino.status) continue;

      totalArestas++;
      if (!NAO_ACEITOS.has(destino.status)) continue;

      const base = path.basename(chave);
      const motivo = declaradasAqui.get(base) ?? declaradasAqui.get(chave);
      if (motivo !== undefined) {
        declaradas.push(`${caminho}:${n} — cita \`${base}\` (${destino.status}) — ${motivo}`);
        continue;
      }

      erros.push(
        `${caminho}:${n} [${meu.status}] cita como norma ${chave} [${destino.status}]` +
        ` — aceite o documento, remova a dependência, ou declare com` +
        ` <!-- cita-proposto-ok: ${base} — motivo -->`,
      );
    }
  });
}

console.log(`validate-state — raiz: ${RAIZ}`);
console.log(`Modo: ${ESTRITO ? "estrito (--strict)" : "padrão"}\n`);

for (const abs of todos) {
  const topo = rel(abs).replace(/\\/g, "/").split("/")[0];
  if (FORA_DO_LADO_CITANTE.has(topo)) continue;
  if (!ESTRITO && topo === "projects") continue;
  verificarArquivo(abs);
}

if (erros.length) {
  console.log(`DEPENDÊNCIA DE DOCUMENTO NÃO ACEITO (${erros.length}):`);
  for (const e of erros) console.log(`  [ERRO] ${e}`);
  console.log("");
}
if (declaradas.length) {
  console.log(`CITAÇÕES DECLARADAS (${declaradas.length}) — aceitas, registradas:`);
  for (const a of declaradas) console.log(`  [OK] ${a}`);
  console.log("");
}

const semStatus = [...docs.values()].filter((d) => !d.status).length;
console.log(`Resumo: ${docs.size} documento(s) indexados (${semStatus} sem status legível), ` +
  `${totalArestas} aresta(s) de citação analisada(s), ${erros.length} inválida(s), ` +
  `${declaradas.length} declarada(s).`);
console.log(erros.length ? "Resultado: FALHA" : "Resultado: OK");
process.exit(erros.length ? 1 : 0);

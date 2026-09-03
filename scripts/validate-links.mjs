// ---------------------------------------------------------------------------
// validate-links.mjs — Verifica links markdown de todos os .md do Shizune.
//
// Erro (exit 1): link relativo cujo alvo não existe no disco.
// Avisos (não falham): links absolutos (file:/// ou <unidade>:\...), âncoras
// não verificáveis (#secao) e casing "dev" minúsculo após letra de unidade
// (o padrão da unidade de desenvolvimento é "Dev" com D maiúsculo).
// Ignora: URLs http(s)/mailto, blocos de código cercados (```), trechos em
// código inline (`...`), placeholders com <>, e as pastas archive/, dist/,
// .git/ e node_modules/.
//
// Uso (funciona a partir de qualquer diretório; a raiz do Shizune é resolvida
// como a pasta pai de scripts/):
//   bun scripts/validate-links.mjs
//   (compatível com node >= 20: node scripts/validate-links.mjs)
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
const erros = [];
const avisos = [];
const rel = (abs) => path.relative(RAIZ, abs) || ".";

const IGNORAR_TOP = new Set(["archive", "dist", ".git", "node_modules"]);

function coletarMd() {
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

let totalLinks = 0;

function verificarArquivo(abs) {
  const caminho = rel(abs);
  let texto;
  try { texto = fs.readFileSync(abs, "utf8"); }
  catch (e) { erros.push(`${caminho} — falha de leitura: ${e.message}`); return; }

  const linhas = texto.split(/\r?\n/);
  let cerca = null; // bloco de código cercado aberto: { tipo: "`"|"~", tam }

  linhas.forEach((linhaBruta, idx) => {
    const n = idx + 1;
    const mCerca = /^\s*(`{3,}|~{3,})/.exec(linhaBruta);
    if (mCerca) {
      const tipo = mCerca[1][0];
      const tam = mCerca[1].length;
      if (!cerca) {
        cerca = { tipo, tam };
      } else if (tipo === cerca.tipo && tam >= cerca.tam && /^\s*(`{3,}|~{3,})\s*$/.test(linhaBruta)) {
        cerca = null;
      }
      return;
    }
    if (cerca) return;

    // remove código inline para não validar exemplos de sintaxe
    const linha = linhaBruta.replace(/`[^`]*`/g, "");

    const reLink = /\[[^\]]*\]\(([^)]+)\)/g;
    let m;
    while ((m = reLink.exec(linha)) !== null) {
      let alvo = m[1].trim();
      const mTitulo = /^(\S+)\s+"[^"]*"$/.exec(alvo); // [t](arquivo.md "Título")
      if (mTitulo) alvo = mTitulo[1];
      if (alvo.startsWith("<") && alvo.endsWith(">")) alvo = alvo.slice(1, -1);
      if (alvo === "" || /^(https?:|mailto:|tel:)/i.test(alvo)) continue;
      totalLinks++;

      // absolutos: aviso, sem verificação de existência
      if (/^file:\/\//i.test(alvo) || /^[A-Za-z]:[\\/]/.test(alvo)) {
        avisos.push(`${caminho}:${n} — link absoluto (prefira caminho relativo): ${alvo}`);
        if (/[A-Za-z]:[\\/]dev([\\/]|$)/.test(alvo)) {
          avisos.push(`${caminho}:${n} — casing incorreto: "dev" minúsculo após a letra da unidade (o padrão é "Dev", ex.: D:\\Dev)`);
        }
        continue;
      }

      const hash = alvo.indexOf("#");
      let parteArquivo = hash >= 0 ? alvo.slice(0, hash) : alvo;
      if (hash >= 0) avisos.push(`${caminho}:${n} — âncora não verificável: ${alvo}`);
      if (parteArquivo === "") continue; // âncora pura (#secao)
      if (/[<>]/.test(parteArquivo)) continue; // placeholder de template
      try { parteArquivo = decodeURIComponent(parteArquivo); } catch { /* mantém como está */ }

      const resolvido = parteArquivo.startsWith("/")
        ? path.join(RAIZ, parteArquivo)
        : path.resolve(path.dirname(abs), parteArquivo);

      // Link que sai da raiz do repositório aponta para OUTRO repositório na
      // máquina de quem escreveu — tipicamente `../../../../Dev/<projeto>/…`.
      // Ele é verificável lá e impossível de verificar em qualquer outro lugar:
      // no CI, num clone raso, na máquina de outra pessoa. Chamar isso de "alvo
      // inexistente" é afirmar mais do que se sabe; o que se sabe é que o alvo
      // não pertence a este repositório. Por isso é AVISO e não erro — e é a
      // classe de falha que só aparecia no CI, porque na máquina do autor o
      // caminho existe de verdade.
      const foraDaRaiz = (() => {
        const r = path.relative(RAIZ, resolvido);
        return r.startsWith("..") || path.isAbsolute(r);
      })();
      if (foraDaRaiz) {
        avisos.push(`${caminho}:${n} — externo ao repositório, não verificável daqui: ${alvo}`);
        continue;
      }

      if (!fs.existsSync(resolvido)) {
        erros.push(`${caminho}:${n} — link quebrado: alvo inexistente "${alvo}" (resolvido para ${rel(resolvido)})`);
      }
    }
  });
}

console.log(`validate-links — raiz: ${RAIZ}`);
const mds = coletarMd();
for (const abs of mds) verificarArquivo(abs);

if (erros.length) {
  console.log(`\nLINKS QUEBRADOS (${erros.length}):`);
  for (const e of erros) console.log(`  [ERRO] ${e}`);
}
if (avisos.length) {
  console.log(`\nAVISOS (${avisos.length}):`);
  for (const a of avisos) console.log(`  [AVISO] ${a}`);
}

console.log(`\nResumo: ${mds.length} arquivo(s) .md verificados, ${totalLinks} link(s) analisados, ` +
  `${erros.length} link(s) quebrado(s), ${avisos.length} aviso(s).`);
console.log(erros.length ? "Resultado: FALHA" : "Resultado: OK");
process.exit(erros.length ? 1 : 0);

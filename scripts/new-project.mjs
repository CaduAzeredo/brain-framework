// ---------------------------------------------------------------------------
// new-project.mjs — Cria a estrutura de um novo projeto no Shizune (ADR-016).
//
// Uso (funciona a partir de qualquer diretório; a raiz do Shizune é resolvida
// como a pasta pai de scripts/):
//   bun scripts/new-project.mjs <slug>
//   (compatível com node >= 20: node scripts/new-project.mjs <slug>)
//
// O que faz:
//   1. valida o slug (^[a-z][a-z0-9-]{1,30}$, sem acento) e recusa slug já
//      registrado em governance/registro-projetos.yaml;
//   2. cria projects/<slug>/{CONTEXT.md,DOMAIN.md} a partir do corpo do bloco
//      ```markdown dos templates em templates/projeto/, substituindo os
//      placeholders de slug e data;
//   3. cria projects/<slug>/{specs,tickets,handoffs}/ com .gitkeep;
//   4. adiciona a entrada no registro (status: ativo) e atualiza "atualizado:";
//   5. imprime os próximos passos (grill-with-docs).
// ---------------------------------------------------------------------------

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

function raizDoShizune() {
  let p = decodeURIComponent(new URL(".", import.meta.url).pathname);
  if (/^\/[A-Za-z]:/.test(p)) p = p.slice(1);
  return path.resolve(p, "..");
}

// Autor padrão dos documentos gerados. Nome de produto de terceiro não entra em
// campo de dados (ADR-028 §2): quem clona o framework não deve herdar, carimbada
// nos próprios documentos, a marca da ferramenta que o autor original usava.
// Sobrescreva com a variável de ambiente SHIZUNE_AUTOR.
//
// BRAIN_AUTOR continua sendo lida, por compatibilidade: ela é contrato público
// desde antes do renome, e trocar sem aceitar a antiga quebraria em silêncio —
// o script cairia no padrão sem avisar que ignorou a variável de quem já a tinha
// configurada. Quando só a antiga estiver presente, o aviso sai na saída.
const AUTOR = process.env.SHIZUNE_AUTOR || process.env.BRAIN_AUTOR || "shizune";
if (!process.env.SHIZUNE_AUTOR && process.env.BRAIN_AUTOR) {
  console.warn("aviso: BRAIN_AUTOR está obsoleta e foi renomeada para SHIZUNE_AUTOR; ainda é lida, mas prefira a nova.");
}

const RAIZ = raizDoShizune();
const rel = (abs) => path.relative(RAIZ, abs) || ".";

function falhar(msg) {
  console.error(`[ERRO] ${msg}`);
  process.exit(1);
}

function hojeIso() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// Extrai o corpo do primeiro bloco ```markdown (cerca de 3+ crases; fecha em
// cerca de comprimento igual ou maior — os templates usam 4 crases para poder
// aninhar blocos de 3 crases no corpo).
function extrairCorpoMarkdown(texto, caminho) {
  const linhas = texto.split(/\r?\n/);
  let inicio = -1;
  let tamCerca = 0;
  for (let i = 0; i < linhas.length; i++) {
    const m = /^(`{3,})markdown\s*$/.exec(linhas[i]);
    if (m) { inicio = i + 1; tamCerca = m[1].length; break; }
  }
  if (inicio < 0) falhar(`${caminho} — bloco de template (cerca "markdown") não encontrado`);
  for (let j = inicio; j < linhas.length; j++) {
    const m = /^(`{3,})\s*$/.exec(linhas[j]);
    if (m && m[1].length >= tamCerca) {
      return linhas.slice(inicio, j).join("\n") + "\n";
    }
  }
  falhar(`${caminho}:${inicio} — bloco de template não fechado (cerca final ausente)`);
}

function preencher(corpo, slug, hoje) {
  return corpo
    .replaceAll("<slug-do-projeto>", slug)
    .replaceAll("<slug>", slug)
    .replaceAll("<aaaa-mm-dd>", hoje)
    .replaceAll("<data>", hoje)
    .replaceAll("<autor>", AUTOR);
}

// --- validação do slug -------------------------------------------------------

const slug = process.argv[2];
if (!slug) {
  falhar("uso: bun scripts/new-project.mjs <slug>  (slug kebab-case, ex.: meu-projeto)");
}
if (!/^[a-z][a-z0-9-]{1,30}$/.test(slug)) {
  falhar(`slug inválido: "${slug}" — exigido ^[a-z][a-z0-9-]{1,30}$ (minúsculas, dígitos e hífen, sem acento, 2 a 31 caracteres)`);
}

// --- registro ----------------------------------------------------------------

const registroPath = path.join(RAIZ, "governance", "registro-projetos.yaml");
if (!fs.existsSync(registroPath)) {
  falhar(`${rel(registroPath)} — registro de projetos não encontrado`);
}
const registroTexto = fs.readFileSync(registroPath, "utf8");
const slugsExistentes = [];
for (const l of registroTexto.split(/\r?\n/)) {
  const m = /^\s*-\s+slug:\s*(.+)$/.exec(l);
  if (m) slugsExistentes.push(m[1].trim().replace(/^['"]|['"]$/g, ""));
}
if (slugsExistentes.includes(slug)) {
  falhar(`slug "${slug}" já registrado em ${rel(registroPath)} — escolha outro ou reative o projeto existente`);
}

const dirProjeto = path.join(RAIZ, "projects", slug);
if (fs.existsSync(dirProjeto)) {
  falhar(`${rel(dirProjeto)} — a pasta já existe; remova-a ou escolha outro slug`);
}

// --- templates ---------------------------------------------------------------

const hoje = hojeIso();
const arquivos = [
  { template: path.join(RAIZ, "templates", "projeto", "CONTEXT.md"), destino: "CONTEXT.md" },
  { template: path.join(RAIZ, "templates", "projeto", "DOMAIN.md"), destino: "DOMAIN.md" },
];
const conteudos = [];
for (const { template, destino } of arquivos) {
  if (!fs.existsSync(template)) {
    falhar(`${rel(template)} — template não encontrado (necessário para gerar ${destino})`);
  }
  const corpo = extrairCorpoMarkdown(fs.readFileSync(template, "utf8"), rel(template));
  conteudos.push({ destino, texto: preencher(corpo, slug, hoje) });
}

// --- criação -----------------------------------------------------------------

fs.mkdirSync(dirProjeto, { recursive: true });
for (const { destino, texto } of conteudos) {
  fs.writeFileSync(path.join(dirProjeto, destino), texto, "utf8");
}
for (const sub of ["specs", "tickets", "handoffs"]) {
  const dirSub = path.join(dirProjeto, sub);
  fs.mkdirSync(dirSub, { recursive: true });
  fs.writeFileSync(path.join(dirSub, ".gitkeep"), "", "utf8");
}

// --- atualização do registro -------------------------------------------------

const nomeExibicao = slug
  .split("-")
  .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
  .join(" ");
let novoRegistro = registroTexto.replace(/^atualizado:.*$/m, `atualizado: ${hoje}`);
// Semente do framework usa "projetos: []"; no primeiro projeto a lista vazia
// literal vira lista YAML de verdade.
novoRegistro = novoRegistro.replace(/^projetos:\s*\[\]\s*$/m, "projetos:");
if (!novoRegistro.endsWith("\n")) novoRegistro += "\n";
novoRegistro +=
  `\n  - slug: ${slug}\n` +
  `    nome: ${nomeExibicao}\n` +
  `    status: ativo\n` +
  `    repo: null\n` +
  `    ficha: projects/${slug}/CONTEXT.md\n`;
fs.writeFileSync(registroPath, novoRegistro, "utf8");

// --- próximos passos ---------------------------------------------------------

console.log(`Projeto "${slug}" criado em ${rel(dirProjeto)}.`);
console.log("");
console.log("Criado:");
console.log(`  - projects/${slug}/CONTEXT.md   (ficha — preencher)`);
console.log(`  - projects/${slug}/DOMAIN.md    (domínio — preencher)`);
console.log(`  - projects/${slug}/{specs,tickets,handoffs}/ (vazias, com .gitkeep)`);
console.log(`  - entrada "${slug}" (status: ativo) em governance/registro-projetos.yaml`);
console.log("");
console.log("Próximos passos:");
console.log("  1. Rode a skill grill-with-docs (skills/core-pipeline/grill-with-docs/) para");
console.log("     entrevistar o operador e preencher CONTEXT.md e DOMAIN.md — nada de placeholders.");
console.log("  2. Siga o pipeline: domain-modeling -> to-spec -> implement -> handoff.");
console.log("  3. Ajuste nome/repo no registro se necessário e valide:");
console.log("     bun scripts/validate-structure.mjs && bun scripts/build-index.mjs");
process.exit(0);

// ---------------------------------------------------------------------------
// build-index.mjs — Gera os índices derivados do frontmatter v2 (ADR-018).
//
// Saídas (ambas com cabeçalho de arquivo gerado — não editar à mão):
//   governance/INDICE.md — tabela id/tipo/projeto/status/data/caminho de todos
//     os .md com frontmatter das pastas novas e da raiz;
//   skills/README.md — catálogo das skills a partir dos SKILL.md (name,
//     categoria = pasta pai, description, caminho) + seção fixa "Bibliotecas
//     externas" (references/README.md e nota da biblioteca vendor — ADR-019).
//
// Uso (funciona a partir de qualquer diretório; a raiz do Brain é resolvida
// como a pasta pai de scripts/):
//   bun scripts/build-index.mjs
//   (compatível com node >= 20: node scripts/build-index.mjs)
// ---------------------------------------------------------------------------

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

function raizDoBrain() {
  let p = decodeURIComponent(new URL(".", import.meta.url).pathname);
  if (/^\/[A-Za-z]:/.test(p)) p = p.slice(1);
  return path.resolve(p, "..");
}

// Autor padrão dos documentos gerados. Nome de produto de terceiro não entra em
// campo de dados (ADR-028 §2): quem clona o framework não deve herdar, carimbada
// nos próprios documentos, a marca da ferramenta que o autor original usava.
// Sobrescreva com a variável de ambiente BRAIN_AUTOR.
const AUTOR = process.env.BRAIN_AUTOR || "brain-framework";

const RAIZ = raizDoBrain();
const rel = (abs) => path.relative(RAIZ, abs) || ".";
const relPosix = (abs) => rel(abs).split(path.sep).join("/");

function falhar(msg) {
  console.error(`[ERRO] ${msg}`);
  process.exit(1);
}

function hojeIso() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// Parser próprio de frontmatter (mesmo contrato de validate-structure.mjs):
// bloco "---" ... "---" no topo, chaves planas, tolera comentário HTML inicial.
function parseFrontmatter(texto) {
  const linhas = texto.split(/\r?\n/);
  let i = 0;
  while (i < linhas.length &&
         (linhas[i].trim() === "" || /^<!--.*-->$/.test(linhas[i].trim()))) i++;
  if (i >= linhas.length || linhas[i].trim() !== "---") return null;
  const campos = new Map();
  for (let j = i + 1; j < linhas.length; j++) {
    const bruta = linhas[j];
    if (bruta.trim() === "---") return campos;
    if (bruta.trim() === "") continue;
    const m = /^([A-Za-z][A-Za-z0-9_-]*):\s?(.*)$/.exec(bruta);
    if (!m) return null;
    let valor = m[2].trim();
    if ((valor.startsWith('"') && valor.endsWith('"') && valor.length >= 2) ||
        (valor.startsWith("'") && valor.endsWith("'") && valor.length >= 2)) {
      valor = valor.slice(1, -1);
    }
    campos.set(m[1], valor);
  }
  return null; // não fechado
}

const PASTAS_NOVAS = [
  "skills", "projects", "examples", "agents", "templates", "governance",
  "docs", "metrics", "references",
];
// Arquivos de raiz da arvore legada DESTA instancia (ver validate-structure.mjs).
// Ausente = zero legado, que e o estado de um repositorio novo.
const ARQUIVOS_LEGADOS_RAIZ = new Set((() => {
  const arq = path.join(RAIZ, "governance", "legacy-tree.json");
  if (!fs.existsSync(arq)) return [];
  try {
    const j = JSON.parse(fs.readFileSync(arq, "utf8"));
    return Array.isArray(j.root_files) ? j.root_files : [];
  } catch { return []; }
})());

const CABECALHO_GERADO = "<!-- GERADO por scripts/build-index.mjs — não editar à mão -->";
const HOJE = hojeIso();

function frontmatterIndice(id) {
  return [
    "---",
    `id: ${id}`,
    "tipo: indice",
    "projeto: global",
    "status: vigente",
    `data: ${HOJE}`,
    `autor: ${AUTOR}`,
    "---",
  ].join("\n");
}

const arqIndice = path.join(RAIZ, "governance", "INDICE.md");
const arqSkillsReadme = path.join(RAIZ, "skills", "README.md");

if (!fs.existsSync(path.join(RAIZ, "governance"))) falhar("pasta governance/ não encontrada na raiz do Brain");
if (!fs.existsSync(path.join(RAIZ, "skills"))) falhar("pasta skills/ não encontrada na raiz do Brain");

// --- coleta dos documentos ---------------------------------------------------

const gerados = new Set([arqIndice, arqSkillsReadme]);
const documentos = [];
let ignorados = 0;

// governance/public-package/ e area de staging dos artefatos do GitHub
// (SECURITY, CODE_OF_CONDUCT, template de PR). Eles nao sao documentos do Brain,
// nao carregam frontmatter v2 e nao entram no indice — do mesmo jeito que
// scripts/validate-structure.mjs ja os isenta. Sem esta linha o gerador avisa
// sobre eles toda vez que roda, e aviso que sempre aparece deixa de ser lido.
const STAGING_PUBLICO = path.join(RAIZ, "governance", "public-package");

function coletar(dir) {
  if (dir === STAGING_PUBLICO) return;
  let entradas;
  try { entradas = fs.readdirSync(dir, { withFileTypes: true }); }
  catch { return; }
  for (const ent of entradas) {
    const abs = path.join(dir, ent.name);
    if (ent.isDirectory()) { coletar(abs); continue; }
    if (!ent.isFile() || !ent.name.toLowerCase().endsWith(".md")) continue;
    if (gerados.has(abs)) continue; // entradas sintéticas cobrem os gerados
    const campos = parseFrontmatter(fs.readFileSync(abs, "utf8"));
    if (!campos || !campos.get("id")) {
      ignorados++;
      console.log(`[AVISO] ${rel(abs)} — sem frontmatter v2 legível; fora do índice`);
      continue;
    }
    documentos.push({
      id: campos.get("id"),
      tipo: campos.get("tipo") || "?",
      projeto: campos.get("projeto") || "?",
      status: campos.get("status") || "?",
      data: campos.get("data") || "?",
      caminho: relPosix(abs),
      campos,
    });
  }
}

for (const pasta of PASTAS_NOVAS) {
  const abs = path.join(RAIZ, pasta);
  if (fs.existsSync(abs)) coletar(abs);
}
for (const ent of fs.readdirSync(RAIZ, { withFileTypes: true })) {
  if (!ent.isFile() || !ent.name.toLowerCase().endsWith(".md")) continue;
  if (ARQUIVOS_LEGADOS_RAIZ.has(ent.name)) continue; // legado sem frontmatter (Onda 4)
  const abs = path.join(RAIZ, ent.name);
  const campos = parseFrontmatter(fs.readFileSync(abs, "utf8"));
  if (!campos || !campos.get("id")) {
    ignorados++;
    console.log(`[AVISO] ${rel(abs)} — sem frontmatter v2 legível; fora do índice`);
    continue;
  }
  documentos.push({
    id: campos.get("id"),
    tipo: campos.get("tipo") || "?",
    projeto: campos.get("projeto") || "?",
    status: campos.get("status") || "?",
    data: campos.get("data") || "?",
    caminho: relPosix(abs),
    campos,
  });
}

// Entradas sintéticas dos próprios índices (deterministas desde a 1ª execução)
documentos.push(
  { id: "indice-geral", tipo: "indice", projeto: "global", status: "vigente", data: HOJE, caminho: "governance/INDICE.md" },
  { id: "indice-skills", tipo: "indice", projeto: "global", status: "vigente", data: HOJE, caminho: "skills/README.md" },
);
documentos.sort((a, b) => (a.caminho < b.caminho ? -1 : a.caminho > b.caminho ? 1 : 0));

// --- governance/INDICE.md ----------------------------------------------------

const celula = (v) => String(v).replaceAll("|", "\\|").replaceAll("\n", " ");
const linhasIndice = documentos.map((d) => {
  const alvoRelativo = path.posix.relative("governance", d.caminho);
  return `| ${celula(d.id)} | ${celula(d.tipo)} | ${celula(d.projeto)} | ${celula(d.status)} | ${celula(d.data)} | [${celula(d.caminho)}](${alvoRelativo}) |`;
});

const indiceMd = [
  frontmatterIndice("indice-geral"),
  CABECALHO_GERADO,
  "",
  "# Índice geral do Brain",
  "",
  "Índice gerado dos documentos Markdown com frontmatter v2 (ADR-018) das pastas novas indexáveis e da raiz (`logs/` fica fora: registros imutáveis datados não são documentos vivos).",
  "Para regenerar: `bun scripts/build-index.mjs`.",
  "",
  "| id | tipo | projeto | status | data | caminho |",
  "| --- | --- | --- | --- | --- | --- |",
  ...linhasIndice,
  "",
].join("\n");

// --- skills/README.md --------------------------------------------------------

const skillsDir = path.join(RAIZ, "skills");
const skills = [];
for (const cat of fs.readdirSync(skillsDir, { withFileTypes: true })) {
  if (!cat.isDirectory()) continue;
  const absCat = path.join(skillsDir, cat.name);
  for (const sk of fs.readdirSync(absCat, { withFileTypes: true })) {
    if (!sk.isDirectory()) continue;
    const absSkillMd = path.join(absCat, sk.name, "SKILL.md");
    if (!fs.existsSync(absSkillMd)) {
      console.log(`[AVISO] ${rel(path.join(absCat, sk.name))} — sem SKILL.md; fora do catálogo`);
      continue;
    }
    const campos = parseFrontmatter(fs.readFileSync(absSkillMd, "utf8"));
    const nome = (campos && campos.get("name")) || sk.name;
    let descricao = (campos && campos.get("description")) || "";
    if (descricao.length > 220) descricao = descricao.slice(0, 219).trimEnd() + "…";
    skills.push({
      nome,
      categoria: cat.name,
      descricao,
      caminho: `${cat.name}/${sk.name}/SKILL.md`,
    });
  }
}
skills.sort((a, b) =>
  a.categoria === b.categoria
    ? (a.nome < b.nome ? -1 : 1)
    : (a.categoria < b.categoria ? -1 : 1));

const linhasSkills = skills.map((s) =>
  `| [${celula(s.nome)}](${s.caminho}) | ${celula(s.categoria)} | ${celula(s.descricao)} | \`${s.caminho}\` |`);

const skillsMd = [
  frontmatterIndice("indice-skills"),
  CABECALHO_GERADO,
  "",
  "# Catálogo de skills",
  "",
  "Catálogo gerado a partir dos `SKILL.md` desta pasta (name, categoria, description).",
  "Para regenerar: `bun scripts/build-index.mjs`.",
  "",
  "| Skill | Categoria | Descrição | Caminho |",
  "| --- | --- | --- | --- |",
  ...linhasSkills,
  "",
  "## Bibliotecas externas",
  "",
  "Referências e bibliotecas de terceiros são catalogadas em [references/README.md](../references/README.md).",
  "Bibliotecas vendor de skills de terceiros permanecem fora do framework por política de licenciamento; o catálogo de referências aponta onde cada acervo vive.",
  "",
].join("\n");

// --- escrita -----------------------------------------------------------------

fs.writeFileSync(arqIndice, indiceMd, "utf8");
fs.writeFileSync(arqSkillsReadme, skillsMd, "utf8");

console.log(`Gerado: ${rel(arqIndice)} (${documentos.length} documento(s) indexados)`);
console.log(`Gerado: ${rel(arqSkillsReadme)} (${skills.length} skill(s) catalogadas)`);
if (ignorados) {
  console.log(`[AVISO] ${ignorados} arquivo(s) .md fora do índice por falta de frontmatter v2 — rode bun scripts/validate-structure.mjs`);
}
process.exit(0);

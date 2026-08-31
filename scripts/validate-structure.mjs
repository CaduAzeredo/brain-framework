// ---------------------------------------------------------------------------
// validate-structure.mjs — Valida a estrutura da árvore do Brain v2.
//
// Verifica:
//   (a) raiz contém apenas o conjunto permitido de arquivos e pastas (ADR-016);
//   (b) projects/ consistente com governance/registro-projetos.yaml;
//   (c) frontmatter v2 (ADR-018) em todo .md das pastas novas e da raiz;
//   (d) toda pasta de skill tem SKILL.md com name idêntico à pasta e description
//       não vazia;
//   (e) varredura de segredos em todos os arquivos de texto (erro fatal).
//
// Uso (funciona a partir de qualquer diretório; a raiz do Brain é resolvida
// como a pasta pai de scripts/):
//   bun scripts/validate-structure.mjs            # modo padrão
//   bun scripts/validate-structure.mjs --strict   # modo estrito
//   (compatível com node >= 20: node scripts/validate-structure.mjs)
//
// Modo padrão: pastas legadas, logs/ e archive/ ficam fora da checagem de
// frontmatter. Modo --strict: só archive/ fica de fora (Onda 4 encerra com
// este modo verde). Em ambos, .git/, .claude/, dist/ e node_modules/ são
// estruturais/gerados e não entram na checagem de frontmatter.
//
// Saída: relatório de erros e avisos; exit code 1 se houver qualquer erro.
//
// Nota de segurança: os padrões de segredo são montados por CONCATENAÇÃO de
// strings para que a varredura não detecte a si mesma neste arquivo (e para
// que a redação do export público, que varre scripts/**, também não).
// ---------------------------------------------------------------------------

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

// --- localização da raiz -----------------------------------------------------

function raizDoBrain() {
  let p = decodeURIComponent(new URL(".", import.meta.url).pathname);
  if (/^\/[A-Za-z]:/.test(p)) p = p.slice(1); // Windows: "/D:/..." -> "D:/..."
  return path.resolve(p, "..");
}

const RAIZ = raizDoBrain();
const ESTRITO = process.argv.includes("--strict");

const erros = [];
const avisos = [];
const erro = (m) => erros.push(m);
const aviso = (m) => avisos.push(m);
const rel = (abs) => path.relative(RAIZ, abs) || ".";

// --- conjuntos canônicos (ADR-016 / ADR-018) --------------------------------

const PASTAS_LEGADAS = new Set([
  "00-governanca", "01-ambiente-local", "02-projetos", "03-operacao-agentes",
  "04-guia-real", "05-evidencias", "06-pesquisa-orca", "07-empresa-e-metricas",
  "99-arquivo", "claude-max",
]);
const ARQUIVOS_LEGADOS_RAIZ = new Set(["BACKLOG-MESTRE.md", "DECISOES.md"]);

const PERMITIDOS_RAIZ = new Set([
  // arquivos canônicos
  "README.md", "README-PUBLICO.md", "QUICKSTART.md", "AGENTS.md",
  "AGENTS-PUBLICO.md", "CLAUDE.md",
  "CONTEXT.md", "DOMAIN.md", "CONTRIBUTING.md", "CHANGELOG.md",
  "MAPA-MIGRACAO.md", "LICENSE", "NOTICE",
  // arquivos de comunidade do pacote publico (ADR-038)
  "SECURITY.md", "CODE_OF_CONDUCT.md", ".github",
  ".gitignore", ".gitattributes", ".mcp.json", ".claude", ".git",
  // pastas canônicas
  "skills", "projects", "examples", "agents", "templates", "governance",
  "docs", "metrics", "references", "logs", "scripts", "archive", "dist",
  // legado tolerado até a Onda 3
  ...PASTAS_LEGADAS, ...ARQUIVOS_LEGADOS_RAIZ,
]);

const PASTAS_NOVAS = [
  "skills", "projects", "examples", "agents", "templates", "governance",
  "docs", "metrics", "references",
];

const CAMPOS_V2 = ["id", "tipo", "projeto", "status", "data", "autor"];
const TIPOS = new Set([
  "decisao", "mapa", "ficha", "memoria-agente", "handoff", "status",
  "relatorio", "processo", "skill", "template", "referencia", "indice",
  "exemplo", "guia",
]);
const STATUS_DOC = new Set(["vigente", "proposto", "pausado", "superado", "arquivado", "bloqueado"]);
// Autor: identificador genérico em kebab-case. O framework não impõe uma lista
// fechada de autores — cada instância tem os seus (o ADR-018 da instância
// documenta os autores conhecidos dela); o validador só exige o formato.
const AUTOR_PADRAO = /^[a-z][a-z0-9-]{1,30}$/;

// --- utilitários -------------------------------------------------------------

function dataIsoValida(v) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (!m) return false;
  const mes = Number(m[2]);
  const dia = Number(m[3]);
  return mes >= 1 && mes <= 12 && dia >= 1 && dia <= 31;
}

function limparValor(v) {
  let s = v.trim();
  if ((s.startsWith('"') && s.endsWith('"') && s.length >= 2) ||
      (s.startsWith("'") && s.endsWith("'") && s.length >= 2)) s = s.slice(1, -1);
  return s;
}

// Parser próprio de frontmatter: bloco "---" ... "---" no topo, chaves planas
// "chave: valor", linha a linha (sem lib YAML). Tolera linhas de comentário
// HTML antes do bloco (arquivos gerados por build-index.mjs usam cabeçalho
// "<!-- GERADO ... -->" na primeira linha).
function parseFrontmatter(texto, caminho) {
  const linhas = texto.split(/\r?\n/);
  let i = 0;
  while (i < linhas.length &&
         (linhas[i].trim() === "" || /^<!--.*-->$/.test(linhas[i].trim()))) i++;
  if (i >= linhas.length || linhas[i].trim() !== "---") {
    return { erro: `${caminho}:1 — frontmatter ausente (bloco "---" não encontrado no topo)` };
  }
  const campos = new Map();
  const ordem = [];
  let fechado = false;
  let j = i + 1;
  for (; j < linhas.length; j++) {
    const bruta = linhas[j];
    if (bruta.trim() === "---") { fechado = true; break; }
    if (bruta.trim() === "") continue;
    const m = /^([A-Za-z][A-Za-z0-9_-]*):\s?(.*)$/.exec(bruta);
    if (!m) {
      return { erro: `${caminho}:${j + 1} — linha inválida no frontmatter (esperado "chave: valor"): ${JSON.stringify(bruta)}` };
    }
    if (campos.has(m[1])) {
      return { erro: `${caminho}:${j + 1} — chave duplicada no frontmatter: ${m[1]}` };
    }
    campos.set(m[1], limparValor(m[2]));
    ordem.push(m[1]);
  }
  if (!fechado) return { erro: `${caminho} — frontmatter não fechado ("---" final ausente)` };
  return { campos, ordem };
}

// --- (a) raiz ----------------------------------------------------------------

function verificarRaiz() {
  for (const ent of fs.readdirSync(RAIZ, { withFileTypes: true })) {
    if (!PERMITIDOS_RAIZ.has(ent.name)) {
      erro(`${ent.name} — item não permitido na raiz do Brain (ADR-016): mova para uma pasta canônica ou para archive/`);
    }
  }
}

// --- (b) projects x registro -------------------------------------------------

function lerRegistro() {
  const arq = path.join(RAIZ, "governance", "registro-projetos.yaml");
  const caminho = rel(arq);
  if (!fs.existsSync(arq)) {
    erro(`${caminho} — arquivo não encontrado (obrigatório para validar projects/ e o enum de projeto)`);
    return null;
  }
  const linhas = fs.readFileSync(arq, "utf8").split(/\r?\n/);
  const projetos = [];
  let atual = null;
  linhas.forEach((l, i) => {
    const mSlug = /^\s*-\s+slug:\s*(.+)$/.exec(l);
    if (mSlug) {
      atual = { slug: limparValor(mSlug[1]), status: null, linha: i + 1 };
      projetos.push(atual);
      return;
    }
    const mStatus = /^\s+status:\s*(.+)$/.exec(l);
    if (mStatus && atual) atual.status = limparValor(mStatus[1]);
  });
  if (projetos.length === 0) aviso(`${caminho} — nenhum projeto encontrado no registro (linhas "- slug:")`);
  return projetos;
}

function verificarProjetos(registro) {
  const slugs = registro ? new Set(registro.map((p) => p.slug)) : null;
  const dirProjects = path.join(RAIZ, "projects");
  const pastas = [];
  if (fs.existsSync(dirProjects)) {
    for (const ent of fs.readdirSync(dirProjects, { withFileTypes: true })) {
      if (!ent.isDirectory()) continue;
      pastas.push(ent.name);
      if (slugs && !slugs.has(ent.name)) {
        erro(`projects${path.sep}${ent.name} — slug não registrado em governance${path.sep}registro-projetos.yaml`);
      }
      if (!fs.existsSync(path.join(dirProjects, ent.name, "CONTEXT.md"))) {
        erro(`projects${path.sep}${ent.name} — CONTEXT.md ausente (ficha obrigatória do projeto)`);
      }
    }
  }
  if (registro) {
    for (const p of registro) {
      if (p.status === "ativo" && !pastas.includes(p.slug)) {
        erro(`governance${path.sep}registro-projetos.yaml:${p.linha} — projeto ativo "${p.slug}" sem pasta projects${path.sep}${p.slug}`);
      }
    }
  }
}

// --- caminhos especiais ------------------------------------------------------

const STAGING_PUBLICO = path.join("governance", "public-package");
const INBOX_BRUTO = path.join("archive", "inbox");

const ehStagingPublico = (abs) => rel(abs).startsWith(STAGING_PUBLICO + path.sep);
const ehInboxBruto = (abs) => rel(abs).startsWith(INBOX_BRUTO + path.sep);

// Artefatos de vitrine e de comunidade: o GitHub renderiza frontmatter YAML de
// .md como TABELA, e uma tabela de metadados acima do titulo do README e a
// primeira coisa que um visitante ve. Por isso o export poda o bloco desses
// arquivos, e por isso eles chegam ao pacote publico sem frontmatter.
//
// Aqui o frontmatter e OPCIONAL, nao dispensado: se o arquivo tiver o bloco, ele
// e validado como qualquer outro — a instancia privada, onde esses arquivos TEM
// frontmatter, continua coberta. Se nao tiver, nao e erro. Sem isso o validador
// reprova o proprio pacote que o projeto publica, e o primeiro comando que o
// QUICKSTART manda rodar falha para todo usuario novo.
const FRONTMATTER_OPCIONAL = new Set([
  "README.md", "AGENTS.md", "QUICKSTART.md", "CONTRIBUTING.md", "CHANGELOG.md",
  "SECURITY.md", "CODE_OF_CONDUCT.md",
]);
const DIR_GITHUB = ".github";

function frontmatterEhOpcional(abs) {
  const r = rel(abs);
  if (r.startsWith(DIR_GITHUB + path.sep)) return true;
  return !r.includes(path.sep) && FRONTMATTER_OPCIONAL.has(r);
}

// O rebaixamento de erro para aviso em archive/inbox/ vale por UMA razao: a pasta
// esta no .gitignore, entao um segredo ali nao alcanca o controle de versao. Essa
// premissa e verdadeira nesta instancia — e falsa no dia um de qualquer instancia
// criada a partir do pacote publico, se o .gitignore de la nao trouxer a linha.
//
// Premissa que o codigo assume sem checar e premissa que cai em silencio. Aqui ela
// e verificada contra o proprio git, uma vez por execucao. Sem git, sem repositorio,
// ou pasta nao ignorada: o rebaixamento nao se aplica e a ocorrencia volta a ser
// erro fatal. Falhar fechado e o unico default aceitavel para varredura de segredo.
let _inboxIgnoradoCache = null;
function inboxRealmenteIgnorado() {
  if (_inboxIgnoradoCache !== null) return _inboxIgnoradoCache;
  const alvo = path.join(INBOX_BRUTO, ".probe");
  const r = spawnSync("git", ["check-ignore", "-q", "--no-index", alvo], {
    cwd: RAIZ,
    stdio: "ignore",
  });
  // exit 0 = ignorado; 1 = nao ignorado; qualquer outra coisa (git ausente, fora de
  // repositorio) e tratada como "nao provado", que conta como nao ignorado.
  _inboxIgnoradoCache = !r.error && r.status === 0;
  return _inboxIgnoradoCache;
}

// --- (c) frontmatter ---------------------------------------------------------

function coletarMd() {
  const ignorarTop = new Set([".git", ".claude", "node_modules", "dist", "archive"]);
  if (!ESTRITO) {
    for (const p of PASTAS_LEGADAS) ignorarTop.add(p);
    ignorarTop.add("logs");
  }
  const resultado = [];
  (function andar(dir) {
    let entradas;
    try { entradas = fs.readdirSync(dir, { withFileTypes: true }); }
    catch (e) { erro(`${rel(dir)} — não foi possível ler o diretório: ${e.message}`); return; }
    for (const ent of entradas) {
      const abs = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (dir === RAIZ && ignorarTop.has(ent.name)) continue;
        andar(abs);
      } else if (ent.isFile() && ent.name.toLowerCase().endsWith(".md")) {
        if (dir === RAIZ && !ESTRITO && ARQUIVOS_LEGADOS_RAIZ.has(ent.name)) continue;
        // governance/public-package/ e area de staging de artefatos do GitHub
        // (SECURITY, CODE_OF_CONDUCT, templates de issue). Eles nao sao
        // documentos do Brain e nao carregam frontmatter v2 — mas continuam
        // dentro da varredura de segredos, que e o que importa ali.
        if (ehStagingPublico(abs)) continue;
        resultado.push(abs);
      }
    }
  })(RAIZ);
  return resultado;
}

function validarFrontmatterDoArquivo(abs, projetosValidos, idsVistos) {
  const caminho = rel(abs);
  let texto;
  try { texto = fs.readFileSync(abs, "utf8"); }
  catch (e) { erro(`${caminho} — falha de leitura: ${e.message}`); return; }
  const fm = parseFrontmatter(texto, caminho);
  // Arquivo de vitrine ou de comunidade sem bloco nenhum: ausencia esperada,
  // nao defeito. Se o bloco existir, cai no fluxo normal e e validado igual.
  if (fm.erro && frontmatterEhOpcional(abs) && !texto.startsWith("---")) return;
  if (fm.erro) { erro(fm.erro); return; }

  const ehSkillMd = path.basename(abs) === "SKILL.md";
  const permitidos = new Set(CAMPOS_V2);
  if (ehSkillMd) { permitidos.add("name"); permitidos.add("description"); }

  for (const c of CAMPOS_V2) {
    if (!fm.campos.has(c)) erro(`${caminho} — campo obrigatório ausente no frontmatter: ${c}`);
  }
  for (const c of fm.ordem) {
    if (!permitidos.has(c)) aviso(`${caminho} — campo desconhecido no frontmatter: ${c}`);
  }
  const ordemV2 = fm.ordem.filter((c) => CAMPOS_V2.includes(c));
  const ordemEsperada = CAMPOS_V2.filter((c) => fm.campos.has(c));
  if (ordemV2.join(",") !== ordemEsperada.join(",")) {
    aviso(`${caminho} — campos fora da ordem canônica do ADR-018 (id, tipo, projeto, status, data, autor)`);
  }

  const id = fm.campos.get("id");
  if (id) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) aviso(`${caminho} — id fora do padrão kebab-case: "${id}"`);
    if (idsVistos.has(id)) erro(`${caminho} — id duplicado: "${id}" já usado em ${idsVistos.get(id)}`);
    else idsVistos.set(id, caminho);
  }
  const tipo = fm.campos.get("tipo");
  if (tipo && !TIPOS.has(tipo)) erro(`${caminho} — tipo fora do enum do ADR-018: "${tipo}"`);
  const projeto = fm.campos.get("projeto");
  if (projeto && projetosValidos && !projetosValidos.has(projeto)) {
    erro(`${caminho} — projeto "${projeto}" não consta no registro (governance${path.sep}registro-projetos.yaml) nem é "global"`);
  }
  const st = fm.campos.get("status");
  if (st && !STATUS_DOC.has(st)) erro(`${caminho} — status fora do enum do ADR-018: "${st}"`);
  const data = fm.campos.get("data");
  if (data && !dataIsoValida(data)) erro(`${caminho} — data inválida (esperado ISO YYYY-MM-DD): "${data}"`);
  const autor = fm.campos.get("autor");
  if (autor && !AUTOR_PADRAO.test(autor)) erro(`${caminho} — autor fora do padrão (identificador kebab-case, ex.: "operador"): "${autor}"`);
}

// --- (d) skills --------------------------------------------------------------

function verificarSkills() {
  const dirSkills = path.join(RAIZ, "skills");
  if (!fs.existsSync(dirSkills)) return;
  for (const cat of fs.readdirSync(dirSkills, { withFileTypes: true })) {
    if (!cat.isDirectory()) continue;
    const absCat = path.join(dirSkills, cat.name);
    for (const sk of fs.readdirSync(absCat, { withFileTypes: true })) {
      if (!sk.isDirectory()) continue;
      const absSkill = path.join(absCat, sk.name);
      const absSkillMd = path.join(absSkill, "SKILL.md");
      const caminho = rel(absSkillMd);
      if (!fs.existsSync(absSkillMd)) {
        erro(`${rel(absSkill)} — SKILL.md ausente (toda pasta de skill exige SKILL.md)`);
        continue;
      }
      const fm = parseFrontmatter(fs.readFileSync(absSkillMd, "utf8"), caminho);
      if (fm.erro) continue; // já reportado na checagem (c)
      const nome = fm.campos.get("name") || "";
      const descricao = fm.campos.get("description") || "";
      if (nome !== sk.name) {
        erro(`${caminho} — name ("${nome}") difere do nome da pasta ("${sk.name}")`);
      }
      if (descricao.trim() === "") {
        erro(`${caminho} — description vazia (obrigatória na spec Anthropic de skills)`);
      }
    }
  }
}

// --- (e) varredura de segredos ----------------------------------------------

// Padrões montados por concatenação para não se autodetectarem (ver cabeçalho).
const PADROES_SEGREDO = [
  ["chave de API Anthropic", new RegExp("sk-" + "ant-")],
  ["token GitHub (classic)", new RegExp("gh" + "p_")],
  ["token GitHub (fine-grained)", new RegExp("github" + "_pat_")],
  ["chave de acesso AWS", new RegExp("AK" + "IA")],
  ["chave privada PEM", new RegExp("-----BEG" + "IN[^\\n]*PRIV" + "ATE KEY")],
  ["token de bot Slack", new RegExp("xo" + "xb-")],
  ["token de autorização", new RegExp("Bea" + "rer " + "[A-Za-z0-9\\-._~+/=]{20,}")],
];

const EXT_BINARIAS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".ico", ".bmp", ".webp", ".pdf", ".zip",
  ".gz", ".7z", ".rar", ".exe", ".dll", ".so", ".dylib", ".woff", ".woff2",
  ".ttf", ".otf", ".eot", ".mp3", ".mp4", ".webm", ".mov", ".sqlite", ".db",
]);

// Excecoes declaradas: um segredo aparente cuja natureza de placeholder ja foi
// verificada e registrada. O registro mora FORA do arquivo — diferente de
// `ref-ausente-ok` e `cita-proposto-ok`, que sao comentarios no proprio
// documento — porque o caso que motivou o mecanismo e um registro datado em
// logs/, imutavel por contrato (AGENTS.md secao 4): escrever a declaracao
// dentro dele seria editar um log. Ver ADR-037.
//
// Formato: uma linha de tabela markdown por excecao, com caminho e linha
// exatos. Nunca glob — uma excecao larga demais e um buraco no scanner.
function lerExcecoesDeSegredo() {
  const arq = path.join(RAIZ, "governance", "seguranca", "excecoes-varredura-de-segredos.md");
  const mapa = new Map();
  // Ausente = zero excecoes. Isso e deliberado: o pacote exportado nao leva o
  // registro, e um validador que exigisse o arquivo falharia na arvore publica.
  if (!fs.existsSync(arq)) return mapa;
  let texto;
  try { texto = fs.readFileSync(arq, "utf8"); }
  catch (e) { erro(`governance/seguranca/excecoes-varredura-de-segredos.md — falha de leitura: ${e.message}`); return mapa; }
  const re = /^\|\s*`([^`]+):(\d+)`\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|/gm;
  let m;
  while ((m = re.exec(texto)) !== null) {
    const chave = `${m[1].trim().replace(/\\/g, "/")}:${m[2]}`;
    mapa.set(chave, { padrao: m[3].trim(), motivo: m[4].trim(), usada: false });
  }
  return mapa;
}

function varrerSegredos() {
  const ignorarTop = new Set([".git", "node_modules"]);
  const excecoes = lerExcecoesDeSegredo();
  let varridos = 0;
  (function andar(dir) {
    let entradas;
    try { entradas = fs.readdirSync(dir, { withFileTypes: true }); }
    catch { return; }
    for (const ent of entradas) {
      const abs = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (dir === RAIZ && ignorarTop.has(ent.name)) continue;
        andar(abs);
        continue;
      }
      if (!ent.isFile()) continue;
      if (EXT_BINARIAS.has(path.extname(ent.name).toLowerCase())) continue;
      let buf;
      try { buf = fs.readFileSync(abs); }
      catch { continue; }
      if (buf.subarray(0, 8192).includes(0)) continue; // binário: fora da varredura
      varridos++;
      const linhas = buf.toString("utf8").split(/\r?\n/);
      const inbox = ehInboxBruto(abs) && inboxRealmenteIgnorado();
      linhas.forEach((linha, i) => {
        for (const [nomePadrao, re] of PADROES_SEGREDO) {
          if (!re.test(linha)) continue;
          const chave = `${rel(abs).replace(/\\/g, "/")}:${i + 1}`;
          const dec = excecoes.get(chave);
          if (dec) { dec.usada = true; continue; }
          if (inbox) {
            // archive/inbox/ e material externo bruto, gitignored por
            // construcao: um segredo aqui nao alcanca o controle de versao.
            // Avisar mantem o sinal (a triagem precisa saber) sem transformar
            // insumo nao triado em falha de build.
            aviso(`${rel(abs)}:${i + 1} — possível segredo em material bruto não triado (${nomePadrao}); não versionado, mas triar antes de destilar`);
            continue;
          }
          erro(`${rel(abs)}:${i + 1} — possível segredo detectado (${nomePadrao}); segredos jamais entram no Brain (ADR-007)`);
        }
      });
    }
  })(RAIZ);
  // Excecao declarada que nao casa mais nada e divida: o arquivo mudou, a
  // triagem fechou, ou a linha se moveu. Avisar impede que o registro
  // apodreca e vire um buraco silencioso no scanner.
  for (const [chave, d] of excecoes) {
    if (!d.usada) aviso(`governance/seguranca/excecoes-varredura-de-segredos.md — exceção obsoleta para ${chave} (${d.padrao}): nada casa mais nessa linha; remova a declaração`);
  }
  return { varridos, excecoes };
}

// --- execução ----------------------------------------------------------------

console.log(`validate-structure — raiz: ${RAIZ}`);
console.log(`Modo: ${ESTRITO ? "estrito (--strict)" : "padrão"}`);

verificarRaiz();
const registro = lerRegistro();
verificarProjetos(registro);

const projetosValidos = registro
  ? new Set([...registro.map((p) => p.slug), "global"])
  : null;
const idsVistos = new Map();
const mds = coletarMd();
for (const abs of mds) validarFrontmatterDoArquivo(abs, projetosValidos, idsVistos);

verificarSkills();
const { varridos: textoVarridos, excecoes } = varrerSegredos();

const declaradas = [...excecoes].filter(([, d]) => d.usada);
if (declaradas.length) {
  console.log(`\nEXCEÇÕES DECLARADAS (${declaradas.length}) — verificadas, registradas:`);
  for (const [chave, d] of declaradas) console.log(`  [OK] ${chave} — ${d.padrao} — ${d.motivo}`);
}

if (erros.length) {
  console.log(`\nERROS (${erros.length}):`);
  for (const e of erros) console.log(`  [ERRO] ${e}`);
}
if (avisos.length) {
  console.log(`\nAVISOS (${avisos.length}):`);
  for (const a of avisos) console.log(`  [AVISO] ${a}`);
}

console.log(`\nResumo: ${textoVarridos} arquivo(s) de texto varridos (segredos), ` +
  `${mds.length} .md com frontmatter verificado, ` +
  `${erros.length} erro(s), ${avisos.length} aviso(s).`);
console.log(erros.length ? "Resultado: FALHA" : "Resultado: OK");
process.exit(erros.length ? 1 : 0);

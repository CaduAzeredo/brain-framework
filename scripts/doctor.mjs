// ---------------------------------------------------------------------------
// doctor.mjs — Checagem completa do Brain em um comando só.
//
// Roda, nesta ordem, os verificadores que já existem, cada um como processo
// filho (a lógica não é reimplementada aqui — o formato de saída e os códigos
// de erro de cada um continuam sendo a fonte de verdade):
//
//   1. validate-structure.mjs   — árvore, frontmatter v2 e varredura de segredos
//   2. validate-links.mjs       — links relativos quebrados
//   3. validate-prose-refs.mjs  — arquivo citado entre crases que não existe
//   4. validate-state.mjs       — documento vigente dependendo de não aceito
//   5. export-public.mjs        — export em DRY-RUN (allowlist + redação)
//
// O passo 3 é sempre dry-run: este script NUNCA passa --write, portanto nunca
// grava nem apaga dist/public/. Gerar o snapshot de verdade é ação separada,
// com aprovação humana (PARADA D).
//
// Saída: 0 se todos passaram; 1 se qualquer um falhou. Um verificador que falha
// não interrompe os seguintes — o objetivo é ver todos os problemas de uma vez.
//
// Uso (funciona a partir de qualquer diretório; a raiz do Brain é resolvida
// como a pasta pai de scripts/):
//   bun scripts/doctor.mjs
//   bun scripts/doctor.mjs --strict    # repassa --strict ao validate-structure
//   (compatível com node >= 20: node scripts/doctor.mjs)
// ---------------------------------------------------------------------------

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

function raizDoBrain() {
  let p = decodeURIComponent(new URL(".", import.meta.url).pathname);
  if (/^\/[A-Za-z]:/.test(p)) p = p.slice(1);
  return path.resolve(p, "..");
}

const RAIZ = raizDoBrain();
const SCRIPTS = path.join(RAIZ, "scripts");
const STRICT = process.argv.includes("--strict");

const ETAPAS = [
  {
    nome: "estrutura",
    descricao: "árvore, frontmatter v2 e varredura de segredos",
    script: "validate-structure.mjs",
    args: STRICT ? ["--strict"] : [],
  },
  {
    nome: "links",
    descricao: "links relativos quebrados",
    script: "validate-links.mjs",
    args: [],
  },
  {
    nome: "refs em prosa",
    descricao: "arquivo citado entre crases que não existe",
    script: "validate-prose-refs.mjs",
    args: STRICT ? ["--strict"] : [],
  },
  {
    nome: "estado da governança",
    descricao: "documento vigente que depende de documento não aceito",
    script: "validate-state.mjs",
    args: STRICT ? ["--strict"] : [],
  },
  {
    nome: "export (dry-run)",
    descricao: "allowlist e padrões de redação — nunca grava",
    script: "export-public.mjs",
    args: [],
    // Só faz sentido na instância privada: o manifest referencia arquivos
    // (README-PUBLICO.md, AGENTS-PUBLICO.md, o seed do registro) que existem
    // apenas na origem do export, nunca no pacote exportado. Num clone do
    // pacote público esta etapa é n/a — e não falha, porque o QUICKSTART manda
    // todo usuário novo rodar este comando como primeiro contato.
    soNaOrigem: "README-PUBLICO.md",
  },
];

console.log(`doctor — raiz: ${RAIZ}`);
console.log(`Modo: ${STRICT ? "strict (inclui pastas legadas)" : "padrão"}\n`);

const resultados = [];

for (const etapa of ETAPAS) {
  console.log("=".repeat(72));
  console.log(`[${etapa.nome}] ${etapa.descricao}`);
  console.log("=".repeat(72));

  if (etapa.soNaOrigem && !fs.existsSync(path.join(RAIZ, etapa.soNaOrigem))) {
    console.log(`  n/a — esta árvore é um pacote exportado, não a origem do export`);
    console.log(`  (${etapa.soNaOrigem} não existe aqui; nada a verificar)
`);
    resultados.push({ ...etapa, codigo: 0, na: true });
    continue;
  }

  const r = spawnSync(
    process.execPath,
    [path.join(SCRIPTS, etapa.script), ...etapa.args],
    { cwd: RAIZ, stdio: "inherit" },
  );

  // spawnSync devolve status null quando o processo morre por sinal; nesse caso
  // o resultado é indeterminado e conta como falha, não como sucesso.
  const codigo = r.error ? -1 : r.status === null ? -1 : r.status;
  resultados.push({ ...etapa, codigo });

  if (r.error) console.error(`  [ERRO] não foi possível executar: ${r.error.message}`);
  console.log("");
}

console.log("=".repeat(72));
console.log("RESUMO");
console.log("=".repeat(72));

for (const r of resultados) {
  const marca = (r.na ? "n/a" : r.codigo === 0 ? "OK" : "FALHA").padEnd(5);
  const sufixo = r.na ? "(pacote exportado)" : `(exit ${r.codigo})`;
  console.log(`  ${marca}  ${r.nome.padEnd(22)} ${sufixo}`);
}

const falhas = resultados.filter((r) => r.codigo !== 0);

if (falhas.length === 0) {
  console.log(`\nResultado: OK — os ${resultados.length} verificadores passaram.`);
  process.exit(0);
}

console.log(
  `\nResultado: FALHA em ${falhas.length} de ${resultados.length} — ` +
    `${falhas.map((f) => f.nome).join(", ")}.`,
);
console.log("Role a saída acima: cada verificador já aponta arquivo e linha.");
process.exit(1);

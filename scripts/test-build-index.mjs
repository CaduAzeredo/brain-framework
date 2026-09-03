// test-build-index.mjs — prova que o índice cataloga o REPOSITÓRIO, não o disco.
//
// O defeito que este teste tranca aconteceu duas vezes em 2026-09-03: três
// sessões paralelas compartilham a árvore, arquivos prontos de uma delas
// ficaram dias sem commit, o gerador os catalogou, e commits de outra trilha
// reprovaram no CI com link para caminho que não existe em commit nenhum.
//
// Um gerador que "funciona" indexando tudo é indistinguível de um correto até
// o dia em que alguém commita o índice. Por isso o caso positivo não basta:
// o teste exige que o arquivo NÃO rastreado fique de fora E que ele seja
// nomeado na saída, porque exclusão silenciosa é o outro modo de falha.
//
// Roda sozinho, sem rede, numa árvore git descartável em os.tmpdir().

import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const AQUI = path.resolve(new URL(".", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));

let falhas = 0;
const ok = (cond, msg) => {
  console.log(cond ? `  ok    ${msg}` : `  FALHA ${msg}`);
  if (!cond) falhas++;
};

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "idx-test-"));
const git = (...a) => execFileSync("git", ["-C", tmp, ...a], { stdio: "ignore" });

function doc(id) {
  return `---\nid: ${id}\ntipo: guia\nprojeto: global\nstatus: vigente\ndata: 2026-09-03\nautor: teste\n---\n\n# ${id}\n`;
}

try {
  // Estrutura mínima que o gerador exige: governance/ e skills/.
  for (const d of ["governance", "skills", "docs", "scripts"]) {
    fs.mkdirSync(path.join(tmp, d), { recursive: true });
  }
  fs.copyFileSync(path.join(AQUI, "build-index.mjs"), path.join(tmp, "scripts", "build-index.mjs"));

  fs.writeFileSync(path.join(tmp, "docs", "rastreado.md"), doc("doc-rastreado"), "utf8");

  git("init", "-q");
  git("config", "user.email", "teste@local");
  git("config", "user.name", "teste");
  git("config", "commit.gpgsign", "false");
  git("add", "-A");
  git("commit", "-q", "-m", "base do teste");

  // Só AGORA o arquivo não rastreado, para que ele fique fora do commit.
  fs.writeFileSync(path.join(tmp, "docs", "solto.md"), doc("doc-solto"), "utf8");

  const r = spawnSync(process.execPath, [path.join(tmp, "scripts", "build-index.mjs")], {
    cwd: tmp,
    encoding: "utf8",
  });
  const saida = (r.stdout || "") + (r.stderr || "");
  const indice = fs.readFileSync(path.join(tmp, "governance", "INDICE.md"), "utf8");

  console.log("\n[negativo] arquivo no disco e fora do git NÃO entra no índice\n");
  ok(!indice.includes("doc-solto"), "o não rastreado ficou fora do índice");
  ok(/solto\.md/.test(saida), "a saída NOMEIA o arquivo que ficou de fora");
  ok(/não estarem no git/.test(saida), "a saída explica o motivo da exclusão");

  console.log("\n[positivo] arquivo commitado entra normalmente\n");
  ok(indice.includes("doc-rastreado"), "o rastreado entrou no índice");
  ok(r.status === 0, "o gerador terminou com código 0 mesmo tendo excluído algo");

  console.log("\n[guarda] sem git, indexa tudo e ANUNCIA que fez isso\n");
  // Renomear .git faz `git ls-files` falhar: é o cenário de um pacote baixado
  // como zip, sem histórico. Ali indexar tudo é o comportamento certo — o
  // errado seria devolver um índice vazio em silêncio.
  fs.renameSync(path.join(tmp, ".git"), path.join(tmp, ".git-off"));
  const r2 = spawnSync(process.execPath, [path.join(tmp, "scripts", "build-index.mjs")], {
    cwd: tmp,
    encoding: "utf8",
  });
  const saida2 = (r2.stdout || "") + (r2.stderr || "");
  const indice2 = fs.readFileSync(path.join(tmp, "governance", "INDICE.md"), "utf8");
  ok(indice2.includes("doc-solto"), "sem git, o não rastreado passa a entrar");
  ok(/git indisponível/.test(saida2), "sem git, a saída avisa que cobriu tudo");
  fs.renameSync(path.join(tmp, ".git-off"), path.join(tmp, ".git"));
} finally {
  try {
    fs.rmSync(tmp, { recursive: true, force: true });
  } catch {
    /* Windows às vezes segura o handle; a pasta é temporária de qualquer jeito */
  }
}

console.log(falhas ? `\ntest-build-index: ${falhas} falha(s).` : "\ntest-build-index: tudo passou.");
process.exit(falhas ? 1 : 0);

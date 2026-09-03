#!/bin/bash
# checar-nome.sh — disponibilidade de nome em npm e domínios.
#
# uso: bash scripts/checar-nome.sh <nome> [nome...]
#
# O que ele NÃO faz, de propósito:
#   - GitHub: fora da bateria. O repositório mora sob o namespace do autor
#     (<usuario>/<nome>), então o handle da organização não trava a escolha.
#   - USPTO: a busca é aplicação de página única servida de armazenamento
#     estático, sem API pública. É ato humano, com navegador.
#
# Três defeitos reais que este script existe para não repetir, os três pegos
# por execução e nenhum por leitura:
#
#   1. rdap.org devolve 404 para QUALQUER domínio .io — ele não cobre esse
#      TLD, e 404 no protocolo RDAP significa "não existe". O resultado era
#      "livre" para .io ocupado: `stripe.io` aparecia livre. Por isso .io vai
#      ao RDAP da Identity Digital, que é o registro dele.
#   2. api.github.com responde 403 por limite de taxa, não "ocupado". Ler 403
#      como ocupado transformava esgotamento de cota em resposta de negócio.
#   3. rdap.org é INSTÁVEL sob consultas seguidas. Três execuções do mesmo
#      alvo devolveram `?302` (redirecionamento não seguido), `?000` (conexão
#      falhou) e a resposta correta. Uma execução isolada não decide nada:
#      cada consulta é repetida até obter um código terminal.
#
# Daí a regra desta saída: só 404 vira LIVRE e só 200 vira reg. Qualquer outro
# código aparece como "?<codigo>" — desconhecido é desconhecido, nunca "livre".
# `?` numa coluna significa "refazer a consulta", nunca "pode usar".
#
# TESTE NEGATIVO OBRIGATÓRIO, antes de confiar em qualquer resultado:
#   bash scripts/checar-nome.sh stripe
# tem de dar "reg" em .com, .io, .dev e .app. LIVRE ou "?" em qualquer coluna
# significa checador quebrado ou instável, e nenhum resultado dele pode ser
# usado enquanto não sair limpo.

TENTATIVAS=4

# Consulta uma URL e devolve o código HTTP. Repete enquanto a resposta não for
# terminal (404 = não existe, 200 = existe); qualquer outra coisa é ruído de
# transporte ou de limite de taxa, não resposta sobre o domínio.
consultar() {
  local url="$1" c i
  for ((i = 1; i <= TENTATIVAS; i++)); do
    c=$(curl -sL -m 25 -o /dev/null -w "%{http_code}" "$url")
    case "$c" in 404 | 200) break ;; esac
  done
  echo "$c"
}

rotular() {
  case "$1" in 404) echo LIVRE ;; 200) echo reg ;; *) echo "?$1" ;; esac
}

printf "%-9s %-8s %-6s %-6s %-6s %-6s\n" nome npm .com .io .dev .app
for n in "$@"; do
  npm_c=$(consultar "https://registry.npmjs.org/$n")
  case "$npm_c" in 404) npm=LIVRE ;; 200) npm=ocup ;; *) npm="?$npm_c" ;; esac

  for tld in com dev app; do
    eval "d_$tld=$(rotular "$(consultar "https://rdap.org/domain/$n.$tld")")"
  done
  d_io=$(rotular "$(consultar "https://rdap.identitydigital.services/rdap/domain/$n.io")")

  printf "%-9s %-8s %-6s %-6s %-6s %-6s\n" "$n" "$npm" "$d_com" "$d_io" "$d_dev" "$d_app"
done

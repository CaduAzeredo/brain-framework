---
id: template-retorno-de-sessao
tipo: template
projeto: global
status: vigente
data: 2026-09-01
autor: brain-framework
---

# Retorno de sessão — <data> <hora>

Template de fecho de ciclo do **Shizune**. Uma página, duas caixas. A separação não é estética: ela é o produto — a máquina reporta o que executou, o humano recebe só o que exige decisão dele.

Regras de preenchimento:

1. **Todo item do Dever Dev carrega evidência.** Sem saída de teste, caminho de arquivo, resultado de comando ou SHA, o item não entra.
2. **Todo item do Dever Humano diz o que trava.** Sem consequência declarada, é lembrete, não gate.
3. **Número sem comando não entra.** Se a contagem não pode ser reproduzida, ela vira "a apurar" com o motivo.
4. **Hipótese fica rotulada como hipótese**, inclusive em linguagem simples.

---

## Dever Dev — o que foi feito

| O quê | Evidência | Onde |
| :--- | :--- | :--- |
| <ação executada> | <teste verde / saída de comando / SHA> | <caminho do arquivo> |

**Quebrou e foi consertado:** <o que falhou durante a execução, e como. Se nada falhou, escrever "nada quebrou" — silêncio aqui é ambíguo.>

**Não foi feito, e por quê:** <o que estava no pedido e ficou fora, com o motivo. Escopo reduzido sem aviso é o defeito que este projeto reporta aos outros.>

---

## Dever Humano — o que só você pode fazer

| # | Decisão ou ato | Trava o quê | Prazo |
| ---: | :--- | :--- | :--- |
| 1 | <o que precisa da sua decisão> | <o que fica parado até lá> | <data ou "sem prazo"> |

**Decisões tomadas nesta sessão** (para virar linha em `governance/registro-decisoes.md`):

| DEC | Decisão | Assinante |
| :--- | :--- | :--- |
| DEC-NNN | <uma frase> | operador |

---

## Resumo em linguagem simples

<Três a cinco frases, sem jargão: qual era o problema, o que mudou, o que você precisa fazer. Quem lê isto deve conseguir aprovar ou recusar sem abrir nenhum arquivo.>

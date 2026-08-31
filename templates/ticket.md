---
id: template-ticket
tipo: template
projeto: global
status: vigente
data: 2026-08-27
autor: brain-framework
---

# Template — ticket.md

Registro de execução de uma tarefa (ticket-NNN): liga uma spec ou ADR ao trabalho feito, com diário datado e desvios explícitos. Copie o corpo abaixo, numere sequencialmente dentro do projeto e preencha DURANTE a execução, não depois.
Regra de ouro: desvio da spec sem justificativa registrada é bug de processo, não detalhe.

````markdown
---
id: ticket-<nnn>-<slug-curto>
tipo: relatorio
projeto: <slug-do-projeto>
status: vigente
data: <aaaa-mm-dd>
autor: <autor>
---

# ticket-<NNN> — <título da tarefa>

## Origem

<!-- Spec ou ADR que originou este ticket. Link relativo obrigatório. -->

- Origem: [spec-<NNN>](<caminho-relativo>)

## Tarefa

<!-- O que deve ser feito e qual o resultado esperado, em 2-4 frases. Cite os critérios de aceitação da spec que este ticket cobre (ex.: CA1-CA4). -->

## Diário de execução

<!-- Entradas datadas, em ordem cronológica, escritas durante a execução. Fatos: o que foi feito, comandos executados, resultados observados. -->

- **<aaaa-mm-dd hh:mm>** — <o que foi feito / observado>

## Desvios da spec

<!-- Cada desvio: o que mudou, por quê e quem aprovou. Se não houve, escreva "Nenhum". -->

| Desvio | Justificativa | Aprovado por |
| --- | --- | --- |
| <o que mudou em relação à spec> | <por quê> | <quem> |

## Resultado

<!-- Estado final verificável: quais critérios de aceitação passaram, com evidência (saída de teste, comando, contagem). -->

- <critério da spec (ex.: CA1)> — <evidência>

## Follow-ups

<!-- Itens descobertos fora do escopo deste ticket. Cada um vira novo ticket, spec ou pendência no CONTEXT.md do projeto — nunca fica só aqui. -->

- <follow-up> → <destino: ticket / spec / pendência no CONTEXT.md>
````

---
id: template-context
tipo: template
projeto: global
status: vigente
data: 2026-08-27
autor: brain-framework
---

# Template — CONTEXT.md (ficha de projeto)

Ficha canônica de um projeto: o que ele é, onde vive e em que estado está. Copie o corpo abaixo para `projects/<slug>/CONTEXT.md`, preencha os `<placeholders>` e apague os comentários `<!-- -->`.
Atualize "Estado de variáveis", "Grafo de tarefas", "Blockers", "Próximo vetor de ação" e "Histórico de rodadas" ao fim de cada rodada — sempre com data; números sem data de medição não entram. As seções Escopo, Grafo de tarefas, Estado de variáveis, Blockers e Próximo vetor de ação são obrigatórias (ADR-020).

````markdown
---
id: ficha-<slug-do-projeto>
tipo: ficha
projeto: <slug-do-projeto>
status: vigente
data: <aaaa-mm-dd>
autor: <autor>
---

# <Nome do Projeto> — Contexto

<!-- Abra com 1-2 frases: o que o projeto é e para que serve. -->

## Visão geral

<!-- 2-4 frases: problema que resolve, para quem, proposta de valor. Números de mercado/vendas não medidos são hipóteses — marque-os como tal ou deixe fora. -->

## Escopo

<!-- O que este projeto cobre e o que explicitamente NÃO cobre. 1-3 linhas por lado. -->

- **Dentro**: <o que o projeto entrega>
- **Fora**: <o que fica explicitamente de fora>

## Repositório e ambiente

<!-- Caminho do repositório, branch principal, como instalar e rodar. Nunca inclua segredos; cite apenas NOMES de variáveis de ambiente. -->

- Repositório: `<caminho-ou-url-do-repo>`
- Como rodar: `<comando>`
- Variáveis de ambiente exigidas (nomes apenas): `<VAR_1>`, `<VAR_2>`

## Stack

<!-- Lista de tecnologias com versão quando relevante. Uma linha por item, com o papel de cada uma. -->

- <tecnologia> <versão> — <papel no projeto>

## Grafo de tarefas

<!-- Tarefas vivas com dependências e estado (pendente | em execução | bloqueada | concluída). "Depende de" cita o nº da linha. -->

| # | Tarefa | Depende de | Estado |
| --- | --- | --- | --- |
| 1 | <tarefa> | — | <estado> |

## Estado de variáveis (<aaaa-mm-dd>)

<!-- Só fatos verificados, cada um com data de medição ou fonte. Ex.: testes passando (quantos, quando), feature em produção, rodada pausada em qual ponto. -->

| Variável | Valor | Medido em |
| --- | --- | --- |
| <variável> | <valor> | <aaaa-mm-dd> |

## Decisões relevantes

<!-- Uma linha por ADR que afeta este projeto. Links sempre relativos. -->

| ADR | Decisão (resumo) | Link |
| --- | --- | --- |
| <NNN> | <resumo em uma frase> | <substitua-por-link-relativo-ao-adr> |

## Integrações e gateways

<!-- Serviços externos e o papel exato de cada um. Se há mais de um gateway (ex.: pagamento transacional vs assinatura), deixe explícito qual faz o quê — nunca misturar. -->

| Serviço | Papel | Observações |
| --- | --- | --- |
| <serviço> | <papel exato> | <limites; o que ele NÃO faz> |

## Blockers

<!-- O que impede avanço agora, quem destrava e o nível de risco (matriz T1-T4 do AGENTS.md). -->

- <blocker> — destrava: <operador|agente>; risco: <T1|T2|T3|T4>

## Pendências

<!-- Lista priorizada. Itens que exigem autorização explícita do operador começam com [AUTORIZAÇÃO]. -->

- [ ] <pendência>
- [ ] [AUTORIZAÇÃO] <pendência que exige aprovação humana>

## Próximo vetor de ação

<!-- A ÚNICA próxima ação inequívoca. Uma frase, com o comando literal se houver. -->

<próxima ação>

## Histórico de rodadas

<!-- Uma linha por rodada, imutável depois de fechada. Handoff sempre com link relativo. -->

| Rodada | Data | Escopo | Resultado | Handoff |
| --- | --- | --- | --- | --- |
| <N> | <aaaa-mm-dd> | <escopo em uma frase> | <resultado em uma frase> | <substitua-por-link-relativo-ao-par-md-json> |
````

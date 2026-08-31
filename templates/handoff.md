---
id: template-handoff
tipo: template
projeto: global
status: vigente
data: 2026-08-29
autor: brain-framework
---

# Template — handoff.md

Documento de passagem de bastão entre agentes ou rodadas (padrão Handoff Rodada 0): tudo que o próximo executor precisa para continuar sem perguntar nada — e onde ele é OBRIGADO a parar e esperar um humano. Copie o corpo abaixo e preencha todas as seções; seção vazia é lacuna, não opção.
PARADAs são pontos de aprovação humana bloqueantes: o executor não avança sem a evidência exigida. Critérios marcados [GATE] bloqueiam a conclusão da rodada.
Todo handoff formal é um **par** de arquivos com o mesmo `handoff_id` (ADR-020): o `.md` (narrativa para humanos — este template) e o `.json` machine-readable ([templates/handoff.json](handoff.json)), gravados lado a lado em `projects/<slug>/handoffs/`.

````markdown
---
id: handoff-<slug>
tipo: handoff
projeto: <slug-do-projeto>
status: vigente
data: <aaaa-mm-dd>
autor: <autor>
---

# Handoff — <título / rodada>

## Contexto e porquê

<!-- 3-6 frases: de onde viemos, por que este trabalho existe, o que muda quando ele terminar. Links relativos para a spec/ADR de origem. -->

## Escopo

### Entregue

<!-- O que JÁ está pronto e verificado, com evidência. -->

- <item entregue> — evidência: <como foi verificado>

### Pendente

<!-- O que este handoff pede que seja feito. -->

- <item pendente>

### Desvios

<!-- Toda diferença entre o que a rodada planejava e o que ela fez. Desvio sem justificativa registrada é bug de processo, não detalhe. Se não houve, escreva "Nenhum". Mesmo formato do templates/ticket.md e do templates/relatorio.md — os três artefatos falam a mesma língua. -->

| Desvio | Justificativa | Aprovado por |
| --- | --- | --- |
| <o que mudou em relação ao planejado> | <por quê> | <quem, ou "não aprovado — reportado apenas"> |

## Estado do ambiente

<!-- Fotografia datada: versões, branch, serviços ativos, migrações aplicadas, o que está e o que NÃO está configurado. Nomes de variáveis de ambiente apenas — nunca valores. -->

- Data da fotografia: <aaaa-mm-dd>
- <item de ambiente e seu estado>

## Ordem de execução

<!-- Blocos sequenciais. Cada bloco declara pré-condições; se uma pré-condição falha, o executor PARA e reporta — não improvisa. -->

### Bloco 1 — <nome do bloco>

- **Pré-condições:** <o que deve ser verdade antes de começar>
- **Passos:**
  1. <passo>
  2. <passo>
- **Resultado esperado:** <estado verificável ao fim do bloco>

### Bloco 2 — <nome do bloco>

- **Pré-condições:** <inclui a conclusão do Bloco 1, se aplicável>
- **Passos:**
  1. <passo>
- **Resultado esperado:** <estado verificável>

## PARADAs humanas

<!-- Numeradas na ordem em que ocorrem. Em cada PARADA o executor interrompe e espera aprovação explícita do operador antes de continuar. -->

### PARADA 1 — <nome>

- **Quando ocorre:** <após qual bloco/passo>
- **O que aprovar:** <decisão exata que está nas mãos do humano>
- **Evidência exigida:** <o que o executor apresenta: saída de comando, diff, contagem, screenshot>

### PARADA 2 — <nome>

- **Quando ocorre:** <após qual bloco/passo>
- **O que aprovar:** <decisão>
- **Evidência exigida:** <evidência>

## Critérios de validação

<!-- Numerados e verificáveis. [GATE] marca critério bloqueante: sem ele a rodada NÃO é considerada concluída. -->

1. **V1 [GATE] —** <critério bloqueante> — verificação: <como verificar>
2. **V2 —** <critério> — verificação: <como verificar>

## Estimativas

<!-- Só preencha se o handoff projetar prazo ou esforço para o que fica pendente. Estimativa é HIPÓTESE, nunca promessa: a unidade útil é a SESSÃO (uma conversa até o contexto acabar), não a hora de relógio. Se não há estimativa, escreva "Nenhuma". -->

- **[HIPÓTESE] <o que se estima>:** <n> sessões
- **Âncora real:** <a medição concreta que sustenta o número — o que já foi feito e quanto custou>
- **Fatores que podem estourar, em ordem de risco:** <fator 1>; <fator 2>; <fator 3>
- **Não medido:** <o que ainda não se sabe e que tornaria a estimativa confiável>

## Bloqueados / fora de escopo

<!-- O que NÃO deve ser tocado nesta rodada; itens que dependem de autorização do operador ([AUTORIZAÇÃO]) ou de terceiros. -->

- <item bloqueado ou fora de escopo> — motivo: <motivo>

## Anexos

<!-- Links relativos para specs, tickets, ADRs, logs e evidências citados acima. Nenhuma referência não-resolvível. -->

- [<nome do anexo>](<caminho-relativo>)
````

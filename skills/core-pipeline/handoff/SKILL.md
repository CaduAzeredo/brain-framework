---
name: handoff
description: Produces an auditable, self-contained closing document for a session or round, addressed to another agent or a human. It records context and rationale, delivered versus pending scope, execution order in blocks separated by mandatory human checkpoints, numbered verifiable validation criteria including blocking gates, and an explicit blocked and out-of-scope list. Use when ending a work session, transferring execution to another agent, or pausing a round at a human checkpoint.
id: skill-handoff
tipo: skill
projeto: global
status: vigente
data: 2026-08-27
autor: brain-framework
---

# handoff

## Propósito

Encerrar uma sessão ou rodada de forma auditável, produzindo um documento autocontido que permite a outro agente ou humano executar, validar e auditar o trabalho sem consultar nenhuma conversa ou documento externo.

## Quando usar

- Fim de uma sessão de trabalho cujo resultado outro agente ou o operador vai continuar.
- Transferência de execução entre agentes (ex.: do planejador para o executor local).
- Pausa de rodada em parada humana: o estado precisa ficar retomável por qualquer um.
- Um plano aprovado precisa virar roteiro de execução com paradas de aprovação.

## Quando NÃO usar

- A sessão termina sem nada a transferir (trabalho concluído, validado e sem pendência): um documento de status basta.
- A pendência é uma nota curta para si mesmo na próxima sessão — anote no ticket, não abra handoff.
- O que falta é decisão, não execução: o instrumento é um documento de decisão para o operador, não um handoff.

## Entradas

- Tickets, specs e diffs da sessão que se encerra.
- Estado real verificado no momento do encerramento (testes, banco, arquivos) — não o estado presumido.
- Identificação de origem (quem escreve), destino (quem executa) e aprovador (quem libera as paradas).
- Pendências de autorização em aberto, marcadas `[AUTORIZAÇÃO]`.

## Processo

1. **Delimite o encerramento.** O que esta rodada foi, quem é o destino (agente executor ou humano) e quem aprova as paradas. Registre no cabeçalho: data, origem, destino, aprovador, repositório(s) e workspace envolvidos.
2. **Escreva o porquê.** A seção de contexto explica o problema que motivou a rodada, com evidências verificáveis (arquivos, linhas, comandos executados) — não com opinião. Quem executa precisa entender por que cada passo existe.
3. **Feche o escopo.** Lista fechada e numerada de entregas — "N entregas, nada além" — separando o já entregue do pendente. Escopo aberto torna a auditoria impossível.
4. **Declare as regras da execução inteira.** Invariantes que valem em todos os blocos (ex.: nenhum script aprova estado governado; nada é apagado, superados vão para `archive/` — ADR-015; informação sem fonte primária não vira regra). Regras que o executor precisaria "lembrar" são regras que serão esquecidas.
5. **Torne o documento autocontido.** Tudo o que o executor precisa está por extenso no próprio handoff: diffs completos, conteúdo íntegro de arquivos novos, identificadores exatos, comandos literais com caminhos. Se o executor precisar abrir outra conversa ou plano para agir, o handoff falhou.
6. **Organize a execução em blocos com PARADAs humanas.** Cada bloco é uma tabela de passos numerados com a coluna "quem executa". Entre blocos que mudam de natureza de risco (antes de alterar estado governado, antes de propagar dados, antes de irreversível), insira uma PARADA humana obrigatória. Para cada PARADA, defina: o relatório que o executor entrega (itens numerados, com os valores esperados), e a regra explícita de que a execução só retoma com liberação do aprovador — silêncio não é liberação.
7. **Escreva os critérios de validação.** Tabela numerada: verificação (comando ou ação concreta), momento (após qual passo) e resultado esperado (valor observável). Todo critério deve ser executável por quem não participou da sessão.
8. **Marque os gates bloqueantes.** Identifique quais critérios são bloqueantes: enquanto não passarem, a rodada não está concluída, ainda que todos os demais estejam verdes. Para cada gate, defina o que é falha, o que é aprovação e o roteiro de investigação em caso de falha.
9. **Defina "concluído".** Condições explícitas e simultâneas (ex.: gate bloqueante verde E relatórios das paradas revisados pelo aprovador). Nenhuma condição substitui a outra.
10. **Liste bloqueados e fora de escopo.** O que deliberadamente não entra nesta rodada, com o pré-requisito de desbloqueio de cada item. Inclua as pendências `[AUTORIZAÇÃO]` ainda não concedidas.
11. **Grave o handoff como PAR `.md` + `.json`** no destino indicado na seção Saída, com data em formato ISO (`YYYY-MM-DD`) e o **mesmo `handoff_id`** nos dois arquivos (ADR-020): o `.md` segue o template narrativo (frontmatter v2 obrigatório); o `.json` segue o template machine-readable e carrega o estado estruturado (`session_metrics`, `git_state`, `active_task`, `execution_invariants`, `blockers`, `paradas`, `immediate_next_step` com `risk_tier` T1–T4).

## Saída

- **Artefato:** PAR de documentos de handoff com o mesmo `handoff_id` (ADR-020): narrativa `.md` + estado machine-readable `.json`.
- **Destino:** `projects/<slug>/handoffs/handoff-<data>-<titulo>.md` e `handoff-<data>-<titulo>.json` (a partir da raiz do Brain; `<data>` em `YYYY-MM-DD`).
- **Templates:** [templates/handoff.md](../../../templates/handoff.md) e [templates/handoff.json](../../../templates/handoff.json).
- Handoff superado por rodada posterior vai para `archive/` do projeto — nada é apagado (ADR-015).

## Critérios de conclusão

1. O par `handoff-<data>-<titulo>.md` + `.json` existe em `projects/<slug>/handoffs/`, com o mesmo `handoff_id`, frontmatter v2 no `.md` e cabeçalho completo (data, origem, destino, aprovador).
2. O documento é autocontido: um executor que só tenha este arquivo consegue executar tudo — comandos, conteúdos e identificadores estão por extenso, sem referência a conversas.
3. O escopo é lista fechada e numerada, com entregue e pendente separados.
4. Todo bloco tem passos numerados com responsável; toda PARADA tem relatório especificado e regra explícita de não-retomada sem liberação.
5. Todo critério de validação tem verificação concreta, momento e resultado esperado observável.
6. Os gates bloqueantes estão identificados, com definição de falha, de aprovação e roteiro de investigação.
7. A definição de "concluído" está escrita, com condições simultâneas.
8. A lista de bloqueados/fora de escopo existe, com pré-requisitos de desbloqueio e pendências `[AUTORIZAÇÃO]`.

## Anti-padrões

- **Handoff-ponteiro.** "Conforme discutido na conversa" ou "ver o plano anterior" — referência a contexto que o executor não tem. Autocontido ou nada.
- **Parada decorativa.** PARADA que o executor pode "presumir liberada" ou encadear com o bloco seguinte. Parada sem relatório especificado e sem regra de não-retomada não é parada.
- **Silêncio como aprovação.** Retomar porque o aprovador não respondeu. Ausência de resposta mantém a execução parada.
- **Critério vago.** "Verificar que tudo funciona" — quem não participou da sessão não sabe o que verificar nem o que esperar.
- **Concluído sem gate.** Dar a rodada por encerrada com todos os critérios secundários verdes e o gate bloqueante vermelho — o gate mede o objetivo da rodada; o resto mede o caminho.
- **Omitir o não-entregue.** Handoff que só lista sucessos. O valor de auditoria está exatamente no pendente, no bloqueado e no desvio.
- **Estado presumido.** Registrar contagens e estados "de cabeça" em vez de verificados por comando no momento do encerramento.

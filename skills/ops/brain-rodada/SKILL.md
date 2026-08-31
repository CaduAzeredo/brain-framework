---
name: brain-rodada
description: How to plan and conduct an execution Rodada (round) in the Brain — blocks, mandatory human stops (PARADAs), pre-defined numbered validation criteria and blocking gates, and an immutable final report. Use when planning multi-step execution that touches governed state, writing a handoff for an executor agent, or defining done-criteria for a round. Triggers: "planejar rodada", "criar handoff", "executar rodada", "definir critérios de validação", "plan a round", "execution round".
id: skill-brain-rodada
tipo: skill
projeto: global
status: vigente
data: 2026-08-27
autor: brain-framework
---

# Brain Rodada

Esta skill define como estruturar e conduzir uma Rodada de execução no Brain: blocos ordenados por risco, PARADAs humanas obrigatórias antes de toda ação irreversível, critérios de validação numerados definidos antes de executar e relatório final imutável. O padrão foi extraído de uma rodada real de operação (a "Rodada 0") e generalizado.

## Propósito

Impedir que execução multi-passo com agentes altere estado governado (bancos, documentos de decisão, memórias aprovadas) sem revisão humana nos pontos certos — e garantir que "concluído" seja uma verificação objetiva definida antes do primeiro comando, não uma sensação ao final.

## Quando usar

- Qualquer execução que combine mudanças de código, documentos de governança e estado persistente (banco, memórias, catálogo de decisões).
- Ao escrever um handoff do agente que planeja para o agente que executa.
- Ao retomar uma rodada pausada em uma PARADA: a retomada exige liberação humana explícita, nunca presunção.

## Processo

### 1. Escreva o handoff autocontido (par `.md` + `.json`)

O documento de handoff contém tudo por extenso: diffs completos, arquivos novos na íntegra, identificadores exatos, comandos literais e critérios de validação. O executor não consulta conversa, plano anterior nem memória de sessão. Se o executor precisa perguntar, o handoff falhou.

Todo handoff formal é um **par** com o mesmo `handoff_id` (ADR-020): o `.md` narrativo ([templates/handoff.md](../../../templates/handoff.md)) e o `.json` machine-readable ([templates/handoff.json](../../../templates/handoff.json)), que carrega `git_state`, `active_task`, `execution_invariants`, `paradas` e `immediate_next_step` com `risk_tier` (matriz T1–T4 do AGENTS.md).

### 2. Estruture em blocos ordenados por risco, com pré-condições

O padrão de três blocos da Rodada 0, generalizável:

- **Bloco A — preparação reversível.** Código, testes, criação de ADRs e scripts (criar, não executar). Pré-condição típica: backup feito antes de tudo. Nada neste bloco altera estado governado; se algo der errado, desfaz-se sem perda.
- **Bloco B — alteração de estado governado.** Rejeições, ressalvas documentais, registros de status. É o bloco irreversível ou de reversão cara. Só começa após a PARADA 1.
- **Bloco C — carga e aprovação final.** Propostas em lote e aprovações, estas exclusivamente humanas. Só começa após a PARADA 2.

Cada bloco lista passos numerados (A1, A2… B1… C1…) com a coluna "quem executa" explícita — agente, humano, ou agente somente sob autorização pontual. Nenhum bloco pode ser encadeado com o seguinte.

### 3. Coloque toda ação irreversível ou sensível atrás de uma PARADA humana

Uma PARADA é um ponto onde o executor **para**, entrega um relatório definido de antemão e não retoma até liberação explícita do operador. Regras:

- A PARADA não pode ser automatizada, presumida nem dada por liberada por silêncio.
- O conteúdo do relatório de cada PARADA é especificado no handoff, item a item (diffs aplicados, resultado de testes, estado do banco, backups, pendências).
- O relatório inclui uma **verificação de pré-estado**: o valor que o estado governado deve ter naquele momento (na Rodada 0: contagem de aprovadas ainda em 5 na PARADA 1, em 0 na PARADA 2). Valor divergente significa que algo alterou o estado fora do previsto — pare e reporte antes de qualquer outra ação.
- Ações de estado dentro dos blocos seguintes (como rejeições em banco) não entram em script nem são encadeadas: são executadas pelo humano, ou pelo agente sob autorização explícita e pontual.

### 4. Defina os critérios de validação ANTES da execução

Uma tabela numerada (na Rodada 0, critérios 1 a 13), escrita no handoff antes do primeiro comando, com quatro colunas: verificação (comando ou pergunta literal), momento (após qual passo), resultado esperado, e — quando aplicável — a marca de **gate bloqueante**.

- Critérios comuns provam que código e documentos mudaram (testes passam, greps limpos, contagens corretas).
- O **gate bloqueante** é o critério que mede o objetivo da rodada em si — na Rodada 0, provar que a afirmação contaminada deixou de sair na resposta do assistente. Enquanto o gate não passar, a rodada NÃO está concluída, ainda que todos os demais critérios estejam verdes.
- O gate traz definidas de antemão: a condição exata de falha, a condição exata de aprovação e a **ordem de investigação** em caso de falha (onde olhar, em que sequência).
- **Definição de concluído** dupla e explícita: (1) o gate passou; (2) o operador revisou os relatórios de todas as PARADAs. Nenhuma condição substitui a outra.

### 5. Se algo falha, a rodada para e reporta — não improvisa

Desvio de resultado esperado, teste quebrado não previsto, contagem divergente, cópia extra de script descoberta: o executor interrompe, registra o que encontrou e devolve ao operador. Improvisar correção fora do handoff transforma execução auditável em sessão de debugging sem trilha.

### 6. Delimite escopo, consequências e bloqueios por escrito

O handoff lista: as entregas exatas ("N entregas, nada além"), as consequências conhecidas que exigem decisão do operador (fora das entregas, aguardando decisão), e o que está bloqueado ou fora de escopo, com o motivo. O que não está na lista de entregas não é executado.

### 7. Feche com relatório final imutável

Ao término, o relatório da rodada é gravado em `logs/<ano>/<slug>/` (relativo à raiz do Brain) — registro imutável: estado final verificado, critérios com resultado real, desvios e pendências. Nunca é editado depois; correção posterior é documento novo que o referencia. Documentos vivos afetados (status, mapas) são atualizados à parte, apontando para o relatório.

## Saída

- Handoff autocontido com blocos, PARADAs, tabela de critérios numerados e gate bloqueante — tudo antes da execução.
- Relatórios de PARADA entregues e revisados pelo operador em cada fronteira de bloco.
- Relatório final imutável em `logs/<ano>/<slug>/`.

## Critérios

1. O handoff é executável sem acesso à conversa que o gerou (teste do leitor frio).
2. Todo passo irreversível ou de estado governado está depois de uma PARADA, nunca antes.
3. Nenhum bloco encadeia com o seguinte; nenhuma PARADA é liberável por omissão.
4. Os critérios de validação existem, numerados, com comando/momento/resultado esperado, ANTES do primeiro passo executado.
5. Existe pelo menos um gate bloqueante que mede o objetivo da rodada, com condições de falha/aprovação e ordem de investigação predefinidas.
6. A definição de concluído exige gate verde E relatórios de PARADA revisados — as duas condições simultaneamente.
7. Cada passo tem executor explícito; aprovações de estado governado são exclusivamente humanas.
8. O relatório final está em `logs/<ano>/<slug>/` e não foi editado após o fechamento.

## Anti-padrões

- **Encadear blocos.** Rodar o bloco de alteração de estado logo após o de preparação porque "estava tudo verde". A PARADA existe exatamente para o humano decidir isso.
- **PARADA liberada por silêncio.** Interpretar ausência de resposta do operador como aprovação. Liberação é ato explícito.
- **Critérios escritos depois.** Definir o que é sucesso após ver o resultado. Vira racionalização: tudo que aconteceu parece o esperado.
- **Rodada "concluída" com o gate vermelho.** Todos os critérios auxiliares verdes provam que arquivos mudaram — não que o objetivo foi atingido. O gate é o único critério que mede isso; sem ele, a rodada não fecha.
- **Improvisar diante de desvio.** Encontrar um estado inesperado e "corrigir no caminho" sem reportar. O desvio pode ser sintoma de causa maior; a correção improvisada apaga a evidência.
- **Script que aprova.** Automatizar a etapa de aprovação humana "para agilizar". Foi exatamente o defeito que originou a Rodada 0: um seed que se auto-confirmava contornou o portão de aprovação e contaminou a base.
- **Relatório final editável.** Ajustar o relatório da rodada semanas depois para refletir estado novo. Registro imutável não muda; estado novo vai em documento novo.

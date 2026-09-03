---
name: writing-for-agents
description: Meta-skill that governs ALL document writing in Shizune. Use whenever creating or editing any Markdown document — status, handoff, ADR, ficha, guia, relatorio, skill, template — or reviewing one for quality. Triggers: "escrever documento", "criar status/handoff/ficha", "documentar decisão", "atualizar o Shizune", "write a doc", "document this".
id: skill-writing-for-agents
tipo: skill
projeto: global
status: vigente
data: 2026-08-27
autor: brain-framework
---

# Writing for Agents

Esta meta-skill define como todo documento do Shizune é escrito para que um leitor sem nenhum contexto da sessão — agente ou humano, hoje ou daqui a seis meses — consiga entendê-lo e agir sobre ele sem consultar mais nada. Toda outra skill de escrita do Shizune herda estas regras.

## Propósito

Garantir que cada documento do Shizune seja autocontido, rastreável e não-ambíguo. O leitor típico não é quem escreveu: é um agente recém-iniciado, sem memória da conversa que gerou o documento. Se o documento só faz sentido para quem estava presente, ele falhou.

## Quando usar

- Antes de criar qualquer arquivo `.md` no Shizune, de qualquer tipo.
- Ao editar um documento vivo (status, mapa, ficha, guia).
- Ao revisar um documento produzido por outro agente.
- Como referência normativa quando duas skills de escrita divergirem: esta prevalece.

## Processo

1. **Identifique o leitor sem contexto.** Escreva assumindo que quem lê não participou da sessão, não viu o diff, não conhece a conversa. Tudo que o documento precisa para ser entendido está dentro dele ou a um link relativo de distância.
2. **Frontmatter v2 sempre.** Todo `.md` novo nasce com o bloco YAML de 6 campos (`id`, `tipo`, `projeto`, `status`, `data`, `autor`), nesta ordem, com `id` único global em kebab-case. Documento sem frontmatter é documento inválido.
3. **Abra com o propósito.** As primeiras 1-2 frases dizem o que o documento é e para que serve. O leitor decide em dez segundos se está no lugar certo.
4. **Torne todo contexto explícito.** Zero referências não-resolvíveis: nada de "o fix", "o problema de ontem", "aquele script", IDs soltos sem origem. Cada referência aponta para um arquivo (link relativo), um identificador completo ou uma definição no próprio texto.
5. **Uma fonte por fato.** Cada fato tem um único documento canônico; os demais linkam para ele em vez de repetir. Duplicação de conteúdo é bug, não conveniência: duas cópias divergem, e a divergência vira contradição silenciosa.
6. **Datas e status explícitos.** Toda afirmação sensível ao tempo carrega data (`2026-08-27`, nunca "hoje" ou "recentemente") e, quando aplicável, validade ("vigente até X", "superado por Y"). Número não medido é hipótese a validar, e o texto diz isso.
7. **Decida: documento vivo ou registro imutável.** Documento vivo (status, mapa, ficha) é atualizado no lugar, com data de atualização. Registro imutável (relatório de rodada, log de execução) vai para `logs/` e nunca é editado depois de fechado — correção posterior é um documento novo que referencia o antigo.
8. **Estrutura previsível.** Propósito → conteúdo → próximos passos (quando houver). Seções nomeadas, tabelas para dados comparáveis, listas numeradas para sequências. O leitor navega por títulos sem ler tudo.
9. **PT-BR com termos técnicos precisos.** Corpo em português; termos técnicos, nomes de campos, comandos e identificadores permanecem no original (`PENDING_CONFIRMATION`, `frontmatter`, `merge`). Não traduza o que quebra a busca.
10. **Links relativos, sempre.** Caminho absoluto de máquina em documento do Shizune quebra na primeira migração de disco ou de instância. Dentro do Shizune, todo link é relativo à posição do arquivo.

## Saída

Um documento `.md` que passa no teste do leitor frio: um agente que só recebeu esse arquivo consegue dizer o que é, de quando é, se ainda vale, de onde vem cada fato e o que fazer a seguir.

## Critérios

1. Frontmatter v2 presente, com os 6 campos na ordem e `id` único.
2. Propósito declarado nas primeiras 1-2 frases.
3. Nenhuma referência não-resolvível (pronomes órfãos, IDs sem origem, "o fix").
4. Nenhum fato duplicado de outro documento — link relativo no lugar da cópia.
5. Toda afirmação temporal tem data explícita; todo status tem vigência clara.
6. Nenhum caminho absoluto de máquina em links internos do Shizune.
7. Classificação correta: vivo (editável, com data de atualização) ou imutável (em `logs/`, nunca reeditado).
8. Números de marketing/vendas não medidos marcados como hipótese a validar.

## Anti-padrões

Casos reais do próprio Shizune, generalizados como exemplo negativo:

- **Fichas duplicadas divergentes.** O mesmo projeto descrito em dois documentos que evoluíram separados até se contradizerem. Ninguém sabe mais qual é a fonte. Correto: uma ficha canônica; o resto linka.
- **Status contraditórios sem data de validade.** Dois documentos de status afirmando contagens diferentes do mesmo fato, ambos sem dizer até quando valem. O leitor não tem como escolher. Correto: status com data, e o mais novo referenciando e superando o mais antigo explicitamente.
- **Caminhos absolutos que quebram em migração.** Documentos apontando para um repositório no disco antigo depois de o projeto migrar. Cada migração exige caça manual a referências. Correto: links relativos dentro do Shizune; caminhos externos citados uma única vez no documento canônico do projeto.
- **Citação circular.** Um teste que usa dado inventado, um relatório que registra o teste como sucesso e um documento de decisão que cita o relatório como prova de que o dado é regra de negócio. O teste virou a fonte da regra. Correto: fato só entra em documento com fonte primária identificada; dado de teste é marcado como fictício na origem.
- **Referência de sessão.** "Conforme discutido", "o problema de ontem", "aplicar o fix". Ilegível fora da conversa que o gerou. Correto: reescrever com o conteúdo da discussão ou linkar o documento que a registrou.

---
name: grill-with-docs
description: Interrogates real documentation and code before any planning. It collects primary sources, formulates the questions the material must answer, records gaps and contradictions explicitly instead of filling them with assumptions, and interviews the operator about what the sources leave open. Use when starting work on a project or feature that has no current CONTEXT.md, when onboarding an agent to an unfamiliar repository, or when the existing context is stale or contradicts the code.
id: skill-grill-with-docs
tipo: skill
projeto: global
status: vigente
data: 2026-08-27
autor: brain-framework
---

# grill-with-docs

## Propósito

Interrogar a documentação e o código reais de um projeto ANTES de qualquer planejamento, produzindo um `CONTEXT.md` em que toda afirmação tem fonte primária, toda lacuna está declarada e nenhuma suposição se disfarça de fato.

## Quando usar

- Início de trabalho em um projeto ou frente que ainda não tem `CONTEXT.md` vigente.
- Onboarding de um agente em repositório que ele nunca leu.
- O `CONTEXT.md` existente está desatualizado, contradiz o código, ou foi escrito antes de uma mudança estrutural.
- Antes de rodar `domain-modeling` ou `to-spec` sem contexto validado.

## Quando NÃO usar

- O `CONTEXT.md` está vigente e a tarefa cabe dentro dele — vá direto para a próxima skill do pipeline.
- A dúvida é pontual (uma função, um endpoint): leia a fonte diretamente, sem ritual.
- Não há fonte primária nenhuma (projeto só existe como ideia): o caso é entrevista com o operador, e o resultado registra tudo como declaração, não como fato verificado.

## Entradas

- Slug canônico do projeto.
- Acesso de leitura ao repositório do projeto e aos documentos de decisão (README, ADRs, schema, migrations, testes, configs).
- Objetivo que motiva a coleta (o que se pretende planejar depois), em 1 frase.
- Disponibilidade do operador para responder o que as fontes não respondem.

## Processo

1. **Delimite o alvo.** Registre o slug do projeto e o objetivo que motiva a coleta. Sem objetivo, a coleta não tem critério de parada.
2. **Formule as perguntas antes de ler.** Liste o que o material precisa responder: qual a stack e por quê, quais as regras de negócio centrais, quais os invariantes técnicos, quais integrações existem, o que está proibido, o que está pendente. Perguntas primeiro evitam leitura confirmatória.
3. **Inventarie as fontes primárias.** README, ADRs e documentos de decisão, código-fonte, schema do banco, migrations, suíte de testes, arquivos de configuração. Registre o caminho de cada fonte e a data ou versão em que foi lida. Documento secundário (relatório, resumo, conversa) não substitui fonte primária quando ela existe.
4. **Interrogue as fontes.** Para cada pergunta da etapa 2, procure a resposta e registre-a com a citação exata (arquivo e seção ou linha). Resposta sem fonte citável não é resposta — volta para a lista de perguntas abertas.
5. **Registre as lacunas.** Toda pergunta que as fontes não respondem entra em uma seção explícita de lacunas. É proibido preencher lacuna com suposição plausível (ADR-009): a lacuna registrada vale mais que a resposta inventada.
6. **Registre as contradições.** Quando duas fontes divergem, cite as duas versões lado a lado, com caminho de cada uma. O agente não arbitra: contradição é achado, e quem resolve é o operador ou um documento de decisão posterior.
7. **Entreviste o operador.** Converta lacunas e contradições em perguntas objetivas e faça-as ao operador. Registre cada resposta como "declarado pelo operador em [data]" — categoria distinta de fato verificado em documento.
8. **Classifique tudo.** Cada afirmação do contexto final recebe uma de três marcas: **verificado** (com fonte primária citada), **declarado** (pelo operador, com data), **hipótese** (a validar — nunca tratada como fato, especialmente números de negócio, marketing ou vendas).
9. **Escreva o `CONTEXT.md`** no destino indicado na seção Saída, seguindo o template. Frontmatter v2 obrigatório.

## Saída

- **Artefato:** `CONTEXT.md` do projeto.
- **Destino:** `projects/<slug>/CONTEXT.md` (a partir da raiz do Shizune).
- **Template:** [templates/projeto/CONTEXT.md](../../../templates/projeto/CONTEXT.md).
- Se já existir um `CONTEXT.md` superado, ele vai para `archive/` do projeto — nada é apagado (ADR-015).

## Critérios de conclusão

1. `projects/<slug>/CONTEXT.md` existe, com frontmatter v2 e status `vigente`.
2. Toda afirmação do documento carrega uma das três marcas (verificado / declarado / hipótese); nenhuma está sem classificação.
3. Toda afirmação verificada cita fonte primária resolvível (caminho + seção ou linha).
4. A seção de lacunas existe — mesmo que registre "nenhuma lacuna identificada".
5. A seção de contradições existe — mesmo que registre "nenhuma contradição identificada".
6. As perguntas feitas ao operador e as respostas estão registradas, ou a entrevista está marcada como pendência explícita.
7. Nenhum número de negócio aparece como fato sem fonte primária.

## Anti-padrões

- **Planejar antes de ler.** Escrever plano, spec ou modelo de domínio e depois "conferir" nas fontes — a leitura vira busca de confirmação.
- **Preencher lacuna com suposição plausível.** É a origem clássica de regra de negócio inventada que depois circula como fato.
- **Citação circular.** Tratar teste, seed, fixture ou relatório de validação como fonte de regra de negócio. Teste prova que o sistema repete o valor, não que o valor é verdadeiro.
- **Fonte secundária no lugar da primária.** Citar um resumo quando o ADR ou o código existem e estão acessíveis.
- **Entrevista como atalho.** Perguntar ao operador o que as fontes já respondem desperdiça a entrevista; nunca entrevistar deixa lacunas mascaradas de contexto completo.
- **Contexto sem data.** Fonte lida sem registro de quando foi lida não permite detectar contexto vencido.

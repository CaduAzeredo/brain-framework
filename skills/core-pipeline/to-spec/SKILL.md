---
name: to-spec
description: Converts validated context and domain understanding into an executable specification with scope, non-scope, expected behavior backed by verifiable acceptance criteria, error cases, dependencies, and risks — one spec per deliverable unit. Use when a deliverable is ready to be specified for implementation, or when an implementation deviated from its spec and the spec must be revised before work continues.
id: skill-to-spec
tipo: skill
projeto: global
status: vigente
data: 2026-08-27
autor: brain-framework
---

# to-spec

## Propósito

Converter o entendimento consolidado em `CONTEXT.md` e `DOMAIN.md` em uma especificação executável — escopo, não-escopo, comportamento esperado com critérios de aceitação verificáveis, casos de erro, dependências e riscos — na granularidade de uma spec por unidade entregável.

## Quando usar

- Uma unidade entregável está pronta para ser especificada antes de `implement`.
- Um `implement` em andamento encontrou desvio de escopo e voltou: a spec precisa ser revisada ou uma nova precisa ser criada.
- Um handoff exige que o trabalho pendente fique especificado para outro agente executar.

## Quando NÃO usar

- Não existem `CONTEXT.md` e `DOMAIN.md` vigentes — rode `grill-with-docs` e `domain-modeling` primeiro. Spec sem lastro especifica suposição.
- A mudança é trivial e mecânica (typo, ajuste de texto) e o operador dispensou spec explicitamente.
- O que se quer é registrar uma decisão, não um comportamento — o instrumento é um ADR ou documento de decisão, não uma spec.

## Entradas

- `projects/<slug>/CONTEXT.md` e `projects/<slug>/DOMAIN.md` vigentes.
- A unidade entregável pretendida, em 1 frase.
- As specs já existentes em `projects/<slug>/specs/`, para numeração e para checagem de sobreposição.

## Processo

1. **Verifique as pré-condições.** `CONTEXT.md` e `DOMAIN.md` vigentes. Se a unidade a especificar depende de lacuna registrada no contexto, a spec não pode nascer: volte para `grill-with-docs` ou registre a dependência como bloqueio.
2. **Recorte a unidade entregável.** Uma spec descreve algo entregável e verificável em uma frente de `implement`. Se o recorte não cabe, divida em specs menores e explicite a ordem entre elas.
3. **Numere e nomeie.** `NNN` é o maior número existente em `projects/<slug>/specs/` mais um, com três dígitos; o título é curto e em kebab-case. Números não são reutilizados nem preenchem buracos.
4. **Escreva escopo e não-escopo.** O não-escopo é lista explícita do que um leitor razoável poderia supor incluído e não está. Não-escopo vazio é sinal de recorte mal feito.
5. **Especifique o comportamento esperado.** Para cada comportamento, um ou mais critérios de aceitação VERIFICÁVEIS: ação ou comando concreto, e resultado observável esperado. "Funciona corretamente" não é critério; "a rota responde 400 com mensagem contendo X" é.
6. **Especifique os casos de erro.** Entrada inválida, estado inesperado, falha de dependência externa — e o comportamento esperado em cada um. Caso de erro sem comportamento definido é decisão empurrada para o improviso do implementador.
7. **Liste as dependências.** O que precisa existir ou estar decidido antes da implementação. Dependência que exige escrita fora da raiz do Shizune ou mudança de ambiente é marcada `[AUTORIZAÇÃO]` — só o operador libera.
8. **Registre riscos e aberturas.** O que pode invalidar a spec, o que ficou deliberadamente em aberto e quem decide.
9. **Rastreie para o domínio.** Cada requisito referencia a entidade, invariante ou transição do `DOMAIN.md` que o sustenta. Requisito que contradiz um invariante exige decisão registrada — nunca contradição silenciosa.
10. **Escreva a spec** no destino indicado na seção Saída, seguindo o template. Frontmatter v2 obrigatório.

## Saída

- **Artefato:** especificação executável de uma unidade entregável.
- **Destino:** `projects/<slug>/specs/spec-NNN-<titulo>.md` (a partir da raiz do Shizune).
- **Template:** [templates/spec.md](../../../templates/spec.md).
- Spec superada por revisão vai para `archive/` do projeto — nada é apagado (ADR-015).

## Critérios de conclusão

1. `projects/<slug>/specs/spec-NNN-<titulo>.md` existe, com frontmatter v2, numeração sequencial correta e status `vigente`.
2. Todo critério de aceitação é verificável por um agente sem interpretação subjetiva: há ação concreta e resultado observável esperado.
3. O não-escopo é explícito e não vazio (ou a vacuidade está justificada).
4. Todo caso de erro relevante tem comportamento esperado definido.
5. Toda dependência está listada; as que exigem autorização do operador estão marcadas `[AUTORIZAÇÃO]`.
6. Todo requisito rastreia para o `DOMAIN.md`; nenhum contradiz invariante sem decisão registrada.
7. Nenhum número de negócio aparece como fato sem fonte — números não medidos são hipóteses a validar e estão marcados como tal.

## Anti-padrões

- **Spec guarda-chuva.** Vários entregáveis em uma spec só: impossível dar por concluída, impossível auditar.
- **Critério subjetivo.** "Deve ser rápido", "deve funcionar bem" — critérios que dois leitores avaliam de formas diferentes não são critérios.
- **Especificar a implementação em vez do comportamento.** Ditar estrutura interna de código onde bastava definir o observável, amarrando o implementador sem ganho de verificabilidade. (Restrições reais de stack e arquitetura, quando existem no contexto, entram como dependências ou requisitos — com fonte.)
- **Caminho feliz apenas.** Spec sem casos de erro terceiriza as decisões difíceis para o momento errado.
- **Contradição silenciosa.** Requisito que viola invariante do `DOMAIN.md` sem registrar a decisão de mudá-lo.
- **Escopo elástico.** Reabrir e ampliar a spec durante o `implement` em vez de criar spec nova — o desvio deixa de ser rastreável.

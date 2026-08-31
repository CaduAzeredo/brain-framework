---
id: template-spec
tipo: template
projeto: global
status: vigente
data: 2026-08-27
autor: brain-framework
---

# Template — spec.md

Especificação de comportamento (spec-NNN): o contrato que a implementação deve cumprir, escrito ANTES do código. Copie o corpo abaixo, numere sequencialmente dentro do projeto e preencha os `<placeholders>`.
Critérios de aceitação são o coração da spec: cada um precisa ser verificável por teste, comando ou inspeção objetiva — se não dá para verificar, reescreva.

````markdown
---
id: spec-<nnn>-<slug-curto>
tipo: referencia
projeto: <slug-do-projeto>
status: vigente
data: <aaaa-mm-dd>
autor: <autor>
---

# spec-<NNN> — <título da spec>

## Objetivo

<!-- 1-2 frases: que resultado esta spec entrega e por que agora. -->

## Escopo

<!-- O que ESTÁ coberto. Lista curta e concreta. -->

- <item de escopo>

## Não-escopo

<!-- O que fica explicitamente de fora nesta spec (pode virar spec futura). -->

- <item fora de escopo>

## Comportamento esperado

<!-- Descrição do comportamento na linguagem do domínio (referencie o DOMAIN.md do projeto com link relativo). Entrada → processamento → saída, incluindo o caminho feliz completo. -->

## Critérios de aceitação

<!-- Numerados e verificáveis. Cada critério declara COMO verificar (teste, comando, inspeção). Tickets citam "CA3". -->

1. **CA1 —** <critério> — verificação: <como verificar>
2. **CA2 —** <critério> — verificação: <como verificar>

## Casos de erro

<!-- Todo caminho infeliz relevante: entrada inválida, serviço externo fora, estado inesperado. -->

| Caso | Comportamento esperado |
| --- | --- |
| <condição de erro> | <resposta do sistema: mensagem, código, efeito colateral> |

## Dependências

<!-- Specs, ADRs, serviços ou dados de que esta spec depende. Links relativos. -->

- <dependência> — <link-relativo-ou-descrição>

## Riscos

<!-- O que pode dar errado na implementação ou em produção, e a mitigação prevista. -->

- <risco> — mitigação: <mitigação>
````

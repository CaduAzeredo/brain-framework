---
name: domain-modeling
description: Extracts entities, relationships, invariants, and lifecycle states from a validated CONTEXT.md, naming everything with the business vocabulary and recording both the modeling decisions and what is deliberately left out. Use when a project has a current CONTEXT.md but no DOMAIN.md, when the existing domain model is outdated, or before writing specs that depend on domain rules.
id: skill-domain-modeling
tipo: skill
projeto: global
status: vigente
data: 2026-08-27
autor: brain-framework
---

# domain-modeling

## Propósito

Extrair do `CONTEXT.md` as entidades, relações, invariantes e estados do domínio, nomeados com o vocabulário do negócio, produzindo um `DOMAIN.md` que registra também as decisões de modelagem e o que ficou deliberadamente de fora.

## Quando usar

- O projeto tem `CONTEXT.md` vigente mas não tem `DOMAIN.md`, ou o `DOMAIN.md` está desatualizado.
- Antes de rodar `to-spec` para qualquer entregável que dependa de regras de domínio.
- Uma mudança de regra de negócio invalidou parte do modelo existente.

## Quando NÃO usar

- Não existe `CONTEXT.md` vigente — rode `grill-with-docs` primeiro. Modelar sem contexto validado é modelar de memória.
- O trabalho é puramente de infraestrutura ou tooling, sem regra de domínio envolvida.
- A tarefa é implementar contra um modelo já vigente — vá para `to-spec` ou `implement`.

## Entradas

- `projects/<slug>/CONTEXT.md` vigente (saída de `grill-with-docs`).
- As lacunas e contradições registradas nele — o modelo herda essas fronteiras, não as apaga.
- Acesso de leitura ao schema e ao código do projeto, para conferência pontual de nomes e tipos.

## Processo

1. **Verifique a pré-condição.** Confirme que o `CONTEXT.md` está vigente. Se as lacunas registradas nele impedem modelar uma área, não modele essa área: registre-a como bloqueada e, se for central, volte para `grill-with-docs`.
2. **Liste as entidades.** Extraia do contexto os conceitos que o negócio nomeia. Use o vocabulário do negócio como consta nas fontes e nas declarações do operador — não o jargão técnico da implementação. Um conceito, um nome; sinônimos são resolvidos aqui, com o nome canônico registrado.
3. **Defina cada entidade.** Uma frase de definição, os atributos essenciais (não todos os campos da tabela) e o que dá identidade à entidade.
4. **Mapeie as relações.** Entre quais entidades, com que cardinalidade, e o que a relação significa para o negócio.
5. **Extraia os invariantes.** Regras que devem ser sempre verdadeiras (ex.: valores monetários em centavos, autoria validada no banco). Cada invariante cita o trecho do `CONTEXT.md` que o sustenta. Invariante sem fonte no contexto não entra: ou vira lacuna, ou volta para `grill-with-docs`.
6. **Enumere estados e transições.** Para cada entidade com ciclo de vida: os estados possíveis, as transições permitidas, quem ou o quê dispara cada transição, e as transições proibidas quando forem regra relevante.
7. **Registre as decisões de modelagem.** O que foi simplificado, quais alternativas foram descartadas e por quê. Decisão não registrada será rediscutida do zero na próxima sessão.
8. **Declare o que fica fora.** Conceitos vizinhos que o modelo deliberadamente não cobre, com uma linha de justificativa cada.
9. **Escreva o `DOMAIN.md`** no destino indicado na seção Saída, seguindo o template. Frontmatter v2 obrigatório.

## Saída

- **Artefato:** `DOMAIN.md` do projeto.
- **Destino:** `projects/<slug>/DOMAIN.md` (a partir da raiz do Brain).
- **Template:** [templates/projeto/DOMAIN.md](../../../templates/projeto/DOMAIN.md).
- Modelo anterior superado vai para `archive/` do projeto — nada é apagado (ADR-015).

## Critérios de conclusão

1. `projects/<slug>/DOMAIN.md` existe, com frontmatter v2 e status `vigente`.
2. Toda entidade tem definição, atributos essenciais e identidade; todo nome vem do vocabulário do negócio, e cada conceito tem exatamente um nome no documento inteiro.
3. Todo invariante rastreia para um trecho do `CONTEXT.md`.
4. Toda transição de estado tem gatilho e ator identificados.
5. A seção de decisões de modelagem registra as alternativas descartadas.
6. A seção "fora do modelo" existe e é explícita — mesmo que curta.
7. Áreas bloqueadas por lacunas do contexto estão marcadas como bloqueadas, não modeladas por suposição.

## Anti-padrões

- **Modelar de memória.** Escrever o modelo a partir do que o agente "sabe" sobre o projeto em vez do que o `CONTEXT.md` sustenta.
- **Modelar o banco, não o domínio.** Copiar tabelas e colunas como se fossem entidades. O schema é evidência, não modelo.
- **Jargão técnico no lugar do vocabulário do negócio.** "Row", "record", "payload" onde o negócio diz "diária", "memória", "assinatura".
- **Invariante órfão.** Regra "sempre verdadeira" que nenhuma fonte do contexto sustenta — é suposição promovida a lei.
- **Modelo sem recorte.** Incluir todo conceito adjacente "por completude". Modelo que cobre tudo não prioriza nada.
- **Resolver contradição em silêncio.** O contexto registra duas versões de uma regra e o modelo escolhe uma sem registrar a escolha como decisão de modelagem.

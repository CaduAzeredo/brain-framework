---
id: template-skill
tipo: template
projeto: global
status: vigente
data: 2026-08-27
autor: brain-framework
---

# Template — SKILL.md

Esqueleto de skill no formato Anthropic: `name` e `description` em inglês (é o que o agente lê para decidir carregar a skill), seguidos dos 6 campos v2 no MESMO bloco YAML. Copie o corpo abaixo para `skills/<skill-name>/SKILL.md` e preencha.
A `description` decide se a skill é encontrada: escreva o QUANDO usar, em terceira pessoa, com gatilhos concretos.

````markdown
---
name: <skill-name>
description: <What the skill does and WHEN to use it — English, third person, concrete triggers.>
id: skill-<slug>
tipo: skill
projeto: <slug-ou-global>
status: vigente
data: <aaaa-mm-dd>
autor: <autor>
---

# <skill-name>

## Propósito

<!-- 1-2 frases: que resultado esta skill produz e que problema evita. -->

## Quando usar

<!-- Gatilhos concretos para usar — e quando NÃO usar (caso coberto por skill vizinha). -->

- Use quando: <gatilho>
- NÃO use quando: <caso coberto por outra skill> → use <outra-skill>

## Entradas

<!-- O que precisa existir antes de rodar: arquivos, contexto, decisões já tomadas. -->

- <entrada obrigatória>

## Processo

<!-- Passos numerados, imperativos, na ordem de execução. Cada passo com resultado observável. -->

1. <passo>
2. <passo>

## Saída

<!-- O que a skill entrega ao terminar: arquivos criados (caminhos), formato, onde registrar. -->

- <saída esperada>

## Critérios de qualidade

<!-- Como saber que a saída está boa. Verificáveis, não opinativos. -->

- <critério>

## Anti-padrões

<!-- Erros recorrentes que esta skill existe para evitar. Um por linha, com a correção. -->

- <anti-padrão> → em vez disso, <comportamento correto>
````

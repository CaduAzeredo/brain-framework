---
id: template-status
tipo: template
projeto: global
status: vigente
data: 2026-08-27
autor: brain-framework
---

# Template — status.md

Registro de status IMUTÁVEL e datado, para o diretório `logs\`: uma fotografia do estado em um momento, nunca um documento vivo. Copie o corpo abaixo, date o id e o nome do arquivo, preencha e não toque mais.
Errou um fato? Não edite: crie um NOVO registro que corrige e cita este.

````markdown
---
id: status-<aaaa-mm-dd>-<slug>
tipo: status
projeto: <slug-do-projeto>
status: vigente
data: <aaaa-mm-dd>
autor: <autor>
---

# Status — <assunto> (<aaaa-mm-dd>)

> REGISTRO IMUTÁVEL — não editar após criado. Correção é um novo registro que cita este.

## Estado em uma frase

<!-- Uma frase. Se precisar de duas, o estado ainda não está claro. -->

<estado atual em uma frase>

## Fatos

<!-- Só fatos verificados, cada um com fonte (comando executado, arquivo, link relativo). Sem fonte, não entra. -->

| Fato | Fonte |
| --- | --- |
| <fato> | <comando / arquivo / link relativo> |

## Números

<!-- Todo número com data de medição. Número sem data de medição é hipótese, não fato. -->

| Métrica | Valor | Medido em |
| --- | --- | --- |
| <métrica> | <valor> | <aaaa-mm-dd> |

## Próximo gate

<!-- O próximo ponto de verificação ou aprovação: o que precisa acontecer, quem aprova, qual evidência destrava. -->

- <condição> — responsável: <quem aprova> — evidência exigida: <evidência>
````

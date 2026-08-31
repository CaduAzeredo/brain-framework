---
id: template-relatorio
tipo: template
projeto: global
status: vigente
data: 2026-08-29
autor: brain-framework
---

# Template — relatorio.md

Registro datado e IMUTÁVEL de uma rodada de trabalho — auditoria, execução, verificação — para `logs/<ano>/<slug>/`. É o artefato que `logs/` mais produz e o que sustenta toda afirmação do Brain sobre o que foi feito. Copie o corpo abaixo, nomeie o arquivo como `<aaaa-mm-dd>-<hh-mm>-<slug>.md` e preencha durante a rodada, não depois.
Errou um fato? **Não edite.** Crie um relatório novo que preencha "Corrige diagnóstico anterior" apontando para este — é assim que um sistema imutável se corrige sem apagar história.
Seção sem conteúdo escreve "Nenhum" ou "Não se aplica". Seção vazia é lacuna, não opção.

````markdown
---
id: relatorio-<slug-do-assunto>-<aaaa-mm-dd>
tipo: relatorio
projeto: <slug-do-projeto ou global>
status: vigente
data: <aaaa-mm-dd>
autor: <autor>
---

# <Assunto da rodada em uma frase>

> REGISTRO IMUTÁVEL — não editar após criado. Correção é um relatório novo que cita este.

- **Data/hora:** <aaaa-mm-dd hh:mm> (relógio da máquina)
- **Autorização:** <qual autorização cobre esta rodada, e quem a concedeu — ou "nenhuma exigida (T1/T2)">
- **Risco:** <T1 | T2 | T3 | T4>

## Corrige diagnóstico anterior

<!-- Se esta rodada derruba ou revisa uma conclusão de registro anterior, aponte-o aqui com link relativo e diga o que muda. Sem isso, quem ler o registro antigo nunca descobre que ele caiu. Se não corrige nada, escreva "Nenhum". -->

- [<registro anterior>](<caminho-relativo>) — o que caiu: <conclusão anterior> · o que passa a valer: <conclusão nova> · por quê: <o que a nova evidência mostrou>

## Classes de evidência

<!-- Vocabulário fixo. Toda afirmação deste relatório carrega uma destas classes; afirmação sem classe não entra. -->

- **Executado e verificado** — comando rodado nesta rodada, com a saída registrada abaixo.
- **Verificado por leitura** — conferido lendo o código, o documento ou o disco nesta rodada.
- **Não medido** — declarado como pendente; nenhuma afirmação de qualidade é feita sobre ele.

## Achados

<!-- Um por linha. ORIGEM distingue o que a varredura padrão encontraria do que emergiu do raciocínio — é o que permite medir, com contagem em vez de estimativa, quanto do resultado veio do processo e quanto veio da análise. VEREDITO é a verificação adversarial: nenhum achado entra no backlog por parecer plausível; cada um é reaberto no código real, recebe referência arquivo:linha e um dos três vereditos. Refutado NÃO vira tarefa — e reportar o que não é problema vale tanto quanto reportar o que é. -->

| # | Achado | Origem | Veredito | Evidência (`arquivo:linha` ou comando) | Severidade |
| --- | --- | --- | --- | --- | --- |
| 1 | <o que foi encontrado> | `varredura` \| `emergente` | `Confirmado` \| `Parcial` \| `Refutado` | <referência verificável> | <P0 \| P1 \| P2 \| —> |

**Contagem da rodada:** <n> achados — <n> de varredura, <n> emergentes · <n> confirmados, <n> parciais, <n> refutados.

## O que foi feito

<!-- Passos numerados e curtos, no passado. Cada afirmação com sua classe de evidência. -->

1. <o que foi feito> — <classe de evidência>

## Desvios

<!-- Toda diferença entre o que estava planejado e o que foi feito. Desvio sem justificativa registrada é bug de processo, não detalhe. Se não houve, escreva "Nenhum". -->

| Desvio | Justificativa | Aprovado por |
| --- | --- | --- |
| <o que mudou em relação ao plano> | <por quê> | <quem, ou "não aprovado — reportado apenas"> |

## Gate solicitado

<!-- Preencha quando esta rodada PARA e devolve a decisão ao humano fora de um handoff formal (para gates dentro de handoff, use as PARADAs do templates/handoff.md). T4 nunca é delegável a agente. Se a rodada não pede gate, escreva "Nenhum". -->

- **O que aprovar:** <a decisão exata que está nas mãos do operador>
- **Evidência apresentada:** <o que sustenta a decisão: saída de comando, diff, contagem>
- **Risco:** <T3 | T4>
- **O que acontece se não for aprovado:** <consequência de manter o estado atual>

## Evidência executada

<!-- Comando e saída LITERAIS, sem parafrasear. É o que separa este relatório de uma narrativa. -->

```
$ <comando>
<saída literal>
```

## Estimativas

<!-- Só preencha se a rodada projetar prazo ou esforço. Estimativa é HIPÓTESE, nunca promessa: a unidade útil é a SESSÃO (uma conversa até o contexto acabar), não a hora de relógio. Se não há estimativa, escreva "Nenhuma". -->

- **[HIPÓTESE] <o que se estima>:** <n> sessões
- **Âncora real:** <a medição concreta que sustenta o número — o que já foi feito e quanto custou>
- **Fatores que podem estourar, em ordem de risco:** <fator 1>; <fator 2>; <fator 3>
- **Não medido:** <o que ainda não se sabe e que tornaria a estimativa confiável>

## Ficou de fora, de propósito

<!-- O que foi visto e deliberadamente não tratado, com o motivo. Lacuna declarada é achado; lacuna omitida é dívida escondida. -->

- <item> — motivo: <por que não entrou nesta rodada>

## Próximo passo

<!-- A única próxima ação inequívoca, com o comando literal se houver. -->

<próxima ação>
````

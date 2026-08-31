---
id: template-adr
tipo: template
projeto: global
status: vigente
data: 2026-08-27
autor: brain-framework
---

# Template — adr.md

Registro de decisão arquitetural no formato Nygard: contexto → decisão → consequências, imutável depois de aceito (mudou de ideia? novo ADR que supera este — nada é apagado, o superado vai para `archive\`). Copie o corpo abaixo, numere sequencialmente e preencha.
A decisão vem em itens numerados para que specs e tickets possam citar "ADR NNN, item 2".

````markdown
---
id: decisao-<nnn>-<slug-da-decisao>
tipo: decisao
projeto: <slug-ou-global>
status: vigente
data: <aaaa-mm-dd>
autor: <autor>
---

# ADR <NNN> — <decisão em uma frase>

- **Data:** <aaaa-mm-dd>
- **Status:** <proposto | aceito | superado por ADR <NNN>>
- **Decisores:** <quem decidiu>
- **Relacionados:** <ADRs, specs e docs relacionados — links relativos>

## Contexto

<!-- Forças em jogo: o problema, as restrições, as alternativas consideradas e por que a decisão precisa ser tomada agora. Fatos com fonte, não opiniões. -->

## Decisão

<!-- Itens numerados, afirmativos, no presente ("Adotamos X", "O serviço Y nunca faz Z"). Cada item deve poder ser citado isoladamente. -->

1. <decisão>
2. <decisão>

## Consequências

<!-- O que fica melhor, o que fica pior, o que passa a ser proibido ou obrigatório. Consequência negativa omitida cobra juros depois. -->

- **Positivas:** <consequência>
- **Negativas / custos:** <consequência>
- **Obrigações criadas:** <o que passa a ser exigido daqui em diante>

---

> Ao criar este ADR, adicione a linha correspondente no índice do catálogo de ADRs da sua instância (por padrão, `governance/adr/README.md`).
````

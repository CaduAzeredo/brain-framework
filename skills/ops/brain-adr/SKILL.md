---
name: brain-adr
description: How to write an ADR (Architecture Decision Record) for the Brain. Use when recording a new decision, superseding an existing ADR, or citing ADRs across projects. Triggers: "criar ADR", "registrar decisão", "novo ADR", "superar ADR", "write an ADR", "record this decision".
id: skill-brain-adr
tipo: skill
projeto: global
status: vigente
data: 2026-08-27
autor: brain-framework
---

# Brain ADR

Esta skill define como redigir, numerar e registrar um ADR do Brain, e como referenciar ADRs de outros projetos sem colisão de namespace. As regras de numeração e supersessão vêm do ADR-015 (saneamento do catálogo de ADRs).

## Propósito

Garantir que cada decisão do Brain fique registrada uma única vez, com número único, formato previsível e trilha de supersessão explícita — sem jamais reescrever a história.

## Quando usar

- Uma decisão de arquitetura, governança ou processo foi tomada e precisa virar registro.
- Uma decisão existente foi substituída e o ADR antigo precisa ser marcado como superado.
- Um documento do Brain precisa citar um ADR de outro projeto e há risco de ambiguidade de numeração.

## Processo

1. **Confirme que é uma decisão, e apenas uma.** Um ADR = uma decisão. Se o texto está registrando duas decisões independentes, são dois ADRs. Se ainda não há decisão (só análise), não é ADR.
2. **Determine o número.** O número do ADR novo é o maior número já existente **mais um**, olhando os arquivos `adr-NNN-<slug>.md` em `governance/adr/`. Se a instância mantiver também uma tabela de registro própria, considere as duas fontes ao mesmo tempo e use o maior número das duas. NUNCA renumere um ADR existente e NUNCA preencha buracos de numeração — buracos são história, e preenchê-los quebra a ordem cronológica.
3. **Crie o arquivo** `governance/adr/adr-NNN-<slug>.md` a partir do template `templates/adr.md`. Frontmatter v2 completo, depois o corpo no formato Nygard:
   - **Contexto** — os fatos que forçaram a decisão, com fontes. Sem contexto, a decisão parece arbitrária daqui a seis meses.
   - **Decisão** — o que foi decidido, em itens numerados, no imperativo. Cada item é verificável.
   - **Consequências** — efeitos esperados, positivos e negativos, incluindo o que passa a ser proibido, o que fica pendente e o que quebra de propósito.
4. **Registre o ADR no índice.** O índice do catálogo é `governance/adr/README.md`: uma linha por ADR, com número, data, resumo da decisão e status. ADR sem linha no índice é ADR órfão — existe no disco e não existe no catálogo, que é como um catálogo deixa de ser confiável. Instância que mantenha o registro em outro lugar segue o próprio mapa, mas a regra não muda: nenhum ADR fica fora do índice.
5. **Supersessão nunca edita conteúdo.** Quando o ADR novo substitui um antigo, as únicas alterações no antigo são o campo `status` do frontmatter, que passa a `superado`, e a célula de status no índice, que recebe a marca `Superado por ADR-NNN`. O corpo do ADR antigo não é alterado, apagado nem renumerado: é registro de estado, não reescrita. Quem lê o ADR superado precisa ver o que se decidiu na época, não uma versão corrigida pelo futuro.
6. **Prefixe referências cross-projeto.** ADR citado sem prefixo é, por definição, ADR desta instância. ADR de outro projeto leva sempre o prefixo do projeto: `ProjetoA/ADR-001`, `ProjetoB/ADR-002`. Nunca cite um ADR de projeto pelo número puro — os namespaces colidem.

## Saída

- Um arquivo `governance/adr/adr-NNN-<slug>.md` novo, formato Nygard, frontmatter completo.
- Uma linha nova no índice do catálogo.
- Se houver supersessão: o `status` do ADR superado em `superado` e a linha dele no índice marcada `Superado por ADR-NNN` — e nada mais alterado.

## Critérios

1. O número é maior que todos os existentes; nenhum buraco foi preenchido, nada foi renumerado.
2. O ADR registra exatamente uma decisão.
3. As três seções Nygard estão presentes e o Contexto cita fontes verificáveis.
4. A linha correspondente existe no índice do catálogo, com o mesmo número, data e status do arquivo.
5. Nenhum ADR existente teve o corpo editado; supersessão aparece apenas como status no frontmatter e marca no índice.
6. Toda referência a ADR de outro projeto carrega o prefixo do projeto (`ProjetoA/`, `ProjetoB/`).
7. Frontmatter v2 completo, slug em kebab-case, corpo em PT-BR.

## Anti-padrões

- **Renumerar ou preencher buracos.** O catálogo do Brain já teve número duplicado com dois assuntos distintos e saltos de numeração. A resposta correta foi documentar a inconsistência e seguir em frente (ADR-015) — nunca reescrever números, que quebraria toda referência existente.
- **ADR órfão.** Criar o arquivo avulso sem registrar a linha na tabela. O catálogo se divide em dois índices que se desconhecem.
- **ADR guarda-chuva.** Empacotar três decisões em um ADR porque nasceram na mesma sessão. Supersessão parcial fica impossível: não há como superar um terço de um ADR.
- **Superar editando.** "Atualizar" o ADR antigo para refletir a decisão nova. ADR é registro imutável; quem muda é o status na tabela, e a história permanece legível.
- **Citação sem prefixo.** Escrever "conforme o ADR-002" em documento do Brain quando a intenção era o ADR-002 de outro projeto. O leitor resolve para o ADR errado sem perceber.
- **ADR de decisão não tomada.** Registrar como ADR algo ainda em discussão. Rascunho tem lugar, mas o status precisa dizer isso explicitamente — e a decisão só numera a tabela quando existir.

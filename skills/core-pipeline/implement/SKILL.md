---
name: implement
description: Implements code against an approved spec in the project repository, adversarially re-verifying every finding at file:line before touching it (Confirmed, Partial or Refuted — refuted findings never become edits), one feature at a time and closed before the next (implemented, tested, whole suite green), with testability treated as a design constraint rather than a final step, small diffs, tests accompanying the code, Conventional Commits, and a ticket kept as an execution diary where every decision and deviation is recorded and justified. Use when a current spec exists and the operator has explicitly authorized writing to the project repository; when feasibility is still the open question, a throwaway prototype comes first, and scope deviations route back to to-spec instead of being improvised.
id: skill-implement
tipo: skill
projeto: global
status: vigente
data: 2026-08-31
autor: brain-framework
---

# implement

## Propósito

Implementar contra a spec, no repositório do projeto, deixando trilha auditável: uma funcionalidade por vez, fechada antes da próxima, diffs pequenos, testes junto do código, Conventional Commits e um ticket que funciona como diário de execução — decisões e desvios registrados e justificados.

## Quando usar

- Existe spec vigente em `projects/<slug>/specs/` cobrindo o entregável.
- O operador autorizou explicitamente a escrita no repositório do projeto nesta sessão.
- Um ticket anterior parou no meio e a retomada continua dentro da mesma spec.

## Quando NÃO usar

- Não há spec vigente para o trabalho — rode `to-spec` primeiro. Código sem spec não tem critério de pronto.
- Não há autorização explícita do operador para escrever fora da raiz do Brain — toda escrita em repositório de projeto exige essa autorização; sem ela, o limite é diagnóstico e leitura.
- O que a spec pede contradiz o que o repositório mostra — o caso é voltar para `to-spec` (e talvez `grill-with-docs`), não implementar por cima da contradição.
- A dúvida principal ainda é **viabilidade** (integração desconhecida, API sem documentação confiável, desempenho incerto). O caminho barato é um **protótipo descartável**, feito para ser jogado fora, antes de gastar spec e implementação: descobrir que não funciona custa pouco no protótipo e custa a rodada inteira depois. Três condições, sem exceção: (a) vive fora do caminho de produção; (b) é declarado protótipo no registro, com a evidência classificada como local ou não validada, nunca como evidência de produção; (c) não dispensa a spec — se o protótipo dá certo, a spec vem depois e o código é reescrito. O que se aproveita é o aprendizado, não o arquivo.

## Entradas

- `projects/<slug>/specs/spec-NNN-<titulo>.md` vigente.
- Autorização explícita do operador para escrever no repositório do projeto (registrada no ticket: quem, quando, para quê).
- Acesso ao repositório do projeto e à sua suíte de testes.
- Os tickets existentes em `projects/<slug>/tickets/`, para numeração.

## Processo

1. **Verifique as pré-condições.** Spec vigente e autorização de escrita registrada. Sem qualquer uma das duas, pare aqui.
2. **Abra o ticket.** Crie `projects/<slug>/tickets/ticket-NNN-<titulo>.md` a partir do template — de preferência com o mesmo `NNN` da spec quando a relação é um-para-um. Registre: spec de referência (link relativo), objetivo, autorização recebida.
3. **Diagnostique antes de executar (ADR-007).** Leia o código que será tocado, rode a suíte de testes completa antes de qualquer alteração e registre o baseline no ticket (total de testes, passando, falhando). Baseline quebrado é achado a reportar, não a herdar em silêncio. **Suíte ausente ou não confiável não é detalhe de ambiente:** construí-la passa a ser a primeira tarefa da frente, não a última — sem ela não existe como saber se a funcionalidade 21 quebrou alguma das 20 anteriores.
4. **Reverifique cada achado ANTES de editar — passo bloqueante.** Nenhum defeito vira edição por parecer plausível ou por ter sido descrito em um relatório anterior. Para cada achado que esta rodada pretende corrigir, reabra o código real e registre no ticket três coisas: a referência exata (`arquivo:linha`), o que o código faz de fato naquele ponto, e um **veredito** — `Confirmado`, `Parcial` ou `Refutado`.
   - **Refutado não vira edição.** O achado é rebaixado por escrito no ticket, com o que a releitura mostrou. Reportar o que **não** é problema vale tanto quanto reportar o que é, e evita a correção que quebra código são.
   - **Parcial vira escopo menor**, não escopo original. O que sobrou do achado é registrado como parte confirmada; o resto é rebaixado.
   - Um achado que veio de sessão anterior é o caso mais perigoso: o diagnóstico pode ter envelhecido, e o código pode já ter mudado. Releitura é obrigatória, não cortesia.
5. **Implemente uma funcionalidade por vez, em diffs pequenos.** Cada commit é uma unidade coerente e reversível. Os testes da unidade entram no mesmo commit que o código — nunca "depois".
   - **Fechada antes da próxima.** Uma funcionalidade só está fechada quando está implementada, testada e com a suíte **inteira** verde. Não abra a seguinte com a suíte vermelha. O motivo é isolamento de causa: com a integração adiada para o fim, o defeito pode ter nascido em qualquer uma das peças e no encontro entre elas — o espaço de busca cresce mais rápido que o número de módulos, e o tempo de depuração deixa de ser previsível.
   - **Testabilidade é restrição de desenho.** Se escrever o teste está difícil, o problema é o desenho e não o teste: extraia a dependência, separe decisão de efeito, estreite a interface. Código que só admite verificação manual é débito técnico por definição, e o preço aparece na vigésima funcionalidade, não na primeira.
6. **Use Conventional Commits.** `feat:`, `fix:`, `test:`, `refactor:`, `docs:`, `chore:` — tipo correto, descrição no imperativo, escopo quando ajudar.
7. **Mantenha o diário.** A cada decisão relevante (escolha entre alternativas, interpretação de ponto ambíguo da spec, achado inesperado), uma entrada no ticket com data e justificativa. O ticket conta a história real da execução, não a versão limpa.
8. **Trate desvio de escopo como parada, não como licença.** Se a spec se revelar errada, incompleta ou impossível: pare, registre o desvio no ticket e volte para `to-spec` (revisão ou spec nova). Não improvise a correção "já que está aqui". Problemas fora do escopo encontrados no caminho são registrados como achados no ticket — não corrigidos nesta frente.
9. **Zero segredos (ADR-007).** Nenhum segredo em código, commit, log ou ticket. Segredo encontrado no caminho é incidente a reportar ao operador, nunca a copiar.
10. **Feche com verificação.** Rode a suíte completa ao final. Percorra os critérios de aceitação da spec um a um, registrando no ticket a evidência de cada um: comando executado e resultado observado.
11. **Encerre o ticket.** Estado final: critérios atendidos (checklist com evidências), pendências e achados explícitos, e o que ficou para outra frente. Se a sessão termina aqui, o encerramento formal da rodada é a skill `handoff`.

## Saída

- **Artefato:** código e testes no repositório do projeto (fora do Brain, sob autorização explícita) + ticket de execução no Brain.
- **Destino do ticket:** `projects/<slug>/tickets/ticket-NNN-<titulo>.md` (a partir da raiz do Brain).
- **Template:** [templates/ticket.md](../../../templates/ticket.md).

## Critérios de conclusão

1. Todo achado que virou edição foi reverificado **antes** dela, com `arquivo:linha` e veredito registrados no ticket; nenhum achado refutado gerou alteração de código.
2. Todos os critérios de aceitação da spec estão verificados um a um no ticket, cada um com comando e resultado observado — ou marcados como pendência explícita com justificativa.
3. A suíte de testes completa passa; qualquer falha remanescente está registrada no ticket e aceita explicitamente pelo operador.
4. Todo commit segue Conventional Commits e nenhum mistura unidades não relacionadas.
5. Todo desvio da spec está registrado no ticket com justificativa; desvios de escopo voltaram para `to-spec`, não foram improvisados.
6. Nenhum segredo entrou em código, commit ou ticket.
7. O ticket tem estado final claro: entregue, pendente e achados fora de escopo.
8. Nenhuma funcionalidade nova foi aberta com a suíte vermelha — o histórico de commits mostra cada incremento fechado antes do seguinte.
9. Nenhum código entrou sem teste automático; onde não foi possível, o ticket registra o porquê e o desenho que impediu — não uma promessa de teste futuro.

## Anti-padrões

- **Corrigir por confiança no relatório.** Editar porque um achado está escrito em algum documento, sem reabrir o código. O achado pode ter envelhecido, ter sido descrito com imprecisão ou já ter sido corrigido — e a "correção" quebra o que estava são.
- **Implementar sem diagnóstico.** Alterar código sem ler o entorno nem rodar o baseline — a causa clássica de regressão "misteriosa".
- **Commit gigante.** Um diff que mistura feature, refactor e correção não é revisável nem reversível.
- **Testes depois.** "Primeiro o código, testes no final" — o final chega sem testes, e o defeito sobrevive exatamente no caminho não testado.
- **Improviso silencioso.** A spec diverge da realidade e o implementador "resolve" sozinho, sem registro. O desvio invisível de hoje é a citação circular de amanhã.
- **Escopo elástico.** Corrigir problemas vizinhos "já que estou aqui" — cada correção fora de escopo é mudança sem spec e sem critério de pronto.
- **Ticket cosmético.** Diário escrito ao final, contando a versão limpa. O valor do ticket está nas decisões e nos desvios registrados quando aconteceram.
- **Escrever sem autorização.** Qualquer escrita fora da raiz do Brain sem autorização explícita do operador viola a governança, ainda que o código esteja correto.
- **Integração adiada para o fim.** Construir várias peças em paralelo e juntá-las só no final. Quando o defeito aparece, ele pode estar em qualquer uma delas ou na costura, e o custo de isolar cresce mais rápido que o número de peças.
- **Teste pulado por dificuldade.** "Esse trecho é difícil de testar" tratado como característica do trecho, e não como sintoma do desenho. O teste difícil é o aviso chegando cedo; ignorá-lo é pagar o mesmo preço depois, com juros.
- **Protótipo promovido a produção.** O código feito para ser jogado fora sobrevive porque "já está funcionando". Ele foi escrito sob outras premissas, sem spec e sem critério de pronto — promovê-lo é entrar em produção com dívida que ninguém contratou.
- **Confiança como evidência.** "Está funcionando" sem comando executado e saída registrada. Um implementador seguro de si e um implementador errado são indistinguíveis pelo tom; só a evidência os separa.

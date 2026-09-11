# Auditoria conjunta dos fluxos ANA-01 a ANA-05 — 31/08/2026

Relatório visual: `auditoria-ana.html` (publicado como artifact).
Base: `ana_leads`, `ana_mensagens`, `ana_config`, `ana_auditorias`, `ana_precos` + JSON do ANA-02.
Período: 15/08 a 31/08/2026 · 11.394 mensagens · 524 leads.

## Estado dos fluxos

| Fluxo | Estado |
|---|---|
| ANA-01 Atendimento | no ar |
| ANA-02 Follow-up | desligado (bloqueio do WhatsApp) |
| ANA-03 Resumo diário | ativo, sem conseguir entregar |
| ANA-04 Auditoria | parou — última nota em 24/08 |
| ANA-05 / ANA-06 Agenda | nunca publicados |

## A dinâmica

Nenhum fluxo fala com outro: todos escrevem e leem `ana_leads`. Por isso desligar um fluxo
derruba funções aparentemente sem relação — foi o que aconteceu com a retomada do bot.

## Achados críticos

1. **A agenda não chega ao banco.** ANA-05/06 nunca publicados → só 19 dos 524 leads têm
   agendamento registrado, enquanto a agenda real tem dezenas por semana.
2. **A retomada do bot está presa dentro do ANA-02.** O nó *Retomar Pós-Humano (24h)* mora no
   fluxo de envio, que está desligado. 101 leads com bot pausado (19% da base); 14 já passaram
   das 24h e nunca voltarão sozinhos.
3. **Passo da cadência contado em dobro.** `Montar Payload FU` faz `followup_step + 1`, mas a
   função do banco já incrementou. O paciente pula o D+1 e recebe o xeque-mate do D+14 como
   segunda mensagem. Correção: `const step = Number(lead.followup_step) || 1;`
4. **Retentativa nasce morta.** `Adiar Retentativa` e `Reverter Passo` não apagam a linha do
   `ana_envios_log` — a retentativa nunca dispara e a mensagem falha queima uma das 20 do dia.

## Custo de processamento — 95% é repetição

| Medida (14 dias) | Valor |
|---|---|
| Chamadas ao modelo | 1.524 (~109/dia) |
| Prompt reenviado por chamada | ~13.000 tokens, idêntico |
| Total estimado de entrada | ~20 milhões — ~19 milhões repetidos |
| Mensagens do paciente | 3.881 |
| Chegaram em rajada (<60s) | 1.975 · **51%** |

Três correções, nenhuma muda o comportamento da Ana:

- **Cache do prompt:** `system: [{ type: "text", text: PROMPT, cache_control: { type: "ephemeral" } }]`
- **Janela de 15s** antes de responder, agrupando a rajada numa resposta só
- **Prompt curto e dedicado** para o follow-up (hoje carrega os 47 mil caracteres para escrever 2 linhas)

## Aplicado nesta rodada

Bloco `<economia_de_turnos>` inserido no system prompt (`ana_config.system_prompt`, agora com
47.715 caracteres): não repetir pergunta já respondida, não reenviar preço/preparo/menu já
enviados, responder mensagens em rajada de uma vez só, não gastar mensagem em "ok!" sem
conteúdo, e não reescrever o `resumo_interno` quando nada mudou.

## Plano, na ordem

1. Descobrir e desligar o outro disparador que age no mesmo número
2. Tirar a retomada do bot de dentro do ANA-02 (fluxo próprio)
3. Publicar ANA-05 e ANA-06
4. Aplicar cache do prompt e janela de 15s
5. Corrigir os quatro bugs do ANA-02
6. Voltar auditoria e resumo diário

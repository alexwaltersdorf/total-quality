# Bloqueio do WhatsApp — o que aconteceu e o que já foi travado

**22/08/2026** · Fonte: `ana_mensagens` e `ana_leads` (Supabase), 3.363 mensagens enviadas desde 15/08.

## 1. O que o WhatsApp viu

| Dia | Enviadas | Números | Recebidas | Enviadas por recebida |
|---|---|---|---|---|
| 15/08 | 8 | 1 | 9 | 0,9 |
| 16/08 | 72 | 11 | 96 | 0,8 |
| 17/08 | 845 | 117 | 706 | 1,2 |
| 18/08 | 607 | 151 | 492 | 1,2 |
| 19/08 | 715 | 153 | 551 | 1,3 |
| 20/08 | 822 | 178 | 657 | 1,3 |
| **21/08** | **294** | **103** | **5** | **58,8** |

Em 21/08 a conversa deixou de ser conversa: **103 pessoas receberam mensagem e 99 não responderam**
(3,9% de resposta). É exatamente o sinal que o WhatsApp usa para classificar um número como spam.

E dois agravantes de contexto: o número saiu de **8 mensagens no primeiro dia para 845 no terceiro**,
sem nenhum aquecimento — e em quatro dias seguidos passou de 600 mensagens/dia.

## 2. A causa raiz: a fila nunca esvaziava

Os disparos de 21/08 saem **de 30 em 30 minutos, cravado nos minutos :01 e :31**, em rajadas de
5 a 11 conversas novas em menos de um minuto.

O motivo: o ANA-02 roda a cada 30 minutos e **não consumia o `followup_due_at` depois de enviar**.
O lead continuava "vencido" e era selecionado de novo na rodada seguinte. E de novo. E de novo.

Foi assim que a paciente do número …5686 recebeu **6 mensagens em 8 horas**, sem responder nenhuma —
as duas últimas **palavra por palavra iguais**:

> 15:32 — *"Oi, Vihh! 😊 Conseguiu passar no médico? Se ele já pediu os exames, manda uma foto do pedido que eu te passo o orçamento completo hoje mesmo, tá bom?"*
> 17:32 — *"Oi, Vihh! 😊 Conseguiu passar no médico? Se ele já pediu os exames, manda uma foto do pedido que eu te passo o orçamento completo hoje mesmo, tá bom?"*

No mesmo dia, **67 números receberam de 3 a 6 mensagens** — 42 deles receberam 5 ou 6.

O contador da cadência confirma a falha: o `followup_step` mais alto em toda a base é **2**, enquanto
gente recebia 6 mensagens no dia. A régua D+1 / D+3 / D+7 / D+14 / D+30 estava certa no prompt da Ana;
o encanamento é que estava furado.

**Agravantes menores:**
- 41 leads com `proxima_acao = "aguardar_resposta"` tinham follow-up agendado — quem está esperando
  resposta não deveria estar na fila de venda. Mais 2 já agendados, 4 aguardando confirmação e 1 escalado.
- 69 mensagens fora do horário comercial (2% do total) — não foi a causa, mas soma.
- **Contribuição minha:** em 19/08 eu antecipei o `followup_due_at` de 9 leads de ultrassonografia para
  dentro dessa janela. É pouco perto do laço de repetição, mas joguei lenha na fogueira.

## 3. O que já está travado (feito agora)

| Trava | Estado |
|---|---|
| 203 follow-ups agendados | **zerados** — 141 estavam vencidos e sairiam na próxima rodada |
| Backup para restaurar depois | `ana_followup_suspenso_2026_08` (203 linhas) |
| Teto diário de envios | **0** — nenhuma mensagem proativa passa, mesmo se a fila for repovoada |
| ANA-06 (confirmação de véspera) | continua desativado |

## 4. A guarda que impede a repetição

As regras saíram do workflow e foram para **dentro do banco**, na função `ana_claim_followups()`.
O ANA-02 passa a chamar só ela, e ela devolve os leads **já marcados como enviados**:

1. **Consome a vaga na hora** (`followup_due_at = NULL` + `followup_step + 1`) na mesma transação —
   é isso que quebra o laço de repetição.
2. **No máximo 1 mensagem proativa por paciente por dia** (conta follow-up e lembrete de véspera juntos).
3. **Para depois de 2 follow-ups seguidos sem resposta** — antes ia até o D+30 mesmo no silêncio.
4. **Teto diário global**, configurável em `ana_config.followup_teto_diario`.
5. **Só em horário comercial, de segunda a sexta.**
6. **Nunca escreve para quem nunca escreveu** (`last_patient_msg_at IS NOT NULL`).
7. **Fora da fila:** opt-out, escalados, já agendados e quem passou dos 5 passos da cadência.
8. **90 segundos entre mensagens** no ANA-06 (era rajada).

### Teste da guarda (transação revertida)

| Cenário | Leads liberados |
|---|---|
| Sábado meio-dia | 0 |
| Segunda 06:00 | 0 |
| Segunda 19:00 | 0 |
| **Segunda 12:00 — 1ª chamada** | **7** |
| **Segunda 12:30 — 2ª chamada** | **0** ← aqui o sistema antigo reenviaria os mesmos 7 |
| Terça | 0 |

## 5. Para religar (só depois do WhatsApp desbloqueado)

1. Restaurar a fila a partir de `ana_followup_suspenso_2026_08`.
2. Subir o teto **aos poucos**: 20/dia na primeira semana, +20 por dia enquanto a taxa de resposta
   ficar acima de ~30%. Se cair abaixo disso, parar e rever a mensagem — não o volume.
3. Acompanhar diariamente a razão enviadas/recebidas. Acima de 2,0 é sinal amarelo; acima de 5,0
   é parar na hora.

## 6. Pendência que depende de você

**Desativar o fluxo "ANA — 02 Follow-up Carinhoso" no n8n.** Eu não consigo — o fluxo não está
liberado para acesso MCP. As travas de banco já impedem qualquer envio, mas com o workflow ligado
ele continua acordando de 30 em 30 minutos e batendo no banco à toa.

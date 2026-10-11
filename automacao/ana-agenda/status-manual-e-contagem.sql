-- Status do lead: automatico por padrao, com a palavra final de quem atende.
--
-- O automatico continua saindo da conversa, em ana_relatorio_conversas.
-- status_manual sobrepoe quando preenchido, e NULL significa "siga o automatico".
-- edge-historico.ts devolve os dois lado a lado: sa = automatico, sm = manual,
-- s = sm ?? sa.
--
-- Dois valores nao saem do automatico, de proposito:
--   Encerrado  quem fecha o assunto e a pessoa que atende, nao a conversa
--   Follow-Up  e uma ordem, nao uma leitura: recoloca o lead na regua da Ana
alter table public.ana_leads
  add column if not exists status_manual text,
  add column if not exists status_manual_em timestamptz;

alter table public.ana_leads drop constraint if exists ana_leads_status_manual_ck;
alter table public.ana_leads
  add constraint ana_leads_status_manual_ck
  check (status_manual is null or status_manual = any (
    array['Agendou','Não Agendou','Não Aplica','Encerrado','Follow-Up']));

-- Contagem de mensagens por telefone, e quando foi a ultima. O PostgREST nao
-- faz group by, e sem esta view o modo lista teria de baixar as 38 mil
-- mensagens so para contar. 'ultima' tambem e o que ordena a lista do painel.
create or replace view public.ana_msgs_contagem as
select phone, count(*)::int as n, max(created_at) as ultima
  from ana_mensagens group by phone;

-- ---------------------------------------------------------------------------
-- Exame ja realizado: agendamento.realizado
--
-- O Status so virava "Agendou" com agendamento.status = 'confirmado', que
-- depende da sincronizacao com o Google Agenda casar o evento com o lead pelo
-- telefone. Essa sincronizacao alcanca 61% dos eventos (ver
-- ANA-05-validacao-agenda-real.md), entao quem agendou pela recepcao ficava
-- como "Não Agendou" para sempre, mesmo depois de vir fazer o exame.
--
-- O sinal confiavel esta na conversa: ninguem pede o resultado, o laudo, a
-- nota fiscal ou a retirada de um exame que nao fez. A Ana passa a marcar
-- agendamento.realizado = true quando ve esse sinal (regra no system_prompt).
--
-- O campo entra DENTRO do jsonb que ja existe, em vez de virar um valor novo
-- de agendamento.status, porque doze objetos do banco testam esse status e
-- todos continuariam corretos sem saber da chave nova.
--
-- A alteracao em ana_relatorio_conversas e so o segundo WHEN do CASE do status.
-- O array_to_string usa chr(59) no lugar do literal com ponto e virgula: o
-- cliente SQL do MCP quebra o comando nesse caractere, mesmo dentro de string.
-- ---------------------------------------------------------------------------

-- em ana_relatorio_conversas, no CASE que decide o status:
--   WHEN (l.agendamento ->> 'status') = 'confirmado' THEN 'Agendou'
--   WHEN (l.agendamento ->> 'realizado')::boolean IS TRUE THEN 'Agendou'   <= novo
--   WHEN <regex de exame que a clinica nao faz> THEN 'Não Aplica'
--   ELSE 'Não Agendou'

-- ---------------------------------------------------------------------------
-- Quem sai da regua
--
-- Perseguir com follow-up quem ja veio na clinica, ou quem foi fechado a mao
-- no painel, e o pior erro que essas rotinas podem cometer. As duas ganharam
-- a mesma guarda:
--
--   AND coalesce((agendamento->>'realizado')::boolean, false) = false
--   AND coalesce(status_manual, '') NOT IN ('Agendou','Encerrado','Não Aplica')
--
-- em ana_claim_followups (no CTE elegiveis) e em ana_retomar_pos_humano (no
-- CASE que remarca followup_due_at).
--
-- O caminho contrario, marcar Follow-Up no painel, e feito pela Edge Function
-- historico: alem de gravar status_manual ela precisa de followup_due_at,
-- escalado = false e proxima_acao de follow-up, senao a regua nao pega o lead.
-- Opt-out nunca e reaberto por marcacao no painel.

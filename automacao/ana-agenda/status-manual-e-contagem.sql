-- Status manual: a palavra final de quem atende, sobre o status que a conversa
-- produz sozinha. NULL significa "siga o automatico".
--
-- 'Encerrado' nao sai do automatico de proposito: quem fecha o assunto e a
-- pessoa que atende, nao a conversa. Os outros tres continuam calculados em
-- ana_relatorio_conversas, e edge-historico.ts devolve os dois lado a lado
-- (sa = automatico, sm = manual, s = sm ?? sa).
alter table public.ana_leads
  add column if not exists status_manual text,
  add column if not exists status_manual_em timestamptz;

alter table public.ana_leads
  add constraint ana_leads_status_manual_ck
  check (status_manual is null or status_manual = any (
    array['Agendou','Não Agendou','Não Aplica','Encerrado']));

-- Contagem de mensagens por telefone. O PostgREST nao faz group by, e sem esta
-- view o modo lista teria de baixar as 38 mil mensagens so para contar.
create or replace view public.ana_msgs_contagem as
select phone, count(*)::int as n, max(created_at) as ultima
  from ana_mensagens group by phone;

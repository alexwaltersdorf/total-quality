-- ============================================================================
-- Ultrassonografia parada: destravar e priorizar  (30/10/2026)
-- ----------------------------------------------------------------------------
-- Em 30/10 apareceram 45 pacientes de ultrassom com agendamento->>'status' =
-- 'proposto' ha 15 a 71 dias. No painel pareciam agendados; para a regua eram
-- invisiveis, porque 'proposto' estava na guarda que protege quem esta no meio
-- do agendamento. A guarda os condenava ao silencio.
--
-- Duas coisas foram feitas:
--   1. uma excecao estreita em ana_claim_followups (abaixo, so documentada)
--   2. ultrassom_destrava_proposto() e ultrassom_prioriza_hoje()
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. A excecao na regua (aplicada em producao, aqui so para registro)
-- ----------------------------------------------------------------------------
-- Dentro do WHERE de ana_claim_followups, a guarda de agendamento passou de
--
--   AND coalesce(l.agendamento->>'status','nenhum') NOT IN ('confirmado','proposto')
--
-- para
--
--   AND (coalesce(l.agendamento->>'status', 'nenhum') NOT IN ('confirmado', 'proposto')
--        OR (coalesce(l.agendamento->>'status', '') = 'proposto'
--            AND l.proxima_acao = 'follow_up_retomada'
--            AND l.last_patient_msg_at < v_agora - interval '15 days'))
--
-- A excecao e estreita de proposito: so o ramo de retomada, que assume a falha
-- da clinica, e so depois de 15 dias de silencio do paciente. Nada mais do
-- resto da funcao foi tocado.

-- ----------------------------------------------------------------------------
-- 2. Priorizar um conjunto de exames na fila do dia
-- ----------------------------------------------------------------------------
-- A regua ordena por followup_due_at crescente e tira UM por vez. Para colocar
-- um grupo na frente basta recuar a data de vencimento dele.
--
-- ARMADILHA: "now() - interval '2 hours'" NAO basta e foi o primeiro erro aqui.
-- A fila ja tinha 195 vencidos de dias atras; os 37 priorizados cairam atras
-- deles e a funcao reportou "37 priorizados" como se tivesse funcionado. A
-- ancora tem de ser mais antiga que o vencido mais antigo da fila inteira.
-- Dentro do lote, quem esta ha mais tempo em silencio sai primeiro.
--
-- Conferir SEMPRE depois de rodar, por posicao na fila e nao pela contagem que
-- a funcao devolve.

CREATE OR REPLACE FUNCTION public.ultrassom_prioriza_hoje()
 RETURNS TABLE(priorizados bigint, retomadas bigint, d1 bigint, mais_antigo integer)
 LANGUAGE plpgsql
AS $function$
declare
  v_base timestamptz;
begin
  select coalesce(min(l.followup_due_at), now()) - interval '1 day'
    into v_base
    from public.ana_leads l
   where l.followup_due_at is not null
     and coalesce(l.opt_out,false)=false and l.bot_ativo is true
     and l.proxima_acao like 'follow\_up%';

  return query
  with mex as (
    update public.ana_leads l
       set followup_due_at = v_base
             - (coalesce(extract(day from now()-l.last_patient_msg_at),0) || ' minutes')::interval,
           updated_at = now()
     where l.followup_due_at is not null
       and coalesce(l.opt_out,false)=false and l.bot_ativo is true
       and coalesce(l.escalado,false)=false
       and l.proxima_acao like 'follow\_up%'
       and coalesce((l.agendamento->>'realizado')::boolean,false)=false
       and coalesce(l.status_manual,'') not in ('Agendou','Encerrado','Não Aplica')
       and coalesce(l.followup_step,0) < 5
       and not exists (select 1 from ana_contatos_nao_paciente n where n.phone=l.phone)
       and array_to_string(array(select jsonb_array_elements_text(l.exames)),' ')
           ~* '(abdome?n? total|abdominal total|rins|renal|vias urin|transvaginal|mam[aá]ri|de mama|das mamas|tire[oó]ide|car[oó]tid|vertebrai)'
    returning l.proxima_acao as pa,
              extract(day from now()-l.last_patient_msg_at)::int as dias)
  select count(*),
         count(*) filter (where mex.pa='follow_up_retomada'),
         count(*) filter (where mex.pa<>'follow_up_retomada'),
         max(mex.dias)
    from mex;
end $function$;

-- Conferencia obrigatoria: a pior posicao do alvo tem de ser igual ao tamanho
-- do alvo. Se for maior, a ancora nao recuou o suficiente.
--
--   with fila as (
--     select l.phone,
--            array_to_string(array(select jsonb_array_elements_text(l.exames)),' ') as ex,
--            row_number() over (order by l.followup_due_at) as pos
--       from ana_leads l
--      where l.followup_due_at is not null
--        and coalesce(l.opt_out,false)=false and l.bot_ativo is true
--        and coalesce(l.escalado,false)=false
--        and l.proxima_acao like 'follow\_up%'
--        and coalesce((l.agendamento->>'realizado')::boolean,false)=false
--        and coalesce(l.status_manual,'') not in ('Agendou','Encerrado','Não Aplica')
--        and coalesce(l.followup_step,0) < 5
--        and not exists (select 1 from ana_contatos_nao_paciente n where n.phone=l.phone))
--   select max(pos) filter (where ex ~* '<padrao>') as pior_posicao,
--          count(*) filter (where ex ~* '<padrao>') as alvo
--     from fila;

-- ----------------------------------------------------------------------------
-- 3. Os tetos, e por que eles tem de voltar
-- ----------------------------------------------------------------------------
-- A regua manda uma por vez e respeita followup_teto_diario, followup_teto_hora
-- e um intervalo aleatorio:
--
--   v_gap = greatest(8, least(60, (minutos_ate_17h30 / vagas_restantes)
--                                 * (0.6 + random() * 0.8)))
--
-- Em 30/10, para caber 37 mensagens entre 10:10 e 17:30, os tetos subiram de
-- 20/dia e 4/hora para 42/dia e 6/hora. 42 = 5 ja enviadas + 37 do lote: nao
-- sobra folga para a regua avancar na fila geral.
--
-- Os valores normais sao 20 e 4 e tem de voltar no fim do dia:
--   update ana_config set valor='20' where chave='followup_teto_diario';
--   update ana_config set valor='4'  where chave='followup_teto_hora';

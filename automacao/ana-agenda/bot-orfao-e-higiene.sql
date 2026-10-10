-- Total Quality / Ana — devolver o bot e medir a higiene da operacao
-- Aplicado em 03/10/2026 no projeto Supabase ajwhrmjzvfdjwsqynbzt.
--
-- Problema: alguem da recepcao assumia a conversa, respondia e nunca devolvia.
-- A rotina antiga exigia human_msg_at IS NOT NULL e escalado = false, entao
-- conversas escaladas nunca voltavam a ter bot — uma delas ficou 38 dias muda.

-- 1) Regra do bot orfao -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.ana_retomar_pos_humano()
RETURNS integer LANGUAGE plpgsql AS $fn$
DECLARE v_qtd int;
BEGIN
  -- Janela: 24h no caso comum, 48h quando a conversa esta escalada.
  -- Conversa escalada volta a responder mas mantem escalado = true, entao
  -- continua na lista da equipe e fora do follow-up proativo
  -- (ana_claim_followups() exclui escalados).
  WITH r AS (
    UPDATE ana_leads
       SET bot_ativo = true,
           human_msg_at = NULL,
           followup_due_at = CASE
             WHEN coalesce(escalado, false) = false
              AND proxima_acao LIKE 'follow\_up%'
              AND coalesce(agendamento->>'status','nenhum') NOT IN ('confirmado','proposto')
             THEN now() ELSE followup_due_at END,
           updated_at = now()
     WHERE coalesce(bot_ativo, true) = false
       AND coalesce(opt_out, false)  = false
       AND greatest(coalesce(last_patient_msg_at, '-infinity'::timestamptz),
                    coalesce(human_msg_at, updated_at))
           < now() - CASE WHEN coalesce(escalado, false)
                          THEN interval '48 hours' ELSE interval '24 hours' END
    RETURNING phone
  )
  SELECT count(*) INTO v_qtd FROM r;
  RETURN v_qtd;
END;
$fn$;

-- Ja roda a cada 15 min (cron.job 'ana_retomar_pos_humano', */15 * * * *).

-- 2) Foto semanal da higiene --------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ana_higiene_log (
  id bigserial PRIMARY KEY,
  rodado_em timestamptz NOT NULL DEFAULT now(),
  semana date NOT NULL,
  bot_religado int NOT NULL DEFAULT 0,
  presos_24h int NOT NULL DEFAULT 0,          -- tem de ficar em 0
  escaladas_abertas int NOT NULL DEFAULT 0,
  escalada_mais_antiga_dias int NOT NULL DEFAULT 0,
  mortas_alta int NOT NULL DEFAULT 0,
  mortas_media int NOT NULL DEFAULT 0,
  mortas_total int NOT NULL DEFAULT 0,
  fila_followup int NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS ana_higiene_log_semana_idx ON public.ana_higiene_log (semana);

CREATE OR REPLACE FUNCTION public.ana_higiene_semanal()
RETURNS public.ana_higiene_log LANGUAGE plpgsql AS $fn$
DECLARE r public.ana_higiene_log; v_religado int;
BEGIN
  -- 1) aplica a regra do bot orfao
  v_religado := public.ana_retomar_pos_humano();
  -- 2) so depois tira a foto, para 'presos_24h' medir o que sobrou
  INSERT INTO public.ana_higiene_log (
    semana, bot_religado, presos_24h, escaladas_abertas, escalada_mais_antiga_dias,
    mortas_alta, mortas_media, mortas_total, fila_followup)
  SELECT
    date_trunc('week', (now() AT TIME ZONE 'America/Sao_Paulo'))::date,
    v_religado,
    (SELECT count(*) FROM ana_leads
      WHERE coalesce(bot_ativo,true) = false AND coalesce(opt_out,false) = false
        AND greatest(coalesce(last_patient_msg_at,'-infinity'::timestamptz),
                     coalesce(human_msg_at, updated_at)) < now() - interval '24 hours'),
    (SELECT count(*) FROM ana_leads WHERE coalesce(escalado,false)),
    (SELECT coalesce(max((now()::date - updated_at::date)), 0) FROM ana_leads WHERE coalesce(escalado,false)),
    (SELECT count(*) FROM ana_conversas_mortas WHERE prioridade = '1 - Alta'),
    (SELECT count(*) FROM ana_conversas_mortas WHERE prioridade = '2 - Media'),
    (SELECT count(*) FROM ana_conversas_mortas),
    (SELECT count(*) FROM ana_leads WHERE followup_due_at IS NOT NULL)
  ON CONFLICT (semana) DO UPDATE SET
    rodado_em = now(),
    bot_religado = ana_higiene_log.bot_religado + EXCLUDED.bot_religado,
    presos_24h = EXCLUDED.presos_24h,
    escaladas_abertas = EXCLUDED.escaladas_abertas,
    escalada_mais_antiga_dias = EXCLUDED.escalada_mais_antiga_dias,
    mortas_alta = EXCLUDED.mortas_alta,
    mortas_media = EXCLUDED.mortas_media,
    mortas_total = EXCLUDED.mortas_total,
    fila_followup = EXCLUDED.fila_followup
  RETURNING * INTO r;
  RETURN r;
END;
$fn$;

-- 3) Linha de base do funil ---------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ana_funil_log (
  id bigserial PRIMARY KEY,
  data_ref date NOT NULL UNIQUE,
  rotulo text,
  agendou int NOT NULL,
  nao_agendou int NOT NULL,
  nao_aplica int NOT NULL,
  conversao numeric(5,2) NOT NULL,
  fila_followup int NOT NULL,
  em_regua int NOT NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.ana_snapshot_funil(p_rotulo text DEFAULT NULL)
RETURNS public.ana_funil_log LANGUAGE plpgsql AS $fn$
DECLARE r public.ana_funil_log;
BEGIN
  INSERT INTO public.ana_funil_log (data_ref, rotulo, agendou, nao_agendou, nao_aplica,
                                    conversao, fila_followup, em_regua)
  SELECT (now() AT TIME ZONE 'America/Sao_Paulo')::date,
         p_rotulo, a, n, x,
         CASE WHEN (a+n) > 0 THEN round(a::numeric * 100 / (a+n), 2) ELSE 0 END,
         (SELECT count(*) FROM ana_leads WHERE followup_due_at IS NOT NULL),
         (SELECT count(*) FROM ana_leads WHERE followup_due_at IS NOT NULL
                                            OR coalesce(followup_step,0) > 0)
  FROM (SELECT count(*) FILTER (WHERE "Status" = 'Agendou')     AS a,
               count(*) FILTER (WHERE "Status" = 'Não Agendou') AS n,
               count(*) FILTER (WHERE "Status" = 'Não Aplica')  AS x
        FROM ana_leads_planilha) s
  ON CONFLICT (data_ref) DO UPDATE SET
    rotulo = coalesce(EXCLUDED.rotulo, ana_funil_log.rotulo),
    agendou = EXCLUDED.agendou, nao_agendou = EXCLUDED.nao_agendou,
    nao_aplica = EXCLUDED.nao_aplica, conversao = EXCLUDED.conversao,
    fila_followup = EXCLUDED.fila_followup, em_regua = EXCLUDED.em_regua,
    criado_em = now()
  RETURNING * INTO r;
  RETURN r;
END;
$fn$;

-- Linha de base gravada em 03/10/2026:
--   147 agendou / 1119 nao agendou / 84 nao aplica -> 11,61%  |  1041 na fila
-- SELECT public.ana_snapshot_funil('Linha de base - regua nova com 5 textos fixos');

-- 4) Agendamento semanal ------------------------------------------------------
-- Segunda-feira, 08h20 de Brasilia (11h20 UTC).
SELECT cron.schedule('ana-higiene-semanal', '20 11 * * 1',
  $$SELECT public.ana_higiene_semanal(); SELECT public.ana_snapshot_funil();$$);

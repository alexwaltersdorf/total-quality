-- =====================================================================
-- Correções aplicadas em 31/08/2026 (já executadas no Supabase)
-- =====================================================================

-- ACHADO 2 — a retomada do bot estava presa dentro do ANA-02.
-- Retomar ATENDIMENTO não é enviar CAMPANHA: sai do fluxo de envio e passa a
-- rodar no próprio banco, via pg_cron, independente do n8n.
CREATE OR REPLACE FUNCTION ana_retomar_pos_humano()
RETURNS int LANGUAGE plpgsql AS $fn$
DECLARE v_qtd int;
BEGIN
  WITH r AS (
    UPDATE ana_leads
       SET bot_ativo = true,
           human_msg_at = NULL,
           -- só recoloca na fila comercial quem está em cadência e sem exame marcado
           followup_due_at = CASE
             WHEN proxima_acao LIKE 'follow\_up%'
              AND coalesce(agendamento->>'status','nenhum') NOT IN ('confirmado','proposto')
             THEN now() ELSE followup_due_at END,
           updated_at = now()
     WHERE coalesce(bot_ativo, true) = false
       AND coalesce(opt_out, false)  = false
       AND coalesce(escalado, false) = false
       AND human_msg_at IS NOT NULL
       AND greatest(coalesce(last_patient_msg_at,'-infinity'::timestamptz), human_msg_at)
             < now() - interval '24 hours'
    RETURNING phone)
  SELECT count(*) INTO v_qtd FROM r;
  RETURN v_qtd;
END; $fn$;

SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname = 'ana_retomar_pos_humano';
SELECT cron.schedule('ana_retomar_pos_humano', '*/15 * * * *',
                     $$SELECT ana_retomar_pos_humano();$$);

-- ACHADO 8 — preco_pix vazio nos 1.895 exames ativos.
-- A Ana já promete 10% no PIX/dinheiro pela regra do prompt; a coluna vazia era
-- convite a alguém confiar nela um dia.
UPDATE ana_precos SET preco_pix = round(preco * 0.90, 2), updated_at = now()
 WHERE ativo AND preco_pix IS NULL AND preco IS NOT NULL AND preco > 0;

-- Painel de sinais vitais — SELECT * FROM ana_saude;
-- (definição completa aplicada por migração; ver ana_saude no banco)

-- Bloco <economia_de_turnos> inserido em ana_config.system_prompt.

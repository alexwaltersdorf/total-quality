-- =====================================================================
-- Guarda antibloqueio do WhatsApp — aplicada em 22/08/2026
-- (já executada no Supabase; este arquivo é o registro versionado)
--
-- CAUSA DO BLOQUEIO: a fila de follow-up nunca esvaziava. O ANA-02 roda
-- a cada 30 min e o `followup_due_at` não era consumido depois do envio,
-- então o MESMO lead voltava a ser selecionado na rodada seguinte.
-- Em 21/08: 294 mensagens para 103 números, 6 mensagens no dia para o
-- mesmo paciente, duas delas idênticas — e só 5 respostas recebidas.
--
-- A correção move as regras para DENTRO do banco: nenhum ajuste de
-- workflow no n8n consegue burlá-las.
-- =====================================================================

CREATE TABLE IF NOT EXISTS ana_envios_log (
  id         bigserial PRIMARY KEY,
  phone      text        NOT NULL,
  tipo       text        NOT NULL,          -- 'follow_up' | 'lembrete_vespera'
  enviado_em timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ana_envios_log_phone_idx ON ana_envios_log (phone, enviado_em DESC);
CREATE INDEX IF NOT EXISTS ana_envios_log_data_idx  ON ana_envios_log (enviado_em DESC);

-- Teto diário de mensagens proativas. 0 = envios suspensos.
INSERT INTO ana_config (chave, valor) VALUES ('followup_teto_diario', '0')
ON CONFLICT (chave) DO NOTHING;

-- Backup dos follow-ups suspensos, para restaurar quando liberar.
CREATE TABLE IF NOT EXISTS ana_followup_suspenso_2026_08 (
  phone           text PRIMARY KEY,
  followup_due_at timestamptz,
  proxima_acao    text,
  followup_step   integer,
  suspenso_em     timestamptz NOT NULL DEFAULT now(),
  motivo          text
);

-- O ANA-02 passa a chamar SOMENTE esta função. Ela devolve os leads JÁ
-- marcados como enviados — uma segunda rodada nunca repete os mesmos.
CREATE OR REPLACE FUNCTION ana_claim_followups(p_limite int DEFAULT 10, p_agora timestamptz DEFAULT now())
RETURNS TABLE (phone text, nome text, proxima_acao text, followup_step int, resumo_interno text)
LANGUAGE plpgsql AS $fn$
DECLARE
  v_agora timestamptz := p_agora;
  v_sp    timestamp   := v_agora AT TIME ZONE 'America/Sao_Paulo';
  v_hora  numeric     := extract(hour FROM v_sp) + extract(minute FROM v_sp) / 60.0;
  v_dow   int         := extract(isodow FROM v_sp);
  v_hoje  date        := v_sp::date;
  v_teto  int;
  v_usado int;
  v_vagas int;
BEGIN
  -- horário comercial, segunda a sexta
  IF v_dow > 5 OR v_hora < 8 OR v_hora >= 17.5 THEN RETURN; END IF;

  SELECT coalesce((SELECT valor FROM ana_config WHERE chave = 'followup_teto_diario'), '0')::int
    INTO v_teto;
  SELECT count(*) INTO v_usado FROM ana_envios_log
   WHERE tipo = 'follow_up'
     AND (enviado_em AT TIME ZONE 'America/Sao_Paulo')::date = v_hoje;
  v_vagas := least(p_limite, v_teto - v_usado);
  IF v_vagas < 1 THEN RETURN; END IF;

  RETURN QUERY
  WITH elegiveis AS (
    SELECT l.phone AS ph
    FROM ana_leads l
    WHERE l.followup_due_at IS NOT NULL
      AND l.followup_due_at <= v_agora
      AND coalesce(l.opt_out, false)  = false
      AND coalesce(l.escalado, false) = false
      AND l.proxima_acao LIKE 'follow\_up%'
      AND coalesce(l.agendamento->>'status', 'nenhum') NOT IN ('confirmado', 'proposto')
      AND l.last_patient_msg_at IS NOT NULL              -- nunca escrever para quem nunca escreveu
      AND coalesce(l.followup_step, 0) < 5               -- a cadência tem 5 passos
      AND NOT EXISTS (                                   -- 1 mensagem proativa por paciente por dia
        SELECT 1 FROM ana_envios_log e
         WHERE e.phone = l.phone
           AND (e.enviado_em AT TIME ZONE 'America/Sao_Paulo')::date = v_hoje)
      AND (SELECT count(*) FROM ana_envios_log e         -- para após 2 follow-ups sem resposta
            WHERE e.phone = l.phone AND e.tipo = 'follow_up'
              AND e.enviado_em > coalesce(l.last_patient_msg_at, '-infinity'::timestamptz)) < 2
    ORDER BY l.followup_due_at
    LIMIT v_vagas
  ),
  reservados AS (
    UPDATE ana_leads l
       SET followup_due_at = NULL,                       -- consome a vaga
           followup_step   = coalesce(l.followup_step, 0) + 1,
           updated_at      = now()
      FROM elegiveis e WHERE l.phone = e.ph
    RETURNING l.phone, l.nome, l.proxima_acao, l.followup_step, l.resumo_interno
  ),
  registrado AS (
    INSERT INTO ana_envios_log (phone, tipo, enviado_em)
    SELECT r.phone, 'follow_up', v_agora FROM reservados r
    RETURNING ana_envios_log.phone
  )
  SELECT r.phone, r.nome, r.proxima_acao, r.followup_step, r.resumo_interno
    FROM reservados r WHERE (SELECT count(*) FROM registrado) >= 0;
END;
$fn$;

-- ---------------------------------------------------------------------
-- Para RELIGAR os envios (só depois do WhatsApp desbloqueado):
--   1) restaurar a fila:
--        UPDATE ana_leads l SET followup_due_at = s.followup_due_at
--          FROM ana_followup_suspenso_2026_08 s WHERE l.phone = s.phone;
--   2) subir o teto aos poucos (aquecimento):
--        UPDATE ana_config SET valor = '20' WHERE chave = 'followup_teto_diario';
--      e ir aumentando ~20 por dia enquanto a taxa de resposta se mantiver.
-- ---------------------------------------------------------------------

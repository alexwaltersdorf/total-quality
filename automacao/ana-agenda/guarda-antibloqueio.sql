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

-- Chaves de controle do ritmo de envio.
INSERT INTO ana_config (chave, valor) VALUES
  ('followup_envios_suspensos', 'true'),  -- chave geral: nada sai enquanto for 'true'
  ('followup_teto_diario',      '20'),    -- 20 mensagens por dia
  ('followup_teto_hora',        '4')      -- no máximo 4 na mesma hora corrida
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

-- RITMO: a função libera UMA mensagem por chamada, com intervalo sorteado.
-- O ANA-02 deve rodar de 5 em 5 minutos e enviar no máximo o que vier daqui.
-- O WhatsApp também marca disparo em bloco e cadência de relógio fixo — era
-- exatamente o caso: rajadas de 5 a 11 mensagens cravadas nos minutos :01 e :31.
--
-- A função devolve o lead JÁ marcado como enviado: uma segunda rodada na mesma
-- janela nunca repete o mesmo paciente.
CREATE OR REPLACE FUNCTION ana_claim_followups(p_limite int DEFAULT 1, p_agora timestamptz DEFAULT now())
RETURNS TABLE (phone text, nome text, proxima_acao text, followup_step int, resumo_interno text)
LANGUAGE plpgsql AS $fn$
DECLARE
  v_agora    timestamptz := p_agora;
  v_sp       timestamp   := v_agora AT TIME ZONE 'America/Sao_Paulo';
  v_hora     numeric     := extract(hour FROM v_sp) + extract(minute FROM v_sp) / 60.0;
  v_dow      int         := extract(isodow FROM v_sp);
  v_hoje     date        := v_sp::date;
  v_ini      numeric     := 8.0;    -- janela de envio: 08:00
  v_fim      numeric     := 17.5;   -- janela de envio: 17:30
  v_atraso   numeric;
  v_teto     int;
  v_teto_h   int;
  v_usado    int;
  v_restante int;
  v_na_hora  int;
  v_ultimo   timestamptz;
  v_min_rest numeric;
  v_gap      numeric;
BEGIN
  -- 0. chave geral de suspensão
  IF coalesce((SELECT valor FROM ana_config WHERE chave = 'followup_envios_suspensos'), 'true') = 'true'
    THEN RETURN;
  END IF;

  -- 1. janela seg–sex, com início variável de 0 a 45 min (sorteado pela data,
  --    para a primeira mensagem não sair sempre às 08:00 em ponto)
  v_atraso := (abs(hashtext(v_hoje::text)) % 46) / 60.0;
  IF v_dow > 5 OR v_hora < v_ini + v_atraso OR v_hora >= v_fim THEN RETURN; END IF;

  -- 2. teto do dia
  SELECT coalesce((SELECT valor FROM ana_config WHERE chave = 'followup_teto_diario'), '0')::int
    INTO v_teto;
  SELECT count(*) INTO v_usado FROM ana_envios_log
   WHERE tipo = 'follow_up'
     AND (enviado_em AT TIME ZONE 'America/Sao_Paulo')::date = v_hoje;
  v_restante := v_teto - v_usado;
  IF v_restante < 1 THEN RETURN; END IF;

  -- 3. teto da hora corrida (impede acúmulo mesmo com sorteio favorável)
  SELECT coalesce((SELECT valor FROM ana_config WHERE chave = 'followup_teto_hora'), '4')::int
    INTO v_teto_h;
  SELECT count(*) INTO v_na_hora FROM ana_envios_log
   WHERE tipo = 'follow_up' AND enviado_em > v_agora - interval '1 hour';
  IF v_na_hora >= v_teto_h THEN RETURN; END IF;

  -- 4. intervalo desde a última mensagem proativa (follow-up OU lembrete).
  --    O alvo se recalcula sozinho: tempo que falta ÷ quantas ainda faltam.
  --    O sorteio de 0,6x a 1,4x quebra a cadência de relógio fixo; o piso de
  --    8 min impede duas mensagens coladas.
  SELECT max(enviado_em) INTO v_ultimo FROM ana_envios_log
   WHERE tipo IN ('follow_up', 'lembrete_vespera')
     AND (enviado_em AT TIME ZONE 'America/Sao_Paulo')::date = v_hoje;

  IF v_ultimo IS NOT NULL THEN
    v_min_rest := greatest(1, (v_fim - v_hora) * 60);
    v_gap := greatest(8, least(60, (v_min_rest / v_restante) * (0.6 + random() * 0.8)));
    IF v_agora < v_ultimo + make_interval(mins => v_gap::int) THEN RETURN; END IF;
  END IF;

  -- 5. libera SEMPRE uma única mensagem por chamada (p_limite é ignorado de
  --    propósito: é o que impede qualquer disparo em bloco)
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
    LIMIT 1
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
--   2) destravar:
--        UPDATE ana_config SET valor = 'false' WHERE chave = 'followup_envios_suspensos';
--   3) o teto começa em 20/dia. Só subir depois de uma semana com taxa de
--      resposta acima de ~30%, e de 10 em 10:
--        UPDATE ana_config SET valor = '30' WHERE chave = 'followup_teto_diario';
--
-- Para SUSPENDER de novo, a qualquer momento:
--   UPDATE ana_config SET valor = 'true' WHERE chave = 'followup_envios_suspensos';
-- ---------------------------------------------------------------------

-- ============================================================================
-- ANA-04 — a auditoria passa a olhar o último dia COM conversa
-- ----------------------------------------------------------------------------
-- ana_auditoria_conversas() usava "ontem" fixo. Em 09/09/2026 o WhatsApp ficou
-- fora do ar o dia inteiro (zero mensagens gravadas), então a auditoria da
-- manhã seguinte saiu como "nada a auditar" e o dia útil de 08/09 — com 87
-- conversas — nunca foi auditado.
--
-- Agora: sem argumento, escolhe o dia mais recente COM conversa até ontem,
-- olhando 7 dias para trás. Com argumento, audita o dia pedido.
-- ============================================================================

DROP FUNCTION IF EXISTS ana_auditoria_conversas();

CREATE OR REPLACE FUNCTION ana_auditoria_conversas(p_dia date DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql AS $fn$
DECLARE
  v_dia   date;
  v_start timestamptz;
  v_end   timestamptz;
  resultado jsonb;
BEGIN
  v_dia := p_dia;
  IF v_dia IS NULL THEN
    SELECT (m.created_at AT TIME ZONE 'America/Sao_Paulo')::date
      INTO v_dia
    FROM ana_mensagens m
    WHERE (m.created_at AT TIME ZONE 'America/Sao_Paulo')::date
            BETWEEN ((now() AT TIME ZONE 'America/Sao_Paulo')::date - 7)
                AND ((now() AT TIME ZONE 'America/Sao_Paulo')::date - 1)
    GROUP BY 1
    ORDER BY 1 DESC
    LIMIT 1;
  END IF;

  IF v_dia IS NULL THEN
    v_dia := (now() AT TIME ZONE 'America/Sao_Paulo')::date - 1;
  END IF;

  v_start := (v_dia::timestamp) AT TIME ZONE 'America/Sao_Paulo';
  v_end   := v_start + interval '1 day';

  SELECT COALESCE(jsonb_agg(conv ORDER BY conv->>'phone'), '[]'::jsonb) INTO resultado
  FROM (
    SELECT jsonb_build_object(
      'phone', l.phone,
      'nome', COALESCE(l.nome, 'nao informado'),
      'temperatura', l.temperatura,
      'funil', l.funil,
      'agendamento', COALESCE(l.agendamento->>'status','nenhum'),
      'escalado', l.escalado,
      'opt_out', l.opt_out,
      'qtd_mensagens', (SELECT count(*) FROM ana_mensagens m2
                        WHERE m2.phone = l.phone AND m2.created_at >= v_start AND m2.created_at < v_end),
      'transcript', (
        SELECT string_agg(
          to_char(m.created_at AT TIME ZONE 'America/Sao_Paulo', 'HH24:MI') || ' ' ||
          CASE WHEN m.role = 'user' THEN 'PACIENTE' WHEN m.tipo = 'humano' THEN 'EQUIPE (humano)' ELSE 'ANA' END ||
          ': ' || left(COALESCE(m.conteudo,'[sem texto]'), 600),
          E'\n' ORDER BY m.created_at)
        FROM (
          SELECT * FROM ana_mensagens m1
          WHERE m1.phone = l.phone AND m1.created_at >= v_start AND m1.created_at < v_end
          ORDER BY m1.created_at DESC LIMIT 80
        ) m
      )
    ) AS conv
    FROM ana_leads l
    WHERE EXISTS (SELECT 1 FROM ana_mensagens m0
                  WHERE m0.phone = l.phone AND m0.created_at >= v_start AND m0.created_at < v_end)
  ) t;

  RETURN jsonb_build_object(
    'data_referencia', to_char(v_dia, 'DD/MM/YYYY'),
    'conversas', resultado
  );
END;
$fn$;

-- Conferência:  SELECT ana_auditoria_conversas()->>'data_referencia';

-- ============================================================================
-- Relatório de leads do WhatsApp — view ana_relatorio_conversas
-- ----------------------------------------------------------------------------
-- Uma linha por lead que conversou pelo WhatsApp, com:
--   nome · telefone · exame procurado · status · data do contato
--
-- DATA DO CONTATO é o dia em que começou a ÚLTIMA rodada de conversa, não o
-- primeiro contato histórico. Duas mensagens separadas por mais de 30 dias são
-- rodadas diferentes: quem falou em 10/01/2025 e voltou em 05/09/2026,
-- conversando até 08/09, aparece com 05/09/2026.
--
-- STATUS:
--   Agendou     — agendamento confirmado na Agenda do Google
--   Não Aplica  — procurou exame que a clínica não realiza
--   Não Agendou — todo o resto (inclui exame cancelado depois de marcado)
--
-- A lista de exames não realizados vem do system prompt da Ana
-- (ana_config.chave = 'system_prompt'). Ao mudar lá, mudar aqui também.
--
-- Uso:   SELECT * FROM ana_relatorio_conversas ORDER BY ord DESC;
-- ============================================================================

CREATE OR REPLACE VIEW ana_relatorio_conversas AS
WITH m AS (
  SELECT phone, created_at,
         CASE WHEN lag(created_at) OVER (PARTITION BY phone ORDER BY created_at) IS NULL
                OR created_at - lag(created_at) OVER (PARTITION BY phone ORDER BY created_at) > interval '30 days'
              THEN 1 ELSE 0 END AS quebra
  FROM ana_mensagens
),
c AS (
  SELECT phone, created_at,
         sum(quebra) OVER (PARTITION BY phone ORDER BY created_at ROWS UNBOUNDED PRECEDING) AS ciclo
  FROM m
),
u AS (SELECT phone, max(ciclo) AS ult FROM c GROUP BY phone),
ini AS (
  SELECT c.phone,
         min(c.created_at) AS inicio,
         max(c.created_at) AS fim,
         (max(u.ult) > 1) AS recontato   -- já tinha conversado antes, com mais de 30 dias de intervalo
  FROM c JOIN u ON u.phone = c.phone
  WHERE c.ciclo = u.ult
  GROUP BY c.phone
)
SELECT
  CASE WHEN l.nome IS NULL OR btrim(regexp_replace(l.nome,'[\[\]\s]','','g')) = ''
       THEN '(sem nome)' ELSE btrim(l.nome) END AS nome,
  l.phone,
  COALESCE(NULLIF(array_to_string(ARRAY(SELECT jsonb_array_elements_text(l.exames)), '; '), ''),
           '(não informado)') AS exames,
  CASE
    WHEN l.agendamento->>'status' = 'confirmado' THEN 'Agendou'
    WHEN array_to_string(ARRAY(SELECT jsonb_array_elements_text(l.exames)), '; ') ~*
         '(resson[aâ]ncia|densitometr|mamografi|colonoscop|endoscop|eletroneuromiografia|ergom[éeè]tric|pet ?scan|cintilografi|vacina|neonatal|cateterismo|ecocardio|pronto.?socorro|cardiologista|neurologista|pediatra|otorrino|oftalmologista)'
      THEN 'Não Aplica'
    ELSE 'Não Agendou'
  END AS status,
  to_char(i.inicio AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY') AS data_contato,
  to_char(i.fim    AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY') AS ultima_msg,
  i.recontato,
  i.inicio AS ord
FROM ini i JOIN ana_leads l ON l.phone = i.phone;

COMMENT ON VIEW ana_relatorio_conversas IS
  'Um lead por linha, com exame procurado, status e a data de inicio da ultima rodada de conversa.';

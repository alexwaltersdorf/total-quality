-- ============================================================================
-- Etapa da cadencia de follow-up, para o relatorio e a planilha
-- ----------------------------------------------------------------------------
-- ana_claim_followups() incrementa followup_step ANTES de devolver a linha,
-- entao o valor guardado e o ultimo toque JA enviado. Dai o rotulo.
--
-- Cadencia: passo 1 = D+1, 2 = D+3, 3 = D+7, 4 = D+14, 5 = D+30. Depois do
-- passo 5 a regua encerra sozinha (followup_due_at fica nulo).
-- ============================================================================

CREATE OR REPLACE FUNCTION ana_etapa_followup(p int)
RETURNS text LANGUAGE sql IMMUTABLE AS $fn$
  SELECT CASE COALESCE(p, 0)
    WHEN 0 THEN 'Sem follow-up'
    WHEN 1 THEN 'Dia 1'
    WHEN 2 THEN 'Dia 3'
    WHEN 3 THEN 'Dia 7'
    WHEN 4 THEN 'Dia 14'
    WHEN 5 THEN 'Dia 30'
    ELSE 'Encerrado'
  END;
$fn$;

COMMENT ON FUNCTION ana_etapa_followup(int) IS
  'Rotulo da etapa da cadencia a partir de followup_step (ultimo toque enviado).';

-- Decide se a linha da coleta domiciliar entra no texto do D+3.
CREATE OR REPLACE FUNCTION ana_exame_laboratorial(p text)
RETURNS boolean LANGUAGE sql IMMUTABLE AS $fn$
  SELECT COALESCE(p,'') ~*
    '(coleta|sangue|urina|fezes|horm[ôo]n|laborat[óo]ri|glicose|colesterol|hemograma|\mpsa\M|\mtsh\M|vitamina|bacterioscop|espermograma|beta ?hcg|ferritina|creatinina|\mvhs\M|hemossediment|gama ?-? ?gt|\mtgo\M|\mtgp\M|toxicol|sorologi|tipagem|\mppd\M|curva glic|dosagem|t4|t3)';
$fn$;

COMMENT ON FUNCTION ana_exame_laboratorial(text) IS
  'Verdadeiro quando o orcamento tem exame de laboratorio (habilita a coleta domiciliar no D+3).';

-- ana_relatorio_conversas e ana_leads_planilha ganham a coluna da etapa.
-- Definicoes completas em relatorio-leads-conversas.sql e relatorio-leads-planilha.sql.

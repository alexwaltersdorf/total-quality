-- ============================================================================
-- ANA-06 — Guarda da confirmação de véspera          (aplicado em 10/09/2026)
-- ----------------------------------------------------------------------------
-- O QUE ACONTECEU
-- Em 07/09/2026 a Ana enviou 10 confirmações de véspera. Só 2 vinham de um
-- agendamento real da Agenda do Google. As outras 8 vinham de `agendamento`
-- escrito pela própria Ana (ANA-01) durante a conversa: paciente que só
-- perguntou sobre um exame ficava com status 'confirmado'. Foi o caso da
-- Michele ("Eu não confirmei") e da Carla.
-- No mesmo dia, o Davi recebeu confirmação de um exame cancelado: a recepção
-- escreveu "cancelou agendou na cidade dele" DENTRO do título do evento em vez
-- de apagar o evento, e a ANA-05 leu aquilo como confirmado — a anotação
-- interna foi parar na mensagem do paciente.
--
-- A REGRA NOVA, em uma única fonte de verdade
--   1. Só a Agenda do Google confirma. Conversa nunca confirma.
--   2. Título com palavra de cancelamento nunca confirma.
--   3. Título sem nome de exame reconhecível nunca confirma — melhor não
--      confirmar do que mandar anotação interna para o paciente.
--   4. Telefone precisa ser celular brasileiro válido.
--   5. Anti-duplicidade lida em ana_envios_log, que a ANA-01 não sobrescreve
--      (o carimbo dentro de `agendamento` era apagado a cada resposta do
--      paciente, então não servia como trava).
-- ============================================================================

-- ---------------------------------------------------------------- 1. léxicos
CREATE OR REPLACE FUNCTION ana_evento_cancelado(p_evento text)
RETURNS boolean LANGUAGE sql IMMUTABLE AS $fn$
  SELECT COALESCE(p_evento, '') ~*
    '(cancel|desmarc|remarc|reagend|desist|adiou|adiad|n[aã]o vem|n[aã]o vir|nao compareceu|n[aã]o compareceu|faltou|falta|transferi|mudou para|pendente|aguardando|verificar|conferir|confirmar com|erro|teste)';
$fn$;

CREATE OR REPLACE FUNCTION ana_evento_tem_exame(p_evento text)
RETURNS boolean LANGUAGE sql IMMUTABLE AS $fn$
  SELECT COALESCE(p_evento, '') ~*
    '(\musg?\M|ultrassom|ultrassonografia|\mrx\M|raio[- ]?x|\mtc\M|tomografia|resson[aâ]ncia|\mrm\M|\mecg\M|eletro|\meeg\M|holter|\mmapa\M|coleta|exame de sangue|espirom|toxicol|papanicolau|preventivo|sexagem|romberg|doppler|check[ -]?up|densitom|mamografi|panor[aâ]mic|cone[ -]?beam|audiometri|ecocardio|ergom[ée]tric|bi[óo]psia|pun[çc][ãa]o|cari[óo]tipo|bacteriosc[óo]pic|urina|fezes|\mtv\M|transvaginal|obst[ée]tric|morfol[óo]gic|tireoide|abdom|t[óo]rax|coluna|joelho|ombro|pr[óo]stata)';
$fn$;

-- ------------------------------------------------- 2. fonte única da ANA-06
CREATE OR REPLACE FUNCTION ana_confirmacoes_vespera(
  p_limite int DEFAULT 20,
  p_agora  timestamptz DEFAULT now()
)
RETURNS TABLE (
  phone text, nome text, data text, hora text,
  turno text, evento text, paciente text
)
LANGUAGE plpgsql AS $fn$
DECLARE
  v_hoje date;
  v_alvo date;
BEGIN
  v_hoje := (p_agora AT TIME ZONE 'America/Sao_Paulo')::date;

  -- Sexta cobre segunda: a clínica não abre sábado nem domingo.
  v_alvo := CASE EXTRACT(ISODOW FROM v_hoje)
              WHEN 5 THEN v_hoje + 3
              WHEN 6 THEN v_hoje + 2
              ELSE        v_hoje + 1
            END;

  IF EXTRACT(ISODOW FROM v_alvo) > 5 THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT l.phone,
         l.nome,
         l.agendamento->>'data',
         COALESCE(l.agendamento->>'hora',  ''),
         COALESCE(l.agendamento->>'turno', ''),
         COALESCE(l.agendamento->>'evento',''),
         COALESCE(l.agendamento->>'paciente','')
  FROM ana_leads l
  WHERE l.agendamento->>'origem' = 'google_agenda'
    AND l.agendamento->>'status' = 'confirmado'
    AND l.agendamento->>'data' ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
    AND (l.agendamento->>'data')::date = v_alvo
    AND NOT ana_evento_cancelado(l.agendamento->>'evento')
    AND ana_evento_tem_exame(l.agendamento->>'evento')
    AND l.phone ~ '^55[1-9][1-9]9[0-9]{8}$'
    AND COALESCE(l.opt_out, false) = false
    AND NOT EXISTS (
          SELECT 1 FROM ana_envios_log e
          WHERE e.phone = l.phone
            AND (e.enviado_em AT TIME ZONE 'America/Sao_Paulo')::date = v_hoje
        )
  ORDER BY COALESCE(l.agendamento->>'hora','')
  LIMIT p_limite;
END;
$fn$;

COMMENT ON FUNCTION ana_confirmacoes_vespera(int, timestamptz) IS
  'Fonte unica da ANA-06. So confirma exame que existe na Agenda do Google, com titulo limpo. Conversa nao confirma.';

-- ------------------------------------------------------------- 3. cinto trava
-- A mesma regra gravada na linha, a cada escrita. Vale mesmo que alguém edite
-- o fluxo no n8n e volte a usar uma consulta solta: o campo
-- `confirmacao_enviada_em` — que a ANA-06 já respeita — sai pré-carimbado
-- como 'bloqueado:<motivo>' em tudo que a regra recusa.
CREATE OR REPLACE FUNCTION ana_marcar_confirmavel()
RETURNS trigger LANGUAGE plpgsql AS $fn$
DECLARE
  v_ok      boolean;
  v_motivo  text;
  v_carimbo text;
BEGIN
  IF NEW.agendamento IS NULL OR jsonb_typeof(NEW.agendamento) <> 'object' THEN
    RETURN NEW;
  END IF;

  v_motivo := CASE
    WHEN COALESCE(NEW.agendamento->>'status','') <> 'confirmado'      THEN 'nao_confirmado'
    WHEN COALESCE(NEW.agendamento->>'origem','') <> 'google_agenda'   THEN 'sem_agenda'
    WHEN ana_evento_cancelado(NEW.agendamento->>'evento')             THEN 'titulo_cancelado'
    WHEN NOT ana_evento_tem_exame(NEW.agendamento->>'evento')         THEN 'exame_ilegivel'
    WHEN NEW.phone !~ '^55[1-9][1-9]9[0-9]{8}$'                       THEN 'telefone_suspeito'
    WHEN COALESCE(NEW.agendamento->>'data','') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN 'data_invalida'
    ELSE NULL
  END;

  v_ok := v_motivo IS NULL;
  NEW.agendamento := NEW.agendamento || jsonb_build_object('confirmavel', v_ok);

  v_carimbo := NEW.agendamento->>'confirmacao_enviada_em';

  IF NOT v_ok THEN
    IF v_carimbo IS NULL OR v_carimbo LIKE 'bloqueado:%' THEN
      NEW.agendamento := NEW.agendamento
        || jsonb_build_object('confirmacao_enviada_em', 'bloqueado:' || v_motivo);
    END IF;
  ELSIF v_carimbo LIKE 'bloqueado:%' THEN
    -- A recepção arrumou o evento: libera a confirmação de novo.
    NEW.agendamento := NEW.agendamento - 'confirmacao_enviada_em';
  END IF;

  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS trg_ana_marcar_confirmavel ON ana_leads;
CREATE TRIGGER trg_ana_marcar_confirmavel
  BEFORE INSERT OR UPDATE OF agendamento, phone ON ana_leads
  FOR EACH ROW EXECUTE FUNCTION ana_marcar_confirmavel();

-- Aplica a regra ao que já está gravado.
UPDATE ana_leads SET agendamento = agendamento
WHERE agendamento IS NOT NULL AND jsonb_typeof(agendamento) = 'object';

-- --------------------------------------------- 4. fila de tratamento humano
-- O que a Ana recusou confirmar não some: aparece aqui para a recepção tratar.
CREATE OR REPLACE VIEW ana_confirmacoes_bloqueadas AS
SELECT l.phone,
       l.nome,
       l.agendamento->>'paciente' AS paciente,
       l.agendamento->>'data'     AS data,
       l.agendamento->>'hora'     AS hora,
       l.agendamento->>'evento'   AS evento,
       split_part(l.agendamento->>'confirmacao_enviada_em', ':', 2) AS motivo,
       CASE split_part(l.agendamento->>'confirmacao_enviada_em', ':', 2)
         WHEN 'sem_agenda'        THEN 'A Ana anotou isso da conversa, mas nao existe evento na Agenda do Google. Confirme na agenda antes de falar com o paciente.'
         WHEN 'titulo_cancelado'  THEN 'O titulo do evento tem anotacao de cancelamento/remarcacao. Apague ou corrija o evento na agenda.'
         WHEN 'exame_ilegivel'    THEN 'O titulo nao tem nome de exame reconhecivel. Ajuste para o padrao hora-nome-exame.'
         WHEN 'telefone_suspeito' THEN 'O telefone do evento nao e um celular brasileiro valido. Corrija o numero na agenda.'
         WHEN 'data_invalida'     THEN 'A data do agendamento nao esta no formato da agenda.'
         ELSE 'Sem agendamento confirmado.'
       END AS o_que_fazer
FROM ana_leads l
WHERE l.agendamento->>'confirmavel' = 'false'
  AND l.agendamento->>'confirmacao_enviada_em' LIKE 'bloqueado:%'
  AND split_part(l.agendamento->>'confirmacao_enviada_em', ':', 2) <> 'nao_confirmado';

COMMENT ON VIEW ana_confirmacoes_bloqueadas IS
  'Agendamentos que a ANA-06 recusou confirmar. A recepcao trata um a um.';

-- Conferência:
--   SELECT * FROM ana_confirmacoes_vespera();     -- o que sai amanhã
--   SELECT * FROM ana_confirmacoes_bloqueadas;    -- o que a recepção precisa ver

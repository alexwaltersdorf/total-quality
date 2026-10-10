-- ============================================================================
-- Planilha de leads no Google Sheets — fonte do fluxo ANA-07
-- ----------------------------------------------------------------------------
-- O ANA-07 roda a cada 30 min: limpa a aba "Leads" (mantendo o cabecalho),
-- le esta view e regrava tudo. Os nomes das colunas aqui SAO os cabecalhos da
-- planilha — renomear aqui renomeia la.
--
-- A classificacao por familia de exame vive em ana_familia_exame(), e nao no
-- fluxo do n8n, para a regra existir num lugar so. A lista de "Nao realizado
-- aqui" precisa acompanhar o system prompt da Ana: quando a mamografia voltar,
-- sai das duas listas.
-- ============================================================================

CREATE OR REPLACE FUNCTION ana_familia_exame(p text)
RETURNS text LANGUAGE sql IMMUTABLE AS $fn$
  SELECT CASE
    WHEN COALESCE(p,'') = '' OR p = '(não informado)'                       THEN 'Não informado'
    WHEN p ~* '(resson[aâ]ncia|densitometr|mamografi|colonoscop|endoscop|eletroneuromiografia|ergom[éeè]tric|pet ?scan|cintilografi|vacina|neonatal|cateterismo|ecocardio|cardiologista|neurologista|pediatra|otorrino|oftalmologista)' THEN 'Não realizado aqui'
    WHEN p ~* 'check ?-? ?up'                                               THEN 'Check-up'
    WHEN p ~* 'toxicol'                                                     THEN 'Toxicológico'
    WHEN p ~* '(admissional|demissional|peri[óo]dico|ocupacional|\mcnh\M|habilita[çc][ãa]o|\maso\M)' THEN 'Ocupacional'
    WHEN p ~* '(usg|ultrassom|ultrassonograf|transvaginal|doppler|morfol[óo]gic|obst[ée]tric|\mus\M)' THEN 'Ultrassonografia'
    WHEN p ~* '(tomografi|\mtc\M|cone ?beam|enterografi)'                   THEN 'Tomografia'
    WHEN p ~* '(raio ?-? ?x|\mrx\M|panor[âa]mic|radiografia)'               THEN 'Raio-X'
    WHEN p ~* '(holter|\mmapa\M|\mecg\M|eletrocardiograma)'                 THEN 'Cardiologia'
    WHEN p ~* '(\meeg\M|eletroencefalograma|espirometr|romberg)'            THEN 'Neuro e Pneumo'
    WHEN p ~* '(papanicolau|preventivo|colpocitol)'                         THEN 'Papanicolau'
    WHEN p ~* '(sexagem|paternidade|\mdna\M|cari[óo]tipo)'                   THEN 'Genética e DNA'
    WHEN p ~* '(coleta|sangue|urina|fezes|horm[ôo]n|laborat[óo]ri|glicose|colesterol|hemograma|\mpsa\M|\mtsh\M|vitamina|bacterioscop|espermograma|beta ?hcg|gravidez|ferritina|creatinina|\mvhs\M|hemossediment|gama ?-? ?gt|\mtgo\M|\mtgp\M|hcv|hbv|\mhiv\M|\mppd\M|igra|interferon|tipagem|lactose|\msibo\M|baar|curva glic|sorologi|\mpcr\M|dosagem)' THEN 'Laboratório'
    ELSE 'Outros'
  END;
$fn$;

COMMENT ON FUNCTION ana_familia_exame(text) IS
  'Agrupa a descricao livre do exame numa familia, para filtrar na planilha.';

CREATE OR REPLACE VIEW ana_leads_planilha AS
SELECT nome                      AS "Nome",
       phone                     AS "WhatsApp",
       exames                    AS "Exame procurado",
       ana_familia_exame(exames) AS "Familia",
       status                    AS "Status",
       data_contato              AS "Data do contato",
       ultima_msg                AS "Ultima mensagem",
       CASE WHEN recontato THEN 'sim' ELSE 'nao' END AS "Recontato",
       ord
FROM ana_relatorio_conversas;

COMMENT ON VIEW ana_leads_planilha IS
  'Exatamente as colunas que o ANA-07 grava na planilha do Google, nessa ordem.';

-- Conferencia:
--   SELECT "Familia", count(*) FROM ana_leads_planilha GROUP BY 1 ORDER BY 2 DESC;

-- Total Quality / Ana — dados da pagina "Jornada do paciente no WhatsApp"
-- Gerado em 09/10/2026. A pagina HTML fica fora do repositorio (e um retrato,
-- nao fonte), mas as consultas que a alimentam ficam aqui para refazer quando quiser.
--
-- A versao anterior da pagina tinha todos os numeros chumbados no HTML. Para o
-- filtro de data funcionar de verdade, a pagina agora carrega series POR DIA e
-- soma no navegador conforme o intervalo escolhido.

-- 1) Funil por dia -------------------------------------------------------------
-- Conta conversas INICIADAS no dia e classifica cada uma pelo estagio que alcancou
-- ate hoje (os campos de estagio em ana_leads sao estado atual, nao datados).
WITH prim AS (
  SELECT phone, min(created_at) AS inicio,
         count(*) FILTER (WHERE role = 'user') AS msgs_pac
  FROM ana_mensagens GROUP BY phone),
base AS (
  SELECT (p.inicio AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::date AS dia,
         (p.msgs_pac >= 2) AS engajou,
         (jsonb_array_length(coalesce(l.exames,'[]'::jsonb)) > 0) AS disse_exame,
         (coalesce(l.agendamento->>'status','nenhum')
            IN ('proposto','confirmado','cancelado')) AS falou_data,
         (coalesce(l.agendamento->>'status','') = 'confirmado') AS agendou
  FROM prim p JOIN ana_leads l ON l.phone = p.phone)
SELECT dia, count(*) AS iniciadas,
       count(*) FILTER (WHERE engajou)     AS engajaram,
       count(*) FILTER (WHERE disse_exame) AS disseram_exame,
       count(*) FILTER (WHERE falou_data)  AS falaram_data,
       count(*) FILTER (WHERE agendou)     AS agendaram
FROM base GROUP BY dia ORDER BY dia;

-- 2) Tempo de resposta por dia --------------------------------------------------
-- Cada mensagem do paciente seguida de uma resposta da Ana. O valor vai limitado a
-- 7200s no topo: nao afeta mediana nem percentil 90 (so 3% passam de 1h) e segura
-- o tamanho do arquivo. A pagina guarda os segundos crus por dia para que mediana
-- e p90 sejam exatos em qualquer intervalo — media de medianas diarias nao serve.
WITH seq AS (
  SELECT phone, role, created_at,
         lead(role)       OVER (PARTITION BY phone ORDER BY created_at) AS pr,
         lead(created_at) OVER (PARTITION BY phone ORDER BY created_at) AS pe
  FROM ana_mensagens)
SELECT (created_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::date AS dia,
       least(round(extract(epoch FROM pe - created_at))::int, 7200) AS segundos
FROM seq
WHERE role = 'user' AND pr = 'assistant' AND pe > created_at
ORDER BY dia, segundos;

-- 3) Demanda por exame que a clinica nao faz, por dia ---------------------------
WITH prim AS (SELECT phone, min(created_at) AS inicio FROM ana_mensagens GROUP BY phone),
ex AS (
  SELECT (p.inicio AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::date AS dia,
         lower(unaccent(jsonb_array_elements_text(l.exames))) AS e
  FROM ana_leads l JOIN prim p ON p.phone = l.phone),
cls AS (
  SELECT dia, CASE
    WHEN e ~ 'ressonancia|rnm|\mrm\M'                       THEN 'Ressonância magnética'
    WHEN e ~ 'ecocardio|eco de coracao'                     THEN 'Ecocardiograma'
    WHEN e ~ 'ergometric|teste de esforco|esteira'          THEN 'Teste ergométrico'
    WHEN e ~ 'mamografia'                                   THEN 'Mamografia'
    WHEN e ~ 'endoscopia'                                   THEN 'Endoscopia'
    WHEN e ~ 'eletroneuromiografia|eletromiografia|\menmg\M' THEN 'Eletroneuromiografia'
    WHEN e ~ 'colonoscopia'                                 THEN 'Colonoscopia'
    WHEN e ~ 'densitometria'                                THEN 'Densitometria óssea'
    WHEN e ~ 'cintilografia|pet ?scan|pet-ct'               THEN 'Cintilografia / PET'
    ELSE NULL END AS cat
  FROM ex)
SELECT dia, cat, count(*) AS n FROM cls WHERE cat IS NOT NULL
GROUP BY dia, cat ORDER BY dia, cat;

-- 4) Follow-up disparado por dia ------------------------------------------------
-- "Respondeu" = o paciente mandou mensagem em ate 7 dias depois do toque.
WITH fu AS (
  SELECT (enviado_em AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::date AS dia,
         phone, enviado_em
  FROM ana_envios_log WHERE tipo LIKE 'follow%')
SELECT dia, count(*) AS enviados,
       count(*) FILTER (WHERE EXISTS (
         SELECT 1 FROM ana_mensagens m
          WHERE m.phone = f.phone AND m.role = 'user'
            AND m.created_at >  f.enviado_em
            AND m.created_at <  f.enviado_em + interval '7 days')) AS responderam
FROM fu f GROUP BY dia ORDER BY dia;

-- 5) Situacao de hoje (nao acompanha o filtro da pagina) ------------------------
SELECT
 (SELECT count(*) FROM ana_leads WHERE coalesce(escalado,false)) AS escaladas,
 (SELECT coalesce(max(now()::date - updated_at::date),0)
    FROM ana_leads WHERE coalesce(escalado,false)) AS escalada_mais_antiga_dias,
 (SELECT count(*) FROM ana_leads
   WHERE coalesce(bot_ativo,true) = false AND coalesce(opt_out,false) = false) AS bot_pausado,
 (SELECT count(*) FROM ana_conversas_mortas WHERE prioridade = '2 - Media') AS pergunta_sem_resposta,
 (SELECT count(*) FROM ana_conversas_mortas WHERE prioridade = '4 - So agradecimento') AS despedidas,
 (SELECT count(*) FROM ana_leads WHERE coalesce(opt_out,false)) AS opt_out,
 (SELECT count(*) FROM ana_leads WHERE followup_due_at IS NOT NULL) AS fila_followup;

-- OBSERVACAO sobre o MCP do Supabase: ele quebra o SQL no ponto-e-virgula, entao
-- rode um bloco por vez. E um replace/string com ';' dentro trava ate o timeout.

-- 6) Cache e agendamento diario ------------------------------------------------
-- Ver PAINEL-jornada.md. Resumo do que esta no banco:
--   ana_jornada_payload()    monta o JSON completo (as consultas 1 a 5 acima)
--   ana_jornada_cache        guarda o ultimo resultado, uma linha so
--   ana_jornada_atualizar()  roda o payload e grava no cache
--   cron.job 'ana-jornada-diaria'  '3 3 * * *' = 00:03 de Brasilia
--   Edge Function 'jornada'  serve a pagina a partir do cache, com token
--
-- CREATE TABLE public.ana_jornada_cache (
--   id boolean PRIMARY KEY DEFAULT true CHECK (id),
--   gerado_em timestamptz NOT NULL DEFAULT now(),
--   payload jsonb NOT NULL);
--
-- SELECT cron.schedule('ana-jornada-diaria', '3 3 * * *',
--   $$SELECT public.ana_jornada_atualizar()$$);

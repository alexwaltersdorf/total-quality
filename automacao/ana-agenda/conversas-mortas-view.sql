-- Total Quality / Ana — triagem das conversas "mortas"
-- Conversa morta = lead sem agendamento confirmado cuja ultima mensagem e do
-- paciente ha mais de 24h, ou que esta escalada e ninguem fechou.
--
-- A coluna 'prioridade' separa o que pede acao do que so encerrou educadamente:
--   1 - Alta             escalada aberta, a equipe precisa responder
--   2 - Media            a ultima fala do paciente tem pergunta ou pedido
--   3 - Conferir         texto longo sem padrao de pergunta — olhar caso a caso
--   4 - So agradecimento "ok", "obrigada", emoji — nao precisa de retorno
--
-- Observacao: use CREATE OR REPLACE. DROP VIEW nesse projeto estoura o timeout
-- de 60s e derruba o lote inteiro; o REPLACE so aceita colunas acrescentadas
-- no fim da lista.

CREATE OR REPLACE VIEW public.ana_conversas_mortas AS
WITH ult AS (
  SELECT DISTINCT ON (m.phone) m.phone, m.role, m.created_at, m.conteudo
    FROM ana_mensagens m
   ORDER BY m.phone, m.created_at DESC
), b AS (
  SELECT CASE WHEN l.nome IS NULL
               OR btrim(regexp_replace(l.nome, '[\[\]\s]', '', 'g')) = ''
              THEN '(sem nome)' ELSE btrim(l.nome) END AS nome,
         l.phone,
         l.escalado,
         COALESCE(NULLIF(l.motivo_escalada, ''), '—') AS detalhe,
         u.role, u.created_at,
         COALESCE(u.conteudo, '') AS conteudo,
         COALESCE(NULLIF(array_to_string(
           ARRAY(SELECT jsonb_array_elements_text(l.exames)), '; '), ''),
           '(não informado)') AS exames
    FROM ana_leads l
    JOIN ult u ON u.phone = l.phone
   WHERE COALESCE(l.opt_out, false) = false
     AND COALESCE(l.agendamento ->> 'status', 'nenhum') <> 'confirmado'
     AND (COALESCE(l.escalado, false)
          OR (u.role = 'user' AND u.created_at < now() - interval '24 hours'))
)
SELECT nome,
       phone,
       CASE WHEN escalado THEN 'Escalada aberta' ELSE 'Paciente sem resposta' END AS motivo,
       detalhe,
       round(EXTRACT(epoch FROM now() - created_at) / 86400)::integer AS dias_parado,
       to_char(created_at AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY') AS ultima_em,
       left(regexp_replace(conteudo, '\s+', ' ', 'g'), 110) AS ultima_mensagem,
       exames,
       created_at AS ord,
       CASE
         WHEN escalado THEN '1 - Alta'
         WHEN conteudo ~* '\?|\m(quanto|qual|quando|onde|como|tem|preciso|pode|poderia|gostaria|queria|consigo|aceita|faz|fazem|valor|pre[çc]o|hor[áa]rio|vaga|agendar|marcar)\M'
              THEN '2 - Media'
         WHEN length(btrim(conteudo)) <= 30 THEN '4 - So agradecimento'
         ELSE '3 - Conferir'
       END AS prioridade
  FROM b;

-- Foto de 03/10/2026: 258 conversas — 68 alta, 17 media, 20 conferir,
-- 153 so agradecimento. A mais antiga estava parada ha 48 dias.

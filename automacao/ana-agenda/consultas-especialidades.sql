-- Total Quality / Ana — a clinica passou a oferecer consultas medicas
-- Aplicado em 08/10/2026 no projeto Supabase ajwhrmjzvfdjwsqynbzt.
--
-- Antes desta mudanca o prompt da Ana dizia, literalmente, "clinica EXCLUSIVA de
-- exames diagnosticos (nao faz consultas)", entao ela negava consulta mesmo havendo
-- preco na tabela. A tabela, por sua vez, estava desencontrada da realidade:
--   * Consulta Endocrinologista ATIVA a R$ 900,00 — era o valor que a Ana cotava
--   * ASO ATIVO a R$ 150,00 e na categoria "Funcao Pulmonar/Espi"
--   * Dermatologista e Gastro existiam como linha, mas inativas e sem preco
--   * uma linha "Consulta" solta a R$ 200 competia com as linhas por especialidade
--   * "Retorno de Consulta Medica" ATIVO a R$ 1,00
--
-- Politica de pagamento vigente no prompt: 10% de desconto a vista (PIX/dinheiro).
-- Por isso preco_pix = preco * 0,9 em todas as linhas abaixo.

-- 1) Tabela final de consultas --------------------------------------------------
--   Gastroenterologista .......... R$ 300 (R$ 270 a vista)
--   Endocrinologista ............. R$ 300 (R$ 270)
--   Dermatologista ............... R$ 300 (R$ 270)
--   Ginecologista ................ R$ 300 (R$ 270)  — era R$ 350
--   Angiologista / Vascular ...... R$ 300 (R$ 270)  — era R$ 100
--   Clinico Geral ................ R$ 200 (R$ 180)
--   Nutricionista ................ R$ 150 (R$ 135)  — nao e especialidade medica
--   ASO .......................... R$  80 (R$  72)
--   Atestado medico avulso ....... R$  80 (R$  72)
--   Retorno ...................... sem cobranca em ate 30 dias da consulta

UPDATE ana_precos SET
  nome_exame = 'Consulta Gastroenterologista', categoria = 'Consulta Médica',
  sinonimos = ARRAY['consga','gastro','gastroenterologista','gastroenterologia',
                    'consulta gastro','medico do estomago','medico do intestino'],
  preco = 300.00, preco_pix = 270.00, ativo = true, updated_at = now()
WHERE id = 1812;

UPDATE ana_precos SET
  nome_exame = 'Consulta Endocrinologista', categoria = 'Consulta Médica',
  sinonimos = ARRAY['consen','endocrino','endocrinologista','endocrinologia',
                    'consulta endocrino'],
  preco = 300.00, preco_pix = 270.00, ativo = true, updated_at = now()
WHERE id = 1811;

UPDATE ana_precos SET
  nome_exame = 'Consulta Dermatologista', categoria = 'Consulta Médica',
  sinonimos = ARRAY['consde','dermato','dermatologista','dermatologia',
                    'consulta dermato'],
  preco = 300.00, preco_pix = 270.00, ativo = true, updated_at = now()
WHERE id = 1810;

UPDATE ana_precos SET
  nome_exame = 'Consulta Ginecologista', categoria = 'Consulta Médica',
  sinonimos = ARRAY['congi','gineco','ginecologista','ginecologia','consulta gineco'],
  preco = 300.00, preco_pix = 270.00, ativo = true, updated_at = now()
WHERE id = 1813;

-- CUIDADO com os sinonimos desta linha. O sinonimo solto 'vascular' fazia
-- "doppler vascular" cair na CONSULTA de R$ 300 em vez do exame de R$ 250 —
-- um sinonimo com 4+ caracteres contido na busca vale 0,65 e atropela os exames.
-- Todo sinonimo precisa carregar a palavra "consulta", "angiologista" ou equivalente.
--
-- A busca fuzzy nao resolve isso sozinha: "ultrassom vascular" ainda encosta nesta
-- linha com 0,43 porque nao existe exame chamado "Us Vascular" (os exames vasculares
-- se chamam "Doppler ..."). Quem decide e a regra no prompt, que manda a Ana tratar
-- Doppler/ultrassom vascular como EXAME e perguntar territorio e lado antes de cotar.
-- Os 32 exames Doppler ativos custam R$ 250, menos dois (R$ 600 e R$ 300).
UPDATE ana_precos SET
  nome_exame = 'Consulta Angiologista / Cirurgia Vascular', categoria = 'Consulta Médica',
  sinonimos = ARRAY['consva','angiologista','angiologia','cirurgia vascular',
                    'consulta vascular','consulta com vascular','medico de varizes',
                    'medico das varizes'],
  preco = 300.00, preco_pix = 270.00, ativo = true, updated_at = now()
WHERE id = 1820;

UPDATE ana_precos SET
  nome_exame = 'Consulta Clínico Geral', categoria = 'Consulta Médica',
  sinonimos = ARRAY['consc','clinico geral','clinica geral','clinico',
                    'consulta clinico geral','medico clinico'],
  preco = 200.00, preco_pix = 180.00, ativo = true, updated_at = now()
WHERE id = 1809;

UPDATE ana_precos SET
  categoria = 'Consulta Médica',
  sinonimos = ARRAY['consn','nutricionista','nutricao','nutri','consulta nutricionista'],
  preco = 150.00, preco_pix = 135.00, ativo = true,
  observacao = 'Consulta com nutricionista (nao e especialidade medica).',
  updated_at = now()
WHERE id = 1815;

UPDATE ana_precos SET
  nome_exame = 'ASO - Atestado de Saúde Ocupacional', categoria = 'Consulta Médica',
  sinonimos = ARRAY['aso','atestado de saude ocupacional','atestado ocupacional',
                    'exame admissional','admissional','demissional','periodico',
                    'atestado de saude'],
  preco = 80.00, preco_pix = 72.00, ativo = true,
  observacao = 'Emissao do ASO. Exames complementares do PCMSO sao cobrados a parte.',
  updated_at = now()
WHERE id = 1987;

UPDATE ana_precos SET
  categoria = 'Consulta Médica',
  sinonimos = ARRAY['atest','atestado','atestado medico','declaracao de comparecimento'],
  preco = 80.00, preco_pix = 72.00, ativo = true,
  observacao = 'Atestado medico avulso. Nao confundir com o ASO, que tambem e R$ 80 '
               'mas e documento de admissao/periodico/demissao.',
  updated_at = now()
WHERE id = 1805;

-- Retorno: regra unica, sem cobranca em ate 30 dias.
UPDATE ana_precos SET
  nome_exame = 'Retorno de Consulta Médica', categoria = 'Retorno',
  sinonimos = ARRAY['retc','retorno','retorno de consulta','revisao','reconsulta',
                    'volta ao medico'],
  preco = 0.00, preco_pix = 0.00, ativo = true,
  observacao = 'SEM COBRANCA quando o retorno acontece em ate 30 dias da consulta. '
               'Passados os 30 dias, cobra-se uma nova consulta pelo valor da especialidade.',
  updated_at = now()
WHERE id = 1959;

-- 2) Linhas desativadas ---------------------------------------------------------
-- "Consulta" generica a R$ 200: a busca fuzzy a devolvia para perguntas de qualquer
-- especialidade, fazendo a Ana cotar R$ 200 numa consulta de R$ 300.
UPDATE ana_precos SET ativo = false,
  observacao = 'Desativada em 08/10/2026: linha generica causava cotacao errada de especialidade.',
  updated_at = now()
WHERE id = 1806;

-- "Retorno Cardiologista / Pediatria" a R$ 80: nao ha consulta dessas especialidades
-- e a regra de retorno passou a ser unica.
UPDATE ana_precos SET ativo = false,
  observacao = 'Desativada em 08/10/2026: nao ha consulta de cardiologia nem pediatria, '
               'e o retorno agora segue regra unica (sem cobranca em ate 30 dias).',
  updated_at = now()
WHERE id = 1958;

-- 3) Prompt (ana_config.system_prompt) -----------------------------------------
-- Backup integral em ana_config.chave = 'system_prompt_backup_2026_10_08'.
--
-- ARMADILHA DO MCP DO SUPABASE: o cliente quebra o SQL no ponto-e-virgula, INCLUSIVE
-- dentro de string literal. Um replace cujo texto novo contenha ';' nao da erro — ele
-- trava e estoura o timeout de 60s, e a transacao volta atras. Escreva os textos sem
-- ponto-e-virgula (use ponto) e faca um replace por chamada.
--
-- Mudancas:
--   a) Identidade: "clinica EXCLUSIVA de exames diagnosticos (nao faz consultas)"
--      -> "exames diagnosticos e consultas em especialidades selecionadas (...)"
--   b) Diferenciais: "laboratorio + imagem + cardiologia + neuro/pneumo" ganhou
--      "+ consultas (gastro, endocrino, dermato, clinico geral)"
--   c) Secao "Exames que REALIZAMOS": bullet novo de consultas, com cinco travas —
--      preco so via consultar_precos, consulta dispensa pedido medico, a Ana NAO
--      indica especialidade (ato medico, oferece Clinico Geral ou escala), a regra
--      de retorno de 30 dias dita por extenso, e a separacao entre exame e consulta
--      no caso vascular (Doppler/ultrassom vascular e EXAME, nunca consulta).
--   d) Secao "NAO realizamos": a frase negava consulta com qualquer especialista.
--      Agora lista as que de fato faltam (cardio, neuro, pediatra, otorrino, oftalmo)
--      e manda consultar a tabela / escalar para as demais, em vez de negar.

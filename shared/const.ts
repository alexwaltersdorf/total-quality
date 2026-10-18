export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';

/**
 * Data de fundação da Total Quality: 08/07/2003.
 *
 * Fonte única de verdade para qualquer texto que cite tempo de atuação. Antes
 * desta constante o número vivia escrito à mão em cinco lugares do prerender e
 * dos metadados — todos ficariam errados no aniversário seguinte. Formato ISO
 * porque também alimenta o `foundingDate` do Schema.org.
 */
export const FUNDACAO_ISO = "2003-07-08";

/**
 * Anos completos de atuação até `hoje` (padrão: agora).
 *
 * Conta aniversários já ocorridos: em 07/07/2026 são 22; a partir de 08/07/2026,
 * 23. Use sempre esta função — nunca escreva o número no texto.
 */
export function anosDeAtuacao(hoje: Date = new Date()): number {
  const [ano, mes, dia] = FUNDACAO_ISO.split("-").map(Number);
  let anos = hoje.getFullYear() - ano;
  const mesAtual = hoje.getMonth() + 1;
  const diaAtual = hoje.getDate();
  if (mesAtual < mes || (mesAtual === mes && diaAtual < dia)) anos -= 1;
  return anos;
}

/*
 * Identidade de busca da home e da landing de análises clínicas — FONTE ÚNICA.
 *
 * Regra de ouro (Google, "Como a Pesquisa determina a classificação"): o
 * sinal mais básico de relevância é a consulta estar no título e no corpo da
 * página — e o Google lê a página RENDERIZADA. Até out/2026 cada página tinha
 * três versões do próprio título: a do index.html, a do pré-render
 * (routes-metadata.ts) e a do React (document.title). A landing dizia
 * "Laboratório de Análises Clínicas" para o robô e "Laboratório em
 * Caraguatatuba" depois do JavaScript — exatamente o termo da home. Era essa a
 * canibalização real.
 *
 * Quem é dona de "laboratório" foi decidido por DADO, não por opinião: no
 * Search Console (90 dias até 16/10/2026) a home é a URL que o Google escolhe
 * para "laboratório caraguatatuba" (posição ~3–4 nas últimas semanas) e
 * "laboratório" (~4), contra ~10–12 da landing — e é a URL cadastrada no
 * perfil do Google. A landing fica com "análises clínicas".
 *
 * Pré-render, React e index.html leem daqui; um guard-rail quebra se alguma
 * das três voltar a escrever o próprio texto.
 */
export const HOME_TITLE = "Laboratório em Caraguatatuba | Total Quality";
export const HOME_H1 = "Laboratório em Caraguatatuba: análises clínicas e medicina diagnóstica";
export function homeDescription(anos: number = anosDeAtuacao()): string {
  return `Laboratório de análises clínicas em Caraguatatuba há ${anos} anos. Exames de sangue sem agendamento, por ordem de chegada, coleta domiciliar e exames de imagem.`;
}

export const ANALISES_TITLE = "Análises Clínicas em Caraguatatuba | Total Quality";
export const ANALISES_H1 = "Análises clínicas em Caraguatatuba";
export const ANALISES_DESCRIPTION =
  "Análises clínicas em Caraguatatuba: hemograma, glicemia, colesterol, hormônios, urina e fezes. Coleta sem agendamento, por ordem de chegada, e resultado online.";

/** Os únicos convênios atendidos (decisão de 05/09/2026). Fora deles, particular. */
export const CONVENIOS_TEXTO = "Cartão de Todos, Solumedi e Leader";

/*
 * /checkup — fonte unica do <title> e da description (prerender e React).
 * Antes o servidor dizia "Planos e Preços" e o React "Check-Up Preventivo",
 * e os dois prometiam "resultados rápidos" e "Agende agora!". Palavra-chave
 * "check-up completo Caraguatatuba" (pedido do Alex, 18/10/2026).
 */
export const CHECKUP_TITLE = "Check-up Completo em Caraguatatuba | Total Quality";
export const CHECKUP_DESCRIPTION = "Check-up em Caraguatatuba com planos Básico, Select e Premium: exames de sangue, cardiológicos e de imagem por faixa etária. Dúvidas pelo WhatsApp.";

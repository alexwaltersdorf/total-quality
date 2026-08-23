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

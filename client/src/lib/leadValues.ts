/*
 * Valor monetario por tipo de lead, usado no parametro `value` do evento
 * whatsapp_click — e portanto na conversao do Google Ads.
 *
 * Para que serve: com todos os leads valendo o mesmo, o Ads so consegue
 * otimizar por VOLUME. Com valores diferentes por tipo, ele passa a perseguir
 * os leads que valem mais para a clinica (um check-up completo nao vale o mesmo
 * que uma duvida pontual sobre horario).
 *
 * IMPORTANTE: os numeros aqui sao ticket medio, informacao de negocio do Alex.
 * Ele informou R$ 249,60 como ticket medio da clinica em 11/08/2026, e esse
 * valor vale para todos os tipos por enquanto. Nao inventar diferenciacao: um
 * numero chutado por tipo distorce o leilao do Ads e gasta orcamento no lugar
 * errado. Quando houver ticket medio POR tipo de lead, trocar linha a linha —
 * e so a partir dai o Ads consegue preferir os leads que valem mais.
 */
const TICKET_MEDIO = 249.6;

export const LEAD_VALUES: Record<string, number> = {
  // Laboratorio e exames avulsos
  geral: TICKET_MEDIO,
  laboratorio: TICKET_MEDIO,
  exames: TICKET_MEDIO,
  // Pacotes e servicos
  checkup: TICKET_MEDIO,
  bioimpedancia: TICKET_MEDIO,
  cartao: TICKET_MEDIO,
  // Origens informacionais (blog, artigos): intencao mais fria
  blog: TICKET_MEDIO,
  convenios: TICKET_MEDIO,
};

/** Valor usado quando o tipo de lead nao esta na tabela. */
export const LEAD_VALUE_PADRAO = TICKET_MEDIO;

/**
 * Resolve o valor de um lead. Tenta o tipo de exame primeiro (mais especifico)
 * e cai para a origem; `checkup_completo` casa com a chave `checkup`.
 */
export function resolveLeadValue(leadSource: string, examType: string): number {
  for (const chave of [examType, examType.split("_")[0], leadSource, leadSource.split("_")[0]]) {
    if (chave && chave in LEAD_VALUES) return LEAD_VALUES[chave];
  }
  return LEAD_VALUE_PADRAO;
}

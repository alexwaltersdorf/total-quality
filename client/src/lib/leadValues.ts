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
 * Enquanto ele nao informar os valores reais, TODOS ficam em 1 — o
 * comportamento atual, otimizacao por volume — e nada e inventado. Preencher a
 * tabela abaixo e um passo consciente, nao um chute: numero errado aqui
 * distorce o leilao do Ads e gasta orcamento no lugar errado.
 *
 * Como preencher: trocar o 1 pelo ticket medio em reais do tipo de lead.
 * Ex.: CHECKUP: 450 se o check-up medio fecha em R$ 450.
 */
export const LEAD_VALUES: Record<string, number> = {
  // Laboratorio e exames avulsos
  geral: 1,
  laboratorio: 1,
  exames: 1,
  // Pacotes e servicos de ticket maior
  checkup: 1,
  bioimpedancia: 1,
  cartao: 1,
  // Origens informacionais (blog, artigos): intencao mais fria
  blog: 1,
  convenios: 1,
};

/** Valor usado quando o tipo de lead nao esta na tabela. */
export const LEAD_VALUE_PADRAO = 1;

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

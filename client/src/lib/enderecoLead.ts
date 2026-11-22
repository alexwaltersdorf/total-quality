/*
 * Endereco do formulario de qualificacao: o que viaja para o lead.
 *
 * Pedido do Alex (22/11/2026): autocompletar de endereco do Google no
 * formulario que antecede o WhatsApp e a ligacao, mantendo nome, telefone e
 * e-mail como estao. Os dois campos novos sao OPCIONAIS — o topo de
 * contexts/ContatoLeadContext.tsx explica por que campo obrigatorio custa lead.
 *
 * LGPD (minimizacao, art. 6, III): o endereco vai SO para o armazenamento da
 * propria clinica — lead.create -> banco e planilha (que manda o e-mail).
 * NUNCA para dataLayer/GTM/GA4/Google Ads/Meta/Conversions API, nem em hash,
 * nem na mensagem do WhatsApp (iria parar na URL da conversa). Ha guard-rail
 * em server/endereco-lead.test.ts.
 *
 * Este arquivo fica no bundle de entrada e por isso e pequeno e puro. Tudo
 * que fala com o Google mora em lib/enderecoGoogle.ts, baixado sob demanda.
 */

/** Partes do endereco devolvidas pelo Google ao escolher uma sugestao. */
export interface ComponentesEndereco {
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  /** Sigla do estado: "SP". */
  uf?: string;
  cep?: string;
}

/** Campos de endereco aceitos por lead.create (server/routers.ts). */
export interface EnderecoDoLead {
  address?: string;
  addressComplement?: string;
  street?: string;
  streetNumber?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

/**
 * Limites do schema do lead.create. O cliente corta ANTES de enviar: um campo
 * acima do limite faria o zod recusar o lead inteiro — e perder nome, telefone
 * e e-mail por causa de um endereco comprido seria o pior resultado possivel.
 */
export const LIMITES_ENDERECO = {
  address: 300,
  addressComplement: 100,
  street: 200,
  streetNumber: 20,
  neighborhood: 100,
  city: 100,
  state: 50,
  zipCode: 20,
} as const satisfies Record<keyof EnderecoDoLead, number>;

function limpo(valor: string | undefined, limite: number): string | undefined {
  const t = (valor ?? "").replace(/\s+/g, " ").trim();
  return t ? t.slice(0, limite) : undefined;
}

/**
 * Monta o pedaco de endereco do lead. Sem nada digitado, devolve objeto vazio
 * e o lead sai exatamente como saia antes de 22/11/2026.
 *
 * `componentes` so vale para o texto que veio do Google: se a pessoa editar o
 * campo depois de escolher a sugestao, o formulario descarta os componentes
 * (ver CampoEnderecoGoogle) e fica so o texto digitado.
 */
export function montarEnderecoLead(
  endereco: string,
  complemento: string,
  componentes: ComponentesEndereco | null
): EnderecoDoLead {
  const L = LIMITES_ENDERECO;
  const address = limpo(endereco, L.address);
  const addressComplement = limpo(complemento, L.addressComplement);
  if (!address && !addressComplement) return {};

  const lead: EnderecoDoLead = { address, addressComplement };
  if (address && componentes) {
    lead.street = limpo(componentes.rua, L.street);
    lead.streetNumber = limpo(componentes.numero, L.streetNumber);
    lead.neighborhood = limpo(componentes.bairro, L.neighborhood);
    lead.city = limpo(componentes.cidade, L.city);
    lead.state = limpo(componentes.uf, L.state);
    lead.zipCode = limpo(componentes.cep, L.zipCode);
  }
  // Sem chaves undefined no JSON: o payload fica igual ao de antes quando vazio.
  return Object.fromEntries(
    Object.entries(lead).filter(([, v]) => v !== undefined)
  ) as EnderecoDoLead;
}

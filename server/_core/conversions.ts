/*
 * Envio de conversoes pelo SERVIDOR — Meta Conversions API e GA4 Measurement
 * Protocol.
 *
 * POR QUE EXISTE: ate aqui toda conversao saia do navegador pelo GTM. O
 * diagnostico de 14/09/2026 (seo---total-quality, docs/diagnostico-queda-ga4)
 * mostrou o que isso custa: o Consent Mode entrou com padrao NEGADO em 20/08 e
 * a propriedade tem ~17 usuarios/dia, muito abaixo do limiar de modelagem
 * comportamental do Google. Resultado: quem nao aceita o banner some do
 * relatorio. Um lead que preencheu nome, telefone e e-mail e pediu contato NAO
 * pode sumir junto — ele ja esta no nosso banco, e o servidor consegue
 * reporta-lo mesmo quando o navegador nao consegue.
 *
 * O QUE ESTE MODULO NAO FAZ: nao substitui o GTM. O evento do navegador
 * continua saindo normalmente; os dois carregam o MESMO `eventId`, e as
 * plataformas deduplicam. Sem o eventId compartilhado a conversao contaria em
 * dobro — por isso ele e obrigatorio nas duas pontas.
 *
 * LGPD, art. 11 (dado de saude). A clinica e um laboratorio: contato somado ao
 * exame procurado e dado sensivel. A regra de consentimento aqui e a mesma ja
 * documentada em client/src/lib/userData.ts, so que aplicada no servidor:
 *
 *   - Banco, planilha e e-mail para a clinica  -> SEMPRE. E uso operacional
 *     proprio: a pessoa preencheu um formulario pedindo para ser contatada.
 *   - Meta CAPI e conversao identificada       -> SO com consentimento de
 *     marketing. Levam contato (com hash) para um terceiro, com finalidade de
 *     publicidade — outra finalidade, outro consentimento.
 *   - GA4 Measurement Protocol                 -> SO com consentimento de
 *     analytics. Nao leva contato, mas e medicao de comportamento.
 *
 * `exam_type` NUNCA acompanha o contato no mesmo destino: o que a pessoa
 * procurou nao pode ser reassociado a ela num sistema de anuncios.
 */
import { createHash } from "node:crypto";
import { ENV } from "./env";

const META_API_VERSION = "v21.0";
const TIMEOUT_MS = 5_000;

export type ConsentState = {
  /** ad_user_data / ad_storage — libera Meta CAPI e conversao identificada. */
  marketing: boolean;
  /** analytics_storage — libera o GA4 Measurement Protocol. */
  analytics: boolean;
};

export type LeadConversion = {
  /** Compartilhado com o evento do navegador. Sem ele nao ha deduplicacao. */
  eventId: string;
  name?: string;
  phone?: string;
  email?: string;
  /** Slug do exame ou categoria. Vai SO para o GA4, nunca junto do contato. */
  examType?: string;
  /** Ticket do lead (client/src/lib/leadValues.ts). */
  value?: number;
  page: string;
  /** client_id do GA4, lido do cookie _ga pelo navegador. */
  clientId?: string;
  /** Cookies de clique do Meta, quando existem. */
  fbc?: string;
  fbp?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  consent: ConsentState;
};

/** SHA-256 hex minusculo — formato exigido por Meta e Google. */
function sha256(valor: string): string {
  return createHash("sha256").update(valor).digest("hex");
}

/** Normaliza e-mail: sem espacos, minusculo. */
export function normalizeEmail(bruto: string): string | null {
  const email = bruto.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

/**
 * Telefone para E.164 assumindo Brasil quando o DDI nao vem escrito.
 * O Meta quer os digitos sem o "+"; o Google quer com. Guardamos sem e
 * acrescentamos onde for preciso.
 */
export function normalizePhoneBR(bruto: string): string | null {
  const digitos = bruto.replace(/\D/g, "").replace(/^0+/, "");
  if (digitos.length < 10) return null;
  const comPais = digitos.startsWith("55") && digitos.length >= 12 ? digitos : `55${digitos}`;
  return comPais.length >= 12 && comPais.length <= 13 ? comPais : null;
}

/** Primeiro nome, minusculo e sem acento — normalizacao do Meta para `fn`. */
export function normalizeFirstName(bruto: string): string | null {
  const primeiro = bruto
    .trim()
    .split(/\s+/)[0]
    ?.toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z]/g, "");
  return primeiro && primeiro.length >= 2 ? primeiro : null;
}

/**
 * Meta Conversions API.
 *
 * Silencioso e nao-bloqueante por contrato: qualquer falha aqui e registrada e
 * engolida. Um lead jamais deixa de ser gravado porque o Meta respondeu 500.
 */
async function sendToMeta(lead: LeadConversion): Promise<"sent" | "skipped" | "failed"> {
  if (!lead.consent.marketing) return "skipped";
  const pixelId = ENV.metaPixelId;
  const token = ENV.metaConversionsApiToken;
  if (!pixelId || !token) return "skipped";

  const email = lead.email ? normalizeEmail(lead.email) : null;
  const phone = lead.phone ? normalizePhoneBR(lead.phone) : null;
  const firstName = lead.name ? normalizeFirstName(lead.name) : null;
  // Sem nenhum identificador o Meta nao consegue casar o evento com ninguem.
  if (!email && !phone && !lead.fbc && !lead.fbp) return "skipped";

  const userData: Record<string, unknown> = {};
  if (email) userData.em = [sha256(email)];
  if (phone) userData.ph = [sha256(phone)];
  if (firstName) userData.fn = [sha256(firstName)];
  if (lead.fbc) userData.fbc = lead.fbc;
  if (lead.fbp) userData.fbp = lead.fbp;
  if (lead.ipAddress) userData.client_ip_address = lead.ipAddress;
  if (lead.userAgent) userData.client_user_agent = lead.userAgent;

  const payload = {
    data: [
      {
        event_name: "Lead",
        event_time: Math.floor(Date.now() / 1000),
        // Mesmo id do evento do navegador: o Meta descarta a copia.
        event_id: lead.eventId,
        action_source: "website",
        event_source_url: lead.page,
        user_data: userData,
        // Sem exam_type: o que a pessoa procurou nao vai para o Meta junto do
        // contato dela (LGPD art. 11).
        custom_data: {
          currency: "BRL",
          ...(lead.value ? { value: lead.value } : {}),
        },
      },
    ],
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${META_API_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(token)}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      }
    );
    if (!res.ok) {
      // Nunca logar o corpo: ele ecoa os hashes enviados.
      console.warn(`[Conversions] Meta CAPI respondeu ${res.status}`);
      return "failed";
    }
    return "sent";
  } catch (e) {
    console.warn("[Conversions] Meta CAPI falhou:", e instanceof Error ? e.message : "erro desconhecido");
    return "failed";
  }
}

/**
 * GA4 Measurement Protocol.
 *
 * Sem contato — so o evento, o valor e o tipo de exame. O `client_id` vem do
 * cookie _ga lido no navegador; sem ele o GA4 nao consegue costurar o evento a
 * sessao e o registro vira um usuario solto, entao preferimos nao enviar.
 */
async function sendToGA4(lead: LeadConversion): Promise<"sent" | "skipped" | "failed"> {
  if (!lead.consent.analytics) return "skipped";
  const measurementId = ENV.ga4MeasurementId;
  const apiSecret = ENV.ga4ApiSecret;
  if (!measurementId || !apiSecret || !lead.clientId) return "skipped";

  const payload = {
    client_id: lead.clientId,
    events: [
      {
        // Mesmo nome do evento que o GTM ja distribui (o briefing de 02/08
        // aposentou generate_lead). O event_id deduplica contra o navegador.
        name: "whatsapp_click",
        params: {
          event_id: lead.eventId,
          event_category: "conversion",
          lead_source: "formulario_qualificacao",
          ...(lead.examType ? { exam_type: lead.examType } : {}),
          currency: "BRL",
          ...(lead.value ? { value: lead.value } : {}),
          page_location: lead.page,
          // Exigido pelo MP para a sessao nao ser contada como nova.
          engagement_time_msec: 100,
        },
      },
    ],
  };

  try {
    const res = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(measurementId)}&api_secret=${encodeURIComponent(apiSecret)}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      }
    );
    // O MP responde 204 mesmo para payload invalido; erro aqui e de rede.
    if (!res.ok && res.status !== 204) {
      console.warn(`[Conversions] GA4 MP respondeu ${res.status}`);
      return "failed";
    }
    return "sent";
  } catch (e) {
    console.warn("[Conversions] GA4 MP falhou:", e instanceof Error ? e.message : "erro desconhecido");
    return "failed";
  }
}

export type DispatchResult = {
  meta: "sent" | "skipped" | "failed";
  ga4: "sent" | "skipped" | "failed";
};

/**
 * Dispara o lead para as plataformas externas. Nunca lanca: o chamador
 * (lead.create) ja gravou no banco e nao pode falhar por causa disto.
 *
 * As duas chamadas correm em paralelo — juntas nao passam do timeout de 5s.
 */
export async function dispatchLeadConversion(lead: LeadConversion): Promise<DispatchResult> {
  const [meta, ga4] = await Promise.all([sendToMeta(lead), sendToGA4(lead)]);
  return { meta, ga4 };
}

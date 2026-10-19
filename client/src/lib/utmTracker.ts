/**
 * UTM Tracker — Captura, persiste e normaliza parâmetros UTM.
 * Detecta automaticamente o canal de origem (Facebook, Instagram, Google, TikTok, etc.)
 * Persiste UTMs no sessionStorage para atribuição ao longo da sessão.
 */

export interface UTMParams {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  /** Identificadores de clique do Google Ads. Ver getAdClickIds(). */
  gclid: string | null;
  gbraid: string | null;
  wbraid: string | null;
  /** ValueTrack, quando o modelo de acompanhamento da conta os envia. */
  keyword: string | null;
  campaignId: string | null;
  adGroupId: string | null;
  matchType: string | null;
  device: string | null;
  network: string | null;
  creative: string | null;
  channel: string;
  referrer: string;
  landingPage: string;
}

/**
 * Parametros cuja presenca na URL significa "isto e uma chegada nova".
 *
 * A lista inclui os identificadores de clique pago porque um anuncio pode
 * mandar gclid sem mandar UTM nenhum — e essa chegada precisa sobrescrever a
 * anterior do mesmo jeito.
 */
const PARAMS_DE_CHEGADA = [
  "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
  "gclid", "gbraid", "wbraid",
] as const;

const UTM_STORAGE_KEY = "tq_utm_params";

/**
 * Normaliza o canal com base em utm_source, utm_medium e referrer.
 */
export function detectChannel(
  utmSource: string | null,
  utmMedium: string | null,
  referrer: string
): string {
  const src = (utmSource || "").toLowerCase();
  const med = (utmMedium || "").toLowerCase();
  const ref = referrer.toLowerCase();

  // Facebook / Meta
  if (src.includes("facebook") || src.includes("fb") || src.includes("meta")) {
    if (med === "cpc" || med === "cpm" || med === "paid" || med.includes("ad")) return "Facebook Ads";
    return "Facebook Orgânico";
  }
  if (ref.includes("facebook.com") || ref.includes("fb.com") || ref.includes("l.facebook.com") || ref.includes("lm.facebook.com")) {
    return "Facebook Orgânico";
  }

  // Instagram
  if (src.includes("instagram") || src.includes("ig")) {
    if (med === "cpc" || med === "cpm" || med === "paid" || med.includes("ad")) return "Instagram Ads";
    return "Instagram Orgânico";
  }
  if (ref.includes("instagram.com") || ref.includes("l.instagram.com")) {
    return "Instagram Orgânico";
  }

  // Google
  if (src.includes("google")) {
    if (med === "cpc" || med === "ppc" || med.includes("ad") || med === "cpm") return "Google Ads";
    if (med === "organic" || med === "") return "Google Orgânico";
    return "Google Outros";
  }
  if (ref.includes("google.com") || ref.includes("google.com.br")) {
    return "Google Orgânico";
  }

  // TikTok
  if (src.includes("tiktok") || src.includes("tt")) {
    if (med === "cpc" || med === "cpm" || med === "paid" || med.includes("ad")) return "TikTok Ads";
    return "TikTok Orgânico";
  }
  if (ref.includes("tiktok.com")) {
    return "TikTok Orgânico";
  }

  // YouTube
  if (src.includes("youtube") || src.includes("yt")) {
    if (med === "cpc" || med === "cpm" || med.includes("ad")) return "YouTube Ads";
    return "YouTube Orgânico";
  }
  if (ref.includes("youtube.com") || ref.includes("youtu.be")) {
    return "YouTube Orgânico";
  }

  // LinkedIn
  if (src.includes("linkedin") || ref.includes("linkedin.com")) {
    if (med === "cpc" || med.includes("ad")) return "LinkedIn Ads";
    return "LinkedIn Orgânico";
  }

  // Twitter/X
  if (src.includes("twitter") || src.includes("x.com") || ref.includes("twitter.com") || ref.includes("t.co") || ref.includes("x.com")) {
    return "Twitter/X";
  }

  // Email
  if (med === "email" || src.includes("email") || src.includes("newsletter") || src.includes("mailchimp")) {
    return "Email Marketing";
  }

  // WhatsApp
  if (src.includes("whatsapp") || ref.includes("whatsapp") || ref.includes("wa.me")) {
    return "WhatsApp";
  }

  // Bing
  if (src.includes("bing") || ref.includes("bing.com")) {
    if (med === "cpc") return "Bing Ads";
    return "Bing Orgânico";
  }

  // Paid genérico
  if (med === "cpc" || med === "cpm" || med === "paid" || med.includes("ad")) {
    return "Mídia Paga (Outros)";
  }

  // Social genérico
  if (med === "social" || med === "referral") {
    return "Social (Outros)";
  }

  // Referral
  if (ref && ref !== "" && !ref.includes(window.location.hostname)) {
    return "Referência";
  }

  // Direto
  return "Acesso Direto";
}

/**
 * Captura UTM params da URL e persiste no sessionStorage.
 * Deve ser chamado uma vez no carregamento da página.
 */
export function captureUTMParams(): UTMParams {
  const params = new URLSearchParams(window.location.search);
  const referrer = document.referrer || "";
  const landingPage = window.location.pathname;

  const guardado = getStoredUTMParams();
  const chegadaNova = PARAMS_DE_CHEGADA.some((p) => (params.get(p) || "") !== "");

  /*
   * Ate 22/09/2026 esta funcao devolvia o que estava guardado ANTES de olhar a
   * URL. Efeito: o utm_term da primeira pagina da sessao grudava em tudo o que
   * viesse depois — por isso `pesquisa-pediatra-cardiologista` aparecia em lead
   * de ultrassom, mamografia, raio-x e toxicologico na planilha. Pior: quem
   * chegava organico e depois clicava num anuncio tinha o clique pago
   * atribuido ao organico.
   *
   * Agora vale a ultima chegada com parametro de campanha, que e como o Google
   * Ads e o GA4 atribuem. Navegacao dentro do site nao traz esses parametros e
   * portanto nao sobrescreve nada — o dado da campanha sobrevive ate o fim da
   * sessao, que era a unica coisa que o comportamento antigo acertava.
   */
  if (guardado && !chegadaNova) return guardado;

  const utmSource = params.get("utm_source");
  const utmMedium = params.get("utm_medium");
  const utmCampaign = params.get("utm_campaign");
  const utmTerm = params.get("utm_term");
  const utmContent = params.get("utm_content");

  // Detectar canal automaticamente
  const channel = detectChannel(utmSource, utmMedium, referrer);

  const utmData: UTMParams = {
    utmSource,
    utmMedium,
    utmCampaign,
    utmTerm,
    utmContent,
    gclid: params.get("gclid"),
    gbraid: params.get("gbraid"),
    wbraid: params.get("wbraid"),
    keyword: params.get("keyword"),
    campaignId: params.get("campaignid"),
    adGroupId: params.get("adgroupid"),
    matchType: params.get("matchtype"),
    device: params.get("device"),
    network: params.get("network"),
    creative: params.get("creative"),
    channel,
    referrer,
    landingPage,
  };

  // Persistir na sessão
  try {
    sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utmData));
  } catch {
    // Aba anonima ou storage bloqueado: seguir sem persistir.
  }

  return utmData;
}

/**
 * Identificadores do clique pago, para o beacon do ADS-01.
 *
 * Fica separado de getUTMForAPI de proposito: aquele alimenta o formulario de
 * lead, cujo schema no servidor nao aceita estes campos. Misturar os dois faria
 * o lead ser rejeitado com HTTP 400 — ou seja, medicao quebrada derrubando
 * atendimento, que e exatamente o que nao pode acontecer.
 */
export function getAdClickIds(): Record<string, string | null> {
  const utm = getStoredUTMParams();
  if (!utm) return {};
  return {
    gclid: utm.gclid ?? null,
    gbraid: utm.gbraid ?? null,
    wbraid: utm.wbraid ?? null,
    keyword: utm.keyword ?? null,
    campaignid: utm.campaignId ?? null,
    adgroupid: utm.adGroupId ?? null,
    matchtype: utm.matchType ?? null,
    device: utm.device ?? null,
    network: utm.network ?? null,
    creative: utm.creative ?? null,
    utm_source: utm.utmSource ?? null,
    utm_medium: utm.utmMedium ?? null,
    utm_campaign: utm.utmCampaign ?? null,
    utm_term: utm.utmTerm ?? null,
    utm_content: utm.utmContent ?? null,
    landing_url: utm.landingPage ?? null,
  };
}

/**
 * Recupera os UTM params salvos na sessão.
 */
export function getStoredUTMParams(): UTMParams | null {
  const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as UTMParams;
  } catch {
    return null;
  }
}

/**
 * Retorna os UTM params para enviar nas APIs.
 */
export function getUTMForAPI(): Record<string, string | undefined> {
  const utm = getStoredUTMParams();
  if (!utm) return {};
  return {
    utmSource: utm.utmSource || undefined,
    utmMedium: utm.utmMedium || undefined,
    utmCampaign: utm.utmCampaign || undefined,
    utmTerm: utm.utmTerm || undefined,
    utmContent: utm.utmContent || undefined,
    channel: utm.channel || undefined,
    referrer: utm.referrer || undefined,
  };
}

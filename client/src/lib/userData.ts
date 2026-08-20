/*
 * Conversoes aprimoradas (enhanced conversions) do Google Ads.
 *
 * O Google casa a conversao com o clique no anuncio usando e-mail e telefone.
 * Aqui eles saem do navegador JA NORMALIZADOS E COM HASH SHA-256 — texto puro
 * nunca entra no dataLayer, nunca vai para o GTM e nunca chega ao Google.
 *
 * Contexto de saude: a clinica e um laboratorio de analises clinicas. Contato
 * somado ao exame procurado e dado sensivel (art. 11 da LGPD). Por isso o
 * user_data so e montado quando o visitante concedeu consentimento de
 * marketing no banner (ad_user_data = granted); com "Somente essenciais" a
 * conversao continua sendo enviada, so que sem identificacao.
 *
 * Nunca combinar user_data com exam_type num mesmo destino que permita
 * reidentificacao: o exam_type viaja no evento para segmentacao interna, o
 * user_data serve apenas para casar o clique — nao criar publico a partir dos
 * dois juntos.
 */
const CONSENT_KEY = "tq-consent";

export type UserData = {
  sha256_email_address?: string;
  sha256_phone_number?: string;
};

/** O visitante aceitou cookies de marketing no banner? */
export function marketingConsentGranted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(CONSENT_KEY) === "granted";
  } catch {
    return false;
  }
}

/**
 * Normaliza e-mail no padrao do Google: sem espacos, minusculo e, em contas
 * gmail/googlemail, sem os pontos da parte local (a.b@gmail = ab@gmail).
 */
function normalizeEmail(bruto: string): string | null {
  const email = bruto.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  const [local, dominio] = email.split("@");
  if (dominio === "gmail.com" || dominio === "googlemail.com") {
    return `${local.replace(/\./g, "")}@${dominio}`;
  }
  return email;
}

/**
 * Normaliza telefone para E.164 assumindo Brasil quando o DDI nao vem escrito:
 * "(12) 98888-7777" vira "+5512988887777".
 */
function normalizePhoneBR(bruto: string): string | null {
  const digitos = bruto.replace(/\D/g, "").replace(/^0+/, "");
  if (digitos.length < 10) return null; // sem DDD nao da para montar E.164
  const comPais = digitos.startsWith("55") && digitos.length >= 12 ? digitos : `55${digitos}`;
  if (comPais.length < 12 || comPais.length > 13) return null;
  return `+${comPais}`;
}

/** SHA-256 em hexadecimal minusculo, formato exigido pelo Google. */
async function sha256Hex(valor: string): Promise<string> {
  const bytes = new TextEncoder().encode(valor);
  const digest = await window.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Monta o user_data com hash. Devolve null — e a conversao segue sem
 * identificacao — quando falta consentimento de marketing, quando o navegador
 * nao expoe Web Crypto (contexto inseguro) ou quando nenhum dos dois campos e
 * valido.
 */
export async function buildUserData(contato: {
  email?: string;
  telefone?: string;
}): Promise<UserData | null> {
  if (typeof window === "undefined") return null;
  if (!marketingConsentGranted()) return null;
  if (!window.crypto?.subtle) return null;

  const email = contato.email ? normalizeEmail(contato.email) : null;
  const telefone = contato.telefone ? normalizePhoneBR(contato.telefone) : null;
  if (!email && !telefone) return null;

  try {
    const [hashEmail, hashTelefone] = await Promise.all([
      email ? sha256Hex(email) : Promise.resolve(null),
      telefone ? sha256Hex(telefone) : Promise.resolve(null),
    ]);
    const userData: UserData = {};
    if (hashEmail) userData.sha256_email_address = hashEmail;
    if (hashTelefone) userData.sha256_phone_number = hashTelefone;
    return Object.keys(userData).length > 0 ? userData : null;
  } catch {
    return null;
  }
}

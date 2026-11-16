import { ENV } from "./env";

export type LeadForSheet = {
  source: string;
  page: string;
  referrer?: string;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  channel?: string;
  sessionId?: string;
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  examType?: string;
  eventId?: string;
  value?: number;
};

/**
 * Envia o lead para a planilha Google Sheets (webhook do Apps Script).
 * Devolve se o destino aceitou o envio. Nunca registra o payload ou a URL.
 * Nao repete POST automaticamente: um timeout pode ocorrer depois da gravacao.
 */
export async function syncLeadToSheet(lead: LeadForSheet): Promise<boolean> {
  const url = ENV.googleSheetsWebhookUrl;
  if (!url) return false;

  try {
    // O Apps Script sempre responde com um redirect 302 para
    // script.googleusercontent.com para entregar o corpo da resposta.
    // O appendRow ja aconteceu antes desse redirect, entao nao seguimos
    // (redirect: "manual") — seguir esse segundo salto se mostrou
    // pouco confiavel dependendo da rede de saida do servidor.
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(lead),
      redirect: "manual",
      signal: AbortSignal.timeout(15000),
    });

    if (response.status === 302 || response.status === 303) {
      // Redirecionamento para login nao comprova gravacao no Apps Script.
      const location = response.headers.get("location");
      if (!location) return false;
      const redirect = new URL(location, url);
      return redirect.protocol === "https:" && redirect.hostname === "script.googleusercontent.com";
    }
    if (!response.ok) {
      console.warn(`[GoogleSheets] Falha ao sincronizar lead (${response.status})`);
      return false;
    }
    // Apps Script tambem pode retornar HTTP 200 com um erro no corpo.
    const result = await response.json();
    return (result.success === true || result.ok === true) && !result.error;
  } catch {
    console.warn("[GoogleSheets] Falha de transporte ou resposta invalida");
    return false;
  }
}

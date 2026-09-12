import { ENV } from "./env";

type LeadForSheet = {
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
};

/**
 * Envia o lead para a planilha Google Sheets (webhook do Apps Script).
 * Nunca lança erro: uma falha aqui não pode impedir a criação do lead
 * nem a notificação por e-mail, que já acontecem antes desta chamada.
 */
export async function syncLeadToSheet(lead: LeadForSheet): Promise<void> {
  const url = ENV.googleSheetsWebhookUrl;
  if (!url) return;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(lead),
    });

    if (!response.ok) {
      console.warn(`[GoogleSheets] Falha ao sincronizar lead (${response.status})`);
    }
  } catch (error) {
    console.warn("[GoogleSheets] Erro ao sincronizar lead:", error);
  }
}

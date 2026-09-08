import { randomUUID } from "node:crypto";
import { ENV } from "./_core/env";

export type OrganicLeadInput = {
  eventId?: string;
  source: string;
  conversionType?: "whatsapp_click" | "form_submit" | "phone_click" | "cta_click";
  name?: string;
  phone?: string;
  email?: string;
  channel?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  landingPage?: string;
  page: string;
};

const SEARCH_ENGINES: Array<[string, string]> = [
  ["google", "Google Orgânico"],
  ["bing", "Bing Orgânico"],
  ["yahoo", "Yahoo Orgânico"],
  ["duckduckgo", "DuckDuckGo Orgânico"],
  ["ecosia", "Ecosia Orgânico"],
];

function normalize(value?: string): string {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/** Resolve apenas busca orgânica. Social orgânico fica fora desta planilha. */
export function resolveOrganicSearchChannel(input: Pick<OrganicLeadInput, "channel" | "referrer" | "utmSource" | "utmMedium">): string | null {
  const medium = normalize(input.utmMedium);
  if (["cpc", "ppc", "cpm", "paid", "paidsearch"].includes(medium) || medium.includes("ad")) {
    return null;
  }

  const channel = normalize(input.channel);
  const source = normalize(input.utmSource);
  const referrer = normalize(input.referrer);

  if (channel.includes("ads") || channel.includes("pago") || channel.includes("paid")) {
    return null;
  }

  for (const [engine, label] of SEARCH_ENGINES) {
    if (
      (channel.includes(engine) && channel.includes("organico")) ||
      source.includes(engine) ||
      referrer.includes(`${engine}.`)
    ) {
      return label;
    }
  }

  return null;
}

function conversionLabel(type?: OrganicLeadInput["conversionType"]): string {
  if (type === "form_submit") return "Lead identificado";
  if (type === "phone_click") return "Clique no telefone";
  if (type === "whatsapp_click") return "Clique no WhatsApp";
  return "Clique em CTA";
}

export async function syncOrganicLeadToSheet(input: OrganicLeadInput): Promise<"sent" | "skipped" | "disabled"> {
  const channel = resolveOrganicSearchChannel(input);
  if (!channel) return "skipped";

  if (!ENV.organicLeadsSheetWebhookUrl || !ENV.organicLeadsSheetSecret) {
    return "disabled";
  }

  const response = await fetch(ENV.organicLeadsSheetWebhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    redirect: "follow",
    signal: AbortSignal.timeout(8_000),
    body: JSON.stringify({
      secret: ENV.organicLeadsSheetSecret,
      eventId: input.eventId || randomUUID(),
      occurredAt: new Date().toISOString(),
      name: input.name || "",
      phone: input.phone || "",
      email: input.email || "",
      type: conversionLabel(input.conversionType),
      channel,
      buttonSource: input.source,
      landingPage: input.landingPage || input.page,
      conversionPage: input.page,
      campaign: input.utmCampaign || "",
      status: "Novo",
    }),
  });

  if (!response.ok) {
    throw new Error(`Google Sheets respondeu HTTP ${response.status}`);
  }

  const result = await response.json().catch(() => null) as { ok?: boolean; error?: string } | null;
  if (!result?.ok) {
    throw new Error(result?.error || "Resposta inválida do Google Sheets");
  }

  return "sent";
}

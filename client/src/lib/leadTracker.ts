import { getUTMForAPI } from "@/lib/utmTracker";

export type LeadConversionType = "whatsapp_click" | "form_submit" | "phone_click" | "cta_click";

export function getTrackingSessionId(): string {
  const key = "tq_session_id";
  let sessionId = sessionStorage.getItem(key);
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem(key, sessionId);
  }
  return sessionId;
}

function getLeadEventId(conversionType: string): string {
  const key = `tq_lead_event_${conversionType}`;
  const stored = sessionStorage.getItem(key);
  if (stored) return stored;

  const eventId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  sessionStorage.setItem(key, eventId);
  return eventId;
}

export async function trackLeadDirect(
  source: string,
  extraData?: { name?: string; phone?: string; email?: string },
  conversionType?: LeadConversionType
) {
  try {
    const sessionId = getTrackingSessionId();
    const utm = getUTMForAPI();
    const resolvedConversionType = conversionType || (source.includes("whatsapp") ? "whatsapp_click" : source.includes("form") ? "form_submit" : "cta_click");
    const eventId = getLeadEventId(resolvedConversionType);

    await fetch("/api/trpc/lead.create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      keepalive: true,
      body: JSON.stringify({
        json: {
          source,
          page: window.location.pathname,
          referrer: document.referrer || undefined,
          sessionId,
          conversionType: resolvedConversionType,
          eventId,
          ...utm,
          ...extraData,
        },
      }),
    });

    await fetch("/api/trpc/conversion.track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      keepalive: true,
      body: JSON.stringify({
        json: {
          sessionId,
          conversionType: resolvedConversionType,
          page: window.location.pathname,
          ...utm,
        },
      }),
    });
  } catch {
    // Medição e planilha nunca podem interromper o clique do visitante.
  }
}

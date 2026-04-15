/**
 * Hook para rastrear eventos de analytics e leads via tRPC API.
 * Persiste dados no banco de dados além do GTM/dataLayer.
 * Inclui UTM params para atribuição de canais/campanhas.
 */
import { trpc } from "@/lib/trpc";
import { useCallback, useRef } from "react";
import { getUTMForAPI } from "@/lib/utmTracker";

// Gerar ou recuperar sessionId do sessionStorage
function getSessionId(): string {
  const key = "tq_session_id";
  let sessionId = sessionStorage.getItem(key);
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem(key, sessionId);
  }
  return sessionId;
}

export function useAnalyticsTracker() {
  const trackMutation = trpc.analytics.track.useMutation();
  const leadMutation = trpc.lead.create.useMutation();
  const blogViewMutation = trpc.blog.trackView.useMutation();
  const conversionMutation = trpc.conversion.track.useMutation();
  const sessionId = useRef(getSessionId());

  const trackEvent = useCallback(
    (eventName: string, eventCategory?: string, eventData?: Record<string, unknown>) => {
      trackMutation.mutate({
        eventName,
        eventCategory,
        eventData: eventData ?? null,
        page: window.location.pathname,
        sessionId: sessionId.current,
      });
    },
    [trackMutation]
  );

  const trackLead = useCallback(
    (source: string, extraData?: { name?: string; phone?: string; email?: string }) => {
      const utm = getUTMForAPI();
      leadMutation.mutate({
        source,
        page: window.location.pathname,
        referrer: document.referrer || undefined,
        sessionId: sessionId.current,
        ...utm,
        ...extraData,
      });
      // Also track as conversion
      conversionMutation.mutate({
        sessionId: sessionId.current,
        conversionType: source.includes("whatsapp") ? "whatsapp_click" : source.includes("form") ? "form_submit" : "cta_click",
        page: window.location.pathname,
        ...utm,
      });
    },
    [leadMutation, conversionMutation]
  );

  const trackBlogView = useCallback(
    (slug: string) => {
      blogViewMutation.mutate({
        slug,
        sessionId: sessionId.current,
      });
    },
    [blogViewMutation]
  );

  return { trackEvent, trackLead, trackBlogView };
}

/**
 * Standalone function para uso fora de componentes React.
 * Faz POST direto para a API tRPC.
 */
export async function trackEventDirect(
  eventName: string,
  eventCategory?: string,
  eventData?: Record<string, unknown>
) {
  try {
    const sessionId = getSessionId();
    await fetch("/api/trpc/analytics.track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        json: {
          eventName,
          eventCategory,
          eventData: eventData ?? null,
          page: window.location.pathname,
          sessionId,
        },
      }),
    });
  } catch {
    // Silently fail - analytics should not break the app
  }
}

export async function trackLeadDirect(source: string, extraData?: { name?: string; phone?: string; email?: string }) {
  try {
    const sessionId = getSessionId();
    const utm = getUTMForAPI();
    await fetch("/api/trpc/lead.create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        json: {
          source,
          page: window.location.pathname,
          referrer: document.referrer || undefined,
          sessionId,
          ...utm,
          ...extraData,
        },
      }),
    });
    // Also track conversion
    await fetch("/api/trpc/conversion.track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        json: {
          sessionId,
          conversionType: source.includes("whatsapp") ? "whatsapp_click" : source.includes("form") ? "form_submit" : "cta_click",
          page: window.location.pathname,
          ...utm,
        },
      }),
    });
  } catch {
    // Silently fail
  }
}

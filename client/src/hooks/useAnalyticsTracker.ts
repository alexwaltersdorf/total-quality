/**
 * Hook para rastrear eventos de analytics e leads via tRPC API.
 * Persiste dados no banco de dados além do GTM/dataLayer.
 * Inclui UTM params para atribuição de canais/campanhas.
 */
import { trpc } from "@/lib/trpc";
import { useCallback, useRef } from "react";
import { getUTMForAPI } from "@/lib/utmTracker";
import { getTrackingSessionId } from "@/lib/leadTracker";

export { trackLeadDirect } from "@/lib/leadTracker";

export function useAnalyticsTracker() {
  const trackMutation = trpc.analytics.track.useMutation();
  const leadMutation = trpc.lead.create.useMutation();
  const blogViewMutation = trpc.blog.trackView.useMutation();
  const conversionMutation = trpc.conversion.track.useMutation();
  const sessionId = useRef(getTrackingSessionId());

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
    const sessionId = getTrackingSessionId();
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

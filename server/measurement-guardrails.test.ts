import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function source(path: string): string {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

describe("guardrails de mensuracao", () => {
  it("nao substitui o push instalado pelo GTM", () => {
    const store = source("client/src/lib/analyticsStore.ts");
    expect(store).not.toMatch(/dataLayer\.push\s*=/);
    expect(store).not.toContain("Array.prototype.push");
  });

  it("captura localmente e depois entrega o evento ao GTM", () => {
    const tracking = source("client/src/lib/tracking.ts");
    const capture = tracking.indexOf("captureAnalyticsEvent(payload)");
    const push = tracking.indexOf("window.dataLayer.push(payload)");
    expect(capture).toBeGreaterThan(-1);
    expect(push).toBeGreaterThan(capture);
  });

  it("monitoramento nao usa metricas simuladas", () => {
    const monitoring = source("server/_core/monitoring.ts");
    expect(monitoring).not.toMatch(/campaignSpend|campaignROAS|metricas simuladas/i);
    expect(monitoring).toContain("getSessionsCount");
  });

  it("falha da API do GA4 nao e convertida em zeros", () => {
    const ga4 = source("server/_core/monitoring-ga4.ts");
    expect(ga4).toContain("throw error");
    expect(ga4).not.toContain("Retornar métricas vazias");
  });
});

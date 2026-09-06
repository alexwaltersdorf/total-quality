import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function source(path: string): string {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

describe("guardrails de mensuracao", () => {
  it("nao substitui o push instalado pelo GTM", () => {
    const tracking = source("client/src/lib/tracking.ts");
    expect(tracking).not.toMatch(/dataLayer\.push\s*=/);
    expect(tracking).not.toContain("Array.prototype.push");
  });

  /*
   * Ate 06/09/2026 esta trava exigia o CONTRARIO: que o evento fosse copiado
   * para localStorage antes de ir ao GTM. A copia alimentava um painel proprio
   * removido em jul/2026 e, ao contrario do resto da medicao, nao passava pelo
   * consentimento — guardava ate 5.000 eventos por visitante com o exame
   * procurado, sem prazo de expiracao. Dado de saude sem consentimento e sem
   * finalidade (LGPD, arts. 6 e 11). A regra mudou; a trava mudou com ela.
   */
  it("nenhum evento e persistido no navegador", () => {
    const tracking = source("client/src/lib/tracking.ts");
    expect(tracking).not.toContain("captureAnalyticsEvent");
    expect(tracking).not.toMatch(/localStorage\.setItem/);
    expect(tracking).not.toMatch(/sessionStorage\.setItem/);
  });

  it("o modulo de captura local nao volta a existir", () => {
    expect(() => source("client/src/lib/analyticsStore.ts")).toThrow();
  });

  /*
   * Sem event_id o Meta recebe o mesmo acontecimento pelo pixel e pela API de
   * Conversoes sem saber que e o mesmo: a conversao conta duas vezes, o
   * relatorio infla e a otimizacao treina em evento que nao existiu.
   */
  it("todo evento leva event_id para o Meta deduplicar", () => {
    const tracking = source("client/src/lib/tracking.ts");
    expect(tracking).toContain("event_id: novoEventId()");
    expect(tracking).toMatch(/crypto\.randomUUID/);
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

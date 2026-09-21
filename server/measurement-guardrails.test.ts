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
   *
   * Ate 20/09/2026 esta trava exigia a string literal `event_id: novoEventId()`.
   * O formulario de qualificacao precisou de algo que aquela forma impedia:
   * CONHECER o id para repassa-lo ao servidor — e a deduplicacao so acontece se
   * as duas pontas mandarem o mesmo valor. A regra nao mudou (todo evento leva
   * event_id); o que mudou foi de onde o valor pode vir.
   */
  it("todo evento leva event_id para o Meta deduplicar", () => {
    const tracking = source("client/src/lib/tracking.ts");
    // O push sempre carrega o campo, e novoEventId() e o padrao quando o
    // chamador nao fornece o seu.
    expect(tracking).toMatch(/event_id:.*novoEventId\(\)/);
    expect(tracking).toMatch(/crypto\.randomUUID/);
  });

  /*
   * O formulario de qualificacao so deduplica se o MESMO id sair do navegador e
   * chegar ao servidor. Se trackLeadQualificado parar de devolver o id, ou se o
   * servidor parar de exigi-lo antes de despachar, cada lead vira duas
   * conversoes no Meta — em silencio, sem erro nenhum.
   */
  it("o id do evento viaja do navegador ate o envio pelo servidor", () => {
    const tracking = source("client/src/lib/tracking.ts");
    expect(tracking).toMatch(/trackLeadQualificado[\s\S]{0,400}Promise<string>/);
    expect(tracking).toMatch(/const eventId = novoEventId\(\)/);

    const contexto = source("client/src/contexts/ContatoLeadContext.tsx");
    expect(contexto).toContain("await trackLeadQualificado(");
    expect(contexto).toContain("eventId,");

    // Sem eventId o servidor nao pode despachar: contar duas vezes e pior que
    // nao contar.
    const routers = source("server/routers.ts");
    expect(routers).toMatch(/if \(eventId\) \{[\s\S]{0,200}dispatchLeadConversion/);
  });

  /*
   * Contato so sai do servidor com hash, e so com consentimento de marketing —
   * a mesma regra do navegador (client/src/lib/userData.ts), aplicada do outro
   * lado. O exam_type nunca acompanha o contato no mesmo destino: o que a
   * pessoa procurou nao pode ser reassociado a ela num sistema de anuncios
   * (LGPD, art. 11).
   */
  it("o envio pelo servidor respeita consentimento e nunca manda contato em texto puro", () => {
    const conversions = source("server/_core/conversions.ts");
    expect(conversions).toContain("createHash");
    expect(conversions).toMatch(/if \(!lead\.consent\.marketing\) return "skipped"/);
    expect(conversions).toMatch(/if \(!lead\.consent\.analytics\) return "skipped"/);

    // Meta: os campos de contato saem exclusivamente por sha256().
    const meta = conversions.slice(
      conversions.indexOf("async function sendToMeta"),
      conversions.indexOf("async function sendToGA4")
    );
    expect(meta).toMatch(/userData\.em = \[sha256\(/);
    expect(meta).toMatch(/userData\.ph = \[sha256\(/);
    expect(meta).toMatch(/userData\.fn = \[sha256\(/);
    expect(meta).not.toMatch(/em: *email\b|ph: *phone\b/);
    // O destino que leva contato nao leva exam_type.
    expect(meta).not.toContain("examType");
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

import { describe, expect, it } from "vitest";
import { resolveOrganicSearchChannel, syncOrganicLeadToSheet } from "./organicLeadsSheet";

describe("resolveOrganicSearchChannel", () => {
  it("aceita Google orgânico informado pelo canal", () => {
    expect(resolveOrganicSearchChannel({ channel: "Google Orgânico" })).toBe("Google Orgânico");
  });

  it("detecta Bing orgânico pelo referenciador", () => {
    expect(resolveOrganicSearchChannel({ referrer: "https://www.bing.com/search?q=exame" })).toBe("Bing Orgânico");
  });

  it("não classifica mídia paga como orgânica", () => {
    expect(resolveOrganicSearchChannel({
      channel: "Google Ads",
      utmSource: "google",
      utmMedium: "cpc",
    })).toBeNull();
  });

  it("não usa o referrer do Google para sobrescrever um canal de Ads", () => {
    expect(resolveOrganicSearchChannel({
      channel: "Google Ads",
      referrer: "https://www.google.com/",
    })).toBeNull();
  });

  it("mantém social orgânico fora da planilha de SEO", () => {
    expect(resolveOrganicSearchChannel({ channel: "Instagram Orgânico" })).toBeNull();
  });
});

describe("syncOrganicLeadToSheet", () => {
  it("não chama integração quando a origem não é busca orgânica", async () => {
    await expect(syncOrganicLeadToSheet({
      source: "hero_cta",
      conversionType: "whatsapp_click",
      channel: "Acesso Direto",
      page: "/",
    })).resolves.toBe("skipped");
  });
});

import { describe, expect, it } from "vitest";
import { detectChannel } from "../client/src/lib/utmTracker";

describe("detectChannel", () => {
  it("prioriza o identificador automático do Google Ads", () => {
    expect(detectChannel(null, null, "https://www.google.com/", "google")).toBe("Google Ads");
  });

  it("prioriza o identificador automático do Bing Ads", () => {
    expect(detectChannel(null, null, "https://www.bing.com/", "bing")).toBe("Bing Ads");
  });

  it("mantém uma busca do Google sem identificador pago como orgânica", () => {
    expect(detectChannel(null, null, "https://www.google.com/")).toBe("Google Orgânico");
  });
});

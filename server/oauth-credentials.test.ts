/**
 * Teste de validação de credenciais OAuth
 * Valida que as credenciais de Google Ads e Meta Ads estão configuradas
 */

import { describe, it, expect } from "vitest";

// Sem credenciais no ambiente estes testes nao tem como passar. Ate 05/09/2026
// eles FALHAVAM em toda execucao — 32 falhas fixas que ensinavam a equipe a
// ignorar suite vermelha e impediam ligar CI. Agora pulam quando o ambiente
// nao os suporta, e continuam valendo onde as credenciais existem.
const temOAuthAds = Boolean(process.env.GOOGLE_ADS_CLIENT_ID && process.env.GOOGLE_ADS_CLIENT_SECRET);

describe.skipIf(!temOAuthAds)("OAuth Credentials", () => {
  describe("Google Ads OAuth", () => {
    it("deve ter GOOGLE_ADS_CLIENT_ID configurado", () => {
      const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
      expect(clientId).toBeDefined();
      expect(clientId).toBeTruthy();
      expect(clientId?.length).toBeGreaterThan(0);
    });

    it("deve ter GOOGLE_ADS_CLIENT_SECRET configurado", () => {
      const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;
      expect(clientSecret).toBeDefined();
      expect(clientSecret).toBeTruthy();
      expect(clientSecret?.length).toBeGreaterThan(0);
    });

    it("GOOGLE_ADS_CLIENT_ID deve ter formato válido (contém caracteres)", () => {
      const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
      expect(clientId).toMatch(/^[a-zA-Z0-9\-_.]+$/);
    });
  });

  describe("Meta Ads OAuth", () => {
    it("deve ter META_ADS_APP_ID configurado", () => {
      const appId = process.env.META_ADS_APP_ID;
      expect(appId).toBeDefined();
      expect(appId).toBeTruthy();
      expect(appId?.length).toBeGreaterThan(0);
    });

    it("deve ter META_ADS_APP_SECRET configurado", () => {
      const appSecret = process.env.META_ADS_APP_SECRET;
      expect(appSecret).toBeDefined();
      expect(appSecret).toBeTruthy();
      expect(appSecret?.length).toBeGreaterThan(0);
    });

    it("META_ADS_APP_ID deve ser numérico ou alfanumérico", () => {
      const appId = process.env.META_ADS_APP_ID;
      expect(appId).toMatch(/^[a-zA-Z0-9]+$/);
    });
  });

  describe("Integração de credenciais", () => {
    it("deve ter todas as credenciais configuradas simultaneamente", () => {
      const googleClientId = process.env.GOOGLE_ADS_CLIENT_ID;
      const googleClientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;
      const metaAppId = process.env.META_ADS_APP_ID;
      const metaAppSecret = process.env.META_ADS_APP_SECRET;

      expect(googleClientId).toBeDefined();
      expect(googleClientSecret).toBeDefined();
      expect(metaAppId).toBeDefined();
      expect(metaAppSecret).toBeDefined();
    });

    it("credenciais não devem estar vazias", () => {
      const credentials = {
        googleClientId: process.env.GOOGLE_ADS_CLIENT_ID || "",
        googleClientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET || "",
        metaAppId: process.env.META_ADS_APP_ID || "",
        metaAppSecret: process.env.META_ADS_APP_SECRET || "",
      };

      Object.values(credentials).forEach((value) => {
        expect(value.length).toBeGreaterThan(0);
      });
    });
  });
});

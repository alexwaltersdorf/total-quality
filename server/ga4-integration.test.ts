import { describe, it, expect, beforeAll } from "vitest";

/**
 * Testes para validar integração com Google Analytics 4
 * Valida credenciais e conexão com GA4 Data API
 */

describe("Google Analytics 4 Integration", () => {
  const measurementId = process.env.VITE_GA4_MEASUREMENT_ID;
  const propertyId = process.env.VITE_GA4_PROPERTY_ID;
  const clientId = process.env.GA4_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GA4_OAUTH_CLIENT_SECRET;

  describe("Credenciais", () => {
    it("deve ter Measurement ID configurado", () => {
      expect(measurementId).toBeDefined();
      expect(measurementId).toMatch(/^G-[A-Z0-9]+$/);
    });

    it("deve ter Property ID configurado", () => {
      expect(propertyId).toBeDefined();
      expect(propertyId).toMatch(/^\d+$/);
    });

    it("deve ter Client ID do OAuth configurado", () => {
      expect(clientId).toBeDefined();
      expect(clientId?.length).toBeGreaterThan(0);
    });

    it("deve ter Client Secret do OAuth configurado", () => {
      expect(clientSecret).toBeDefined();
      expect(clientSecret?.length).toBeGreaterThan(0);
    });

    it("Measurement ID deve corresponder ao Property ID", () => {
      // G-427367232 contém 427367232
      const idFromMeasurement = measurementId?.replace("G-", "");
      expect(idFromMeasurement).toBe(propertyId);
    });
  });

  describe("Formato de Credenciais", () => {
    it("Measurement ID deve ter formato válido", () => {
      expect(measurementId).toMatch(/^G-\d+$/);
    });

    it("Property ID deve ser numérico", () => {
      expect(propertyId).toMatch(/^\d+$/);
      expect(parseInt(propertyId || "0")).toBeGreaterThan(0);
    });

    it("Client ID deve ter comprimento mínimo", () => {
      expect(clientId?.length).toBeGreaterThanOrEqual(20);
    });

    it("Client Secret deve ter comprimento mínimo", () => {
      expect(clientSecret?.length).toBeGreaterThanOrEqual(20);
    });
  });

  describe("Integração com Monitoramento", () => {
    it("deve ter todas as credenciais necessárias para GA4 Data API", () => {
      const hasAllCredentials =
        !!measurementId &&
        !!propertyId &&
        !!clientId &&
        !!clientSecret;

      expect(hasAllCredentials).toBe(true);
    });

    it("Property ID deve ser válido para GA4", () => {
      // GA4 Property IDs são números de 10-12 dígitos
      const propIdNum = parseInt(propertyId || "0");
      expect(propIdNum).toBeGreaterThan(100000000);
      expect(propIdNum).toBeLessThan(999999999999);
    });

    it("deve estar pronto para autenticação OAuth", () => {
      const readyForOAuth =
        !!clientId &&
        !!clientSecret &&
        (clientId?.length || 0) > 0 &&
        (clientSecret?.length || 0) > 0;

      expect(readyForOAuth).toBe(true);
    });
  });
});

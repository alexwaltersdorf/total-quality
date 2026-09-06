/**
 * Teste do Webhook do AutoSEO
 * Valida a autenticação com Bearer Token e processamento de artigos
 */

import { describe, it, expect } from "vitest";
import { validateWebhookToken, processAutoSeoWebhook } from "./_core/autoseoWebhook";

// O valor do token NAO entra neste arquivo. Ate 05/09/2026 ele estava fixado
// aqui como literal, num repositorio publico — qualquer pessoa podia ler e
// publicar artigos no site. O teste valida o MECANISMO de autenticacao, nunca
// o segredo; sem AUTOSEO_WEBHOOK_TOKEN no ambiente, a suite pula.
const validToken = process.env.AUTOSEO_WEBHOOK_TOKEN;

describe.skipIf(!validToken)("AutoSEO Webhook", () => {

  describe("validateWebhookToken", () => {
    it("deve aceitar token válido com formato Bearer", () => {
      const authHeader = `Bearer ${validToken}`;
      const isValid = validateWebhookToken(authHeader);
      expect(isValid).toBe(true);
    });

    it("deve rejeitar token inválido", () => {
      const authHeader = "Bearer invalid_token_123";
      const isValid = validateWebhookToken(authHeader);
      expect(isValid).toBe(false);
    });

    it("deve rejeitar header ausente", () => {
      const isValid = validateWebhookToken(undefined);
      expect(isValid).toBe(false);
    });

    it("deve rejeitar formato incorreto (sem Bearer)", () => {
      const authHeader = validToken;
      const isValid = validateWebhookToken(authHeader);
      expect(isValid).toBe(false);
    });

    it("deve rejeitar formato incorreto (múltiplas partes)", () => {
      const authHeader = `Bearer ${validToken} extra`;
      const isValid = validateWebhookToken(authHeader);
      expect(isValid).toBe(false);
    });
  });

  describe("processAutoSeoWebhook", () => {
    it("deve rejeitar payload sem campos obrigatórios", async () => {
      const payload = {
        id: "",
        title: "Test",
        slug: "test",
        content: "Test content",
      };

      const result = await processAutoSeoWebhook(payload);
      expect(result.success).toBe(false);
      expect(result.message).toContain("Payload inválido");
    });

    it("deve aceitar payload válido", async () => {
      const payload = {
        id: "test-article-123",
        title: "Artigo de Teste",
        slug: "artigo-de-teste",
        content: "<p>Conteúdo do artigo de teste</p>",
        excerpt: "Resumo do artigo",
        category: "Saúde",
        status: "published" as const,
      };

      const result = await processAutoSeoWebhook(payload);
      expect(result.success).toBe(true);
      expect(result.message).toContain("sucesso");
      expect(result.articleId).toBeDefined();
    });

    it("deve atualizar artigo existente", async () => {
      // Primeiro, criar um artigo
      const payload1 = {
        id: "test-update-123",
        title: "Artigo Original",
        slug: "artigo-original",
        content: "<p>Conteúdo original</p>",
        excerpt: "Resumo original",
        category: "Saúde",
        status: "published" as const,
      };

      const result1 = await processAutoSeoWebhook(payload1);
      expect(result1.success).toBe(true);

      // Depois, atualizar o mesmo artigo
      const payload2 = {
        id: "test-update-123",
        title: "Artigo Atualizado",
        slug: "artigo-atualizado",
        content: "<p>Conteúdo atualizado</p>",
        excerpt: "Resumo atualizado",
        category: "Saúde",
        status: "published" as const,
      };

      const result2 = await processAutoSeoWebhook(payload2);
      expect(result2.success).toBe(true);
      expect(result2.message).toContain("atualizado");
    });
  });
});

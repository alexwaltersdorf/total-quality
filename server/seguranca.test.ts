import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const ler = (p: string) => readFileSync(resolve(__dirname, "..", p), "utf-8");

/*
 * Travas dos achados da auditoria de 06/09/2026. Cada uma existe porque o
 * problema esteve no ar; o comentario diz qual era o dano, para que ninguem
 * "simplifique" a correcao de volta.
 */
describe("GUARD-RAIL: seguranca do servidor (nao remover)", () => {
  it("nenhum handler devolve rastro de pilha ao chamador", () => {
    const handler = ler("server/_core/monitoring-handler.ts");
    // A autenticacao acontece dentro do mesmo try: devolver stack no catch
    // entregava caminhos de arquivo a quem nem estava autenticado.
    expect(handler).not.toMatch(/stack:\s*error\.stack/);
    expect(handler).not.toMatch(/res\.status\(500\)[\s\S]{0,200}error\.stack/);
  });

  it("o token do webhook e comparado em tempo constante", () => {
    const webhook = ler("server/_core/autoseoWebhook.ts");
    expect(webhook).toContain("timingSafeEqual");
    // Igualdade simples vaza o token byte a byte pelo tempo de resposta.
    expect(webhook).not.toMatch(/token\s*===\s*expectedToken/);
  });

  it("o webhook tem limite de tentativas", () => {
    const index = ler("server/_core/index.ts");
    expect(index).toContain("excedeuLimite");
    expect(index).toContain("429");
  });

  it("os cabecalhos de seguranca estao presentes", () => {
    const index = ler("server/_core/index.ts");
    for (const cabecalho of [
      "X-Content-Type-Options",
      "X-Frame-Options",
      "Referrer-Policy",
      "Permissions-Policy",
      "Strict-Transport-Security",
    ]) {
      expect(index, `cabecalho ${cabecalho}`).toContain(cabecalho);
    }
  });

  it("o Referrer-Policy nao deixa vazar o caminho da URL", () => {
    // URL de exame e dado de saude: o Referer nao pode carregar o caminho
    // para terceiros. "no-referrer-when-downgrade" e o padrao do navegador e
    // vazaria o caminho inteiro em navegacao entre origens.
    const index = ler("server/_core/index.ts");
    expect(index).toMatch(/Referrer-Policy[\s\S]{0,60}strict-origin-when-cross-origin/);
  });
});

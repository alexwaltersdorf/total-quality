/**
 * AutoSEO Webhook Handler
 * Recebe webhooks do AutoSEO e sincroniza artigos automaticamente
 * Valida Bearer Token para segurança
 */

import { getDb } from "../db";
import { autoSeoArticles } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export interface AutoSeoWebhookPayload {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  heroImage?: string;
  category?: string;
  publishedAt?: string;
  updatedAt?: string;
  status?: "published" | "draft";
}

/**
 * Valida o Bearer Token do webhook
 */
export function validateWebhookToken(authHeader: string | undefined): boolean {
  const expectedToken = process.env.AUTOSEO_WEBHOOK_TOKEN;
  
  if (!expectedToken) {
    console.error("[AutoSEO Webhook] Token não configurado em AUTOSEO_WEBHOOK_TOKEN");
    return false;
  }

  if (!authHeader) {
    console.error("[AutoSEO Webhook] Header de autorização ausente");
    return false;
  }

  // Formato esperado: "Bearer token"
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    console.error("[AutoSEO Webhook] Formato de autorização inválido");
    return false;
  }

  const token = parts[1];
  const isValid = token === expectedToken;

  if (!isValid) {
    console.error("[AutoSEO Webhook] Token inválido");
  }

  return isValid;
}

/**
 * Processa webhook do AutoSEO e sincroniza artigo
 */
export async function processAutoSeoWebhook(
  payload: AutoSeoWebhookPayload
): Promise<{ success: boolean; message: string; articleId?: string }> {
  try {
    // Validar payload
    if (!payload.id || !payload.title || !payload.slug || !payload.content) {
      return {
        success: false,
        message: "Payload inválido: campos obrigatórios ausentes",
      };
    }

    const db = await getDb();
    if (!db) {
      return {
        success: false,
        message: "Banco de dados não disponível",
      };
    }

    // Verificar se artigo já existe
    const existingArticle = await db
      .select()
      .from(autoSeoArticles)
      .where(eq(autoSeoArticles.autoSeoId, payload.id))
      .limit(1);

    const now = new Date();
    const publishedAt = payload.publishedAt ? new Date(payload.publishedAt) : now;
    const status = payload.status === "published" ? "published" : "synced";

    if (existingArticle.length > 0) {
      // Atualizar artigo existente
      await db
        .update(autoSeoArticles)
        .set({
          title: payload.title,
          slug: payload.slug,
          content: payload.content,
          excerpt: payload.excerpt || "",
          heroImage: payload.heroImage || null,
          category: payload.category || "Saúde",
          publishedAt,
          status,
          updatedAt: now,
        })
        .where(eq(autoSeoArticles.autoSeoId, payload.id));

      console.log(`[AutoSEO Webhook] Artigo atualizado: ${payload.slug}`);

      return {
        success: true,
        message: "Artigo atualizado com sucesso",
        articleId: existingArticle[0].id.toString(),
      };
    } else {
      // Criar novo artigo
      const result = await db.insert(autoSeoArticles).values({
        autoSeoId: payload.id,
        title: payload.title,
        slug: payload.slug,
        content: payload.content,
        excerpt: payload.excerpt || "",
        heroImage: payload.heroImage || null,
        category: payload.category || "Saúde",
        publishedAt,
        status,
      });

      console.log(`[AutoSEO Webhook] Novo artigo criado: ${payload.slug}`);

      return {
        success: true,
        message: "Artigo criado com sucesso",
        articleId: result.insertId?.toString(),
      };
    }
  } catch (error) {
    console.error("[AutoSEO Webhook] Erro ao processar webhook:", error);
    return {
      success: false,
      message: `Erro ao processar webhook: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
    };
  }
}

/**
 * Processa múltiplos artigos do webhook (batch)
 */
export async function processAutoSeoWebhookBatch(
  articles: AutoSeoWebhookPayload[]
): Promise<{ success: boolean; processed: number; failed: number; errors: string[] }> {
  const errors: string[] = [];
  let processed = 0;
  let failed = 0;

  for (const article of articles) {
    try {
      const result = await processAutoSeoWebhook(article);
      if (result.success) {
        processed++;
      } else {
        failed++;
        errors.push(`${article.slug}: ${result.message}`);
      }
    } catch (error) {
      failed++;
      errors.push(
        `${article.slug}: ${error instanceof Error ? error.message : "Erro desconhecido"}`
      );
    }
  }

  return {
    success: failed === 0,
    processed,
    failed,
    errors,
  };
}

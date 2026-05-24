/**
 * AutoSEO Synchronization Module
 * Sincroniza artigos da API do AutoSEO e publica automaticamente no blog
 */

import {
  getAutoSeoArticleByAutoSeoId,
  createAutoSeoArticle,
  updateAutoSeoArticle,
  publishAutoSeoArticle,
} from "../db";

const AUTOSEO_API_KEY = "aseo_a5f58113bbccca4a59b4735244b31251";
const AUTOSEO_API_URL = "https://api.getautoseo.com/v1";

interface AutoSeoArticleResponse {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  contentMarkdown?: string;
  metaDescription?: string;
  metaKeywords?: string;
  searchTerms?: string;
  heroImage?: string;
  infographic?: string;
  status: "published" | "draft";
  createdAt: string;
  updatedAt: string;
}

/**
 * Sincroniza artigos da API do AutoSEO
 * Busca artigos novos e publica automaticamente
 */
export async function syncAutoSeoArticles(): Promise<{
  success: boolean;
  newArticles: number;
  updatedArticles: number;
  publishedArticles: number;
  error?: string;
}> {
  try {
    console.log("[AutoSEO] Iniciando sincronização...");

    // Buscar artigos da API do AutoSEO
    const response = await fetch(`${AUTOSEO_API_URL}/articles?limit=100&status=published`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${AUTOSEO_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`AutoSEO API error: ${response.statusText}`);
    }

    const data = await response.json();
    const articles: AutoSeoArticleResponse[] = data.data || [];

    console.log(`[AutoSEO] Encontrados ${articles.length} artigos`);

    let newArticles = 0;
    let updatedArticles = 0;
    let publishedArticles = 0;

    // Processar cada artigo
    for (const article of articles) {
      try {
        // Verificar se artigo já existe
        const existing = await getAutoSeoArticleByAutoSeoId(article.id);

        if (existing) {
          // Atualizar artigo existente
          await updateAutoSeoArticle(existing.id, {
            title: article.title,
            excerpt: article.excerpt,
            content: article.content,
            contentMarkdown: article.contentMarkdown,
            metaDescription: article.metaDescription,
            metaKeywords: article.metaKeywords,
            searchTerms: article.searchTerms,
            heroImage: article.heroImage,
            infographic: article.infographic,
            updatedAt: new Date(),
          });
          updatedArticles++;
          console.log(`[AutoSEO] Artigo atualizado: ${article.title}`);
        } else {
          // Criar novo artigo
          const articleId = await createAutoSeoArticle({
            autoSeoId: article.id,
            title: article.title,
            slug: article.slug,
            excerpt: article.excerpt,
            content: article.content,
            contentMarkdown: article.contentMarkdown,
            metaDescription: article.metaDescription,
            metaKeywords: article.metaKeywords,
            searchTerms: article.searchTerms,
            heroImage: article.heroImage,
            infographic: article.infographic,
            category: "Saúde",
            author: "Total Quality",
            authorRole: "Equipe Médica",
            readTime: calculateReadTime(article.content),
            status: "synced",
            syncedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          // Publicar automaticamente
          await publishAutoSeoArticle(articleId.id);
          newArticles++;
          publishedArticles++;
          console.log(`[AutoSEO] Novo artigo criado e publicado: ${article.title}`);
        }
      } catch (error) {
        console.error(`[AutoSEO] Erro ao processar artigo ${article.id}:`, error);
      }
    }

    console.log(`[AutoSEO] Sincronização concluída: ${newArticles} novos, ${updatedArticles} atualizados, ${publishedArticles} publicados`);

    return {
      success: true,
      newArticles,
      updatedArticles,
      publishedArticles,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("[AutoSEO] Erro na sincronização:", errorMessage);
    return {
      success: false,
      newArticles: 0,
      updatedArticles: 0,
      publishedArticles: 0,
      error: errorMessage,
    };
  }
}

/**
 * Calcula tempo de leitura estimado em minutos
 */
function calculateReadTime(content: string): string {
  // Remove HTML tags
  const text = content.replace(/<[^>]*>/g, "");
  // Conta palavras (média 200 palavras por minuto)
  const wordCount = text.split(/\s+/).length;
  const minutes = Math.ceil(wordCount / 200);
  return `${minutes} min`;
}

/**
 * Testa a conexão com a API do AutoSEO
 */
export async function testAutoSeoConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${AUTOSEO_API_URL}/articles?limit=1`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${AUTOSEO_API_KEY}`,
        "Content-Type": "application/json",
      },
    });
    return response.ok;
  } catch (error) {
    console.error("[AutoSEO] Erro ao testar conexão:", error);
    return false;
  }
}

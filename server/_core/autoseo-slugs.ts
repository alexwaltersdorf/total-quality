/*
 * Cache em memoria dos slugs de artigos AutoSEO publicados.
 *
 * Por que existe: a rota `/:slug` do wouter e um catch-all de primeiro nivel
 * para artigos que chegam pela API do AutoSEO. Sem saber quais slugs existem,
 * o servidor respondia **200 para qualquer caminho de primeiro nivel** —
 * /qualquer-coisa devolvia a home com status 200. Isso e a definicao de soft
 * 404: o Google rastreia, ve pagina generica com 200 e reporta "Soft 404".
 * Em 21/08/2026 o sitemap tinha 32 URLs e nenhum artigo AutoSEO de primeiro
 * nivel — a excecao custava caro e nao servia ninguem.
 *
 * Como funciona: a lista e lida do banco no boot e depois de cada sincronizacao
 * do AutoSEO (mesmo ciclo de 24 h). Enquanto a lista NUNCA carregou — banco
 * indisponivel, boot em andamento — `getKnownAutoSeoSlugs()` devolve `null` e
 * `resolveHttpStatus` mantem o comportamento antigo (200). Preferimos um soft
 * 404 transitorio a devolver 404 num artigo real por causa de banco fora do ar.
 */
import { getDb } from "../db";
import { autoSeoArticles } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

/** `null` = nunca carregou. Set vazio = carregou e nao ha artigos. */
let cache: Set<string> | null = null;

/** Slugs publicados, ou `null` se a lista ainda nao pode ser carregada. */
export function getKnownAutoSeoSlugs(): Set<string> | null {
  return cache;
}

/** Recarrega o cache a partir do banco. Silencioso em caso de falha. */
export async function refreshAutoSeoSlugs(): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return; // banco fora: mantem o cache anterior (ou null)
    const linhas = await db
      .select({ slug: autoSeoArticles.slug })
      .from(autoSeoArticles)
      .where(eq(autoSeoArticles.status, "published"));
    cache = new Set(linhas.map((l) => l.slug).filter(Boolean) as string[]);
    console.log(`[AutoSEO] ${cache.size} slug(s) publicado(s) em cache`);
  } catch (erro) {
    console.error("[AutoSEO] Falha ao carregar slugs publicados:", erro);
  }
}

/** Só para teste: injeta um estado conhecido no cache. */
export function __setAutoSeoSlugsForTest(slugs: Set<string> | null): void {
  cache = slugs;
}

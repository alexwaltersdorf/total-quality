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
/*
 * ATUALIZACAO 06/09/2026 — A INTEGRACAO ESTA DESLIGADA.
 *
 * O Alex informou que nao usa o AutoSEO. Com a ferramenta fora de uso, a
 * dependencia de banco aqui so fazia mal: em producao o cache nunca carregava
 * (`null`), a degradacao segura mantinha o comportamento antigo e o soft 404
 * seguia aberto — endereco inventado respondia 200 mesmo com a correcao no ar.
 *
 * Desligada, a lista de slugs conhecidos e VAZIA por definicao, nao `null`.
 * Isso da 404 real em qualquer caminho de primeiro nivel inexistente, sem
 * consultar banco nenhum e sem depender de DATABASE_URL estar configurada.
 *
 * Para religar: `AUTOSEO_ATIVO = true` restaura a leitura do banco, e o
 * endpoint do webhook precisa ser reintroduzido em _core/index.ts com um token
 * NOVO — o anterior vazou no historico publico do repositorio.
 */
export const AUTOSEO_ATIVO = false;

/** `null` = nunca carregou. Set vazio = carregou e nao ha artigos. */
let cache: Set<string> | null = AUTOSEO_ATIVO ? null : new Set<string>();

/** Slugs publicados, ou `null` se a lista ainda nao pode ser carregada. */
export function getKnownAutoSeoSlugs(): Set<string> | null {
  return cache;
}

/** Recarrega o cache a partir do banco. Silencioso em caso de falha. */
export async function refreshAutoSeoSlugs(): Promise<void> {
  if (!AUTOSEO_ATIVO) return; // desligado: a lista vazia ja e a resposta certa
  try {
    const { getDb } = await import("../db");
    const { autoSeoArticles } = await import("../../drizzle/schema");
    const { eq } = await import("drizzle-orm");
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

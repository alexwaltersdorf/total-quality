/**
 * Redirecionamentos de URLs legadas (auditoria do Search Console, jul/2026).
 *
 * O Google conhece 47 URLs que não existem mais, herdadas de versões antigas do
 * site. Como o catch-all da SPA respondia 200 para qualquer caminho, elas viraram
 * 13 "soft 404" e diluíram sinais — `/index`, por exemplo, chegou a ser indexada
 * como página separada da home, com conteúdo idêntico.
 *
 * Aqui cada URL legada recebe o destino certo:
 *   - 301 para as que têm equivalente atual (consolidam o sinal na URL nova);
 *   - 410 Gone para artefatos de link quebrado, que nunca terão equivalente.
 *
 * O que NÃO estiver nesta lista e não for rota conhecida cai no 404 real de
 * `resolveHttpStatus` (server/_core/seo-content.ts).
 */

/** URLs legadas → destino do 301. Chaves sem barra final. */
export const LEGACY_REDIRECTS: Record<string, string> = {
  // Duplicata exata da home — estava indexada como página separada
  "/index": "/",
  "/home": "/",

  // Página placeholder de um WordPress antigo ("Add custom text here"),
  // encontrada INDEXADA via site:totalquality.med.br em 01/08/2026 — o
  // soft-404 do build antigo respondia 200 e o Google guardou o título
  // placeholder "Total Quality – TotalQuality".
  "/total-quality": "/",

  // Eram âncoras da home em uma versão antiga do site, nunca rotas próprias
  "/sobre": "/#sobre",
  "/contato": "/#contato",

  // Páginas institucionais que hoje vivem na home
  "/medicos": "/",
  "/corpo-clinico": "/",
  "/equipe": "/",

  // Renomeadas
  "/mapa": "/exames/mapa",
  "/cartao-desconto": "/cartao",
  "/blog/index": "/blog",
  "/blog/privacidade": "/privacidade",

  // Portal de resultados: o login vive em subdomínio próprio
  "/login": "/",
};

/**
 * URLs que devem responder 410 Gone: artefatos de links quebrados que o Google
 * rastreou e que nunca terão equivalente. O 410 tira do índice mais rápido que
 * o 404.
 */
export const GONE_PATHS = new Set(["/$", "/%24", "/null", "/undefined"]);

/** Resolve o destino do 301 para uma URL legada, ou null se não houver. */
export function getLegacyRedirect(pathname: string): string | null {
  const path = pathname.replace(/\/+$/, "") || "/";
  return LEGACY_REDIRECTS[path] ?? null;
}

/** Indica se o caminho deve responder 410 Gone. */
export function isGone(pathname: string): boolean {
  const path = pathname.replace(/\/+$/, "") || "/";
  return GONE_PATHS.has(path);
}

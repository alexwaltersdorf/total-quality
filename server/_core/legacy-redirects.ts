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

  // Renomeadas
  "/mapa": "/exames/mapa",
  "/cartao-desconto": "/cartao",
  "/blog/index": "/blog",
  "/blog/privacidade": "/privacidade",

  // Portal de resultados: o login vive em subdomínio próprio
  "/login": "/",

  // Canibalizacao de palavras-chave (auditoria de SEO, 12/09): dois artigos
  // do blog disputavam a mesma busca ("exames de sangue") e a pagina de
  // venda ficava atras dos dois. Consolidado no artigo mais forte.
  // Em 22/10/2026 o destino passou a ser a pagina de exame: a busca tem
  // "Caraguatatuba", e intencao local e da pagina /exames/, nao do blog
  // (system prompt do blog, regra 5).
  "/blog/exame-de-sangue-caraguatatuba": "/exames/exames-de-sangue",

  // Slug antigo do artigo de hemograma, de antes de uma renomeacao — ainda
  // aparecia no relatorio do GSC com 1 impressao residual e respondia 404.
  "/blog/hemograma-completo-como-avalia": "/blog/hemograma-completo-o-que-avalia",
  // Mesmo artigo, slug truncado: aparecia como "Erro soft 404" no GSC (out/2026).
  "/blog/hemograma-completo": "/blog/hemograma-completo-o-que-avalia",

  // Canibalizacao do hemograma (diagnostico de SEO de 17/10/2026): o artigo
  // repetia a intencao local da pagina de servico. Search Console, 90 dias ate
  // 17/10: ZERO impressoes para a URL do artigo, contra 5.187 de
  // /exames/hemograma e 7.626 do artigo informativo. O que ele tinha de util
  // (preparo, indicacoes, sem agendamento) ja estava na pagina de servico.
  "/blog/hemograma-caraguatatuba": "/exames/hemograma",

  // Consolidacao do blog (auditoria do Search Console de 21/10/2026). Cada
  // artigo disputava a intencao de uma pagina de servico — ex.: "ultrassonografia
  // caraguatatuba sp" caiu da posicao 4,7 para 48,3 enquanto o Google alternava
  // entre o artigo e /exames/ultrassonografia. O que o artigo tinha de util e
  // correto foi levado para o destino antes do 301.
  "/blog/ultrassonografia-caraguatatuba": "/exames/ultrassonografia",
  "/blog/tomografia-caraguatatuba": "/exames/tomografia-computadorizada",
  "/blog/check-up-preventivo-quando-fazer": "/blog/check-up-medico-quais-exames-fazer",
  "/blog/laboratorio-regiao-sul-caraguatatuba": "/laboratorio-caraguatatuba",
  "/blog/laboratorio-jardim-primavera-caraguatatuba": "/laboratorio-caraguatatuba",
  "/blog/convenios-laboratorio-caraguatatuba": "/convenios",

  // Auditoria de indexacao (23/10/2026): URLs com historico de impressao no
  // Search Console que respondiam 404 e tem equivalente atual. Erros de
  // digitacao em links externos, o slug com acento e paginas de um WordPress
  // antigo. Express entrega req.path ainda codificado (%C3%A9), por isso a
  // chave do slug acentuado vai codificada.
  "/blog/eletrocardiograma-o-que-%C3%A9-como-%C3%A9-feito": "/blog/eletrocardiograma-o-que-e-como-e-feito",
  "/blog/exame-de-sangue-guia-completo": "/blog/exames-de-sangue-guia-completo",
  "/exames/ultassonografia": "/exames/ultrassonografia",
  "/eletroencefalograma": "/exames/eletroencefalograma",
  "/glossario/tempo-resultado-hemograma-completo": "/exames/hemograma",
  "/category/blog": "/blog",
  "/about-us": "/#sobre",
  "/contact-us": "/#contato",
  "/contact-us-2": "/#contato",
  "/appointment": "/#contato",
};

/**
 * URLs que devem responder 410 Gone: artefatos de links quebrados que o Google
 * rastreou e que nunca terão equivalente. O 410 tira do índice mais rápido que
 * o 404.
 */
export const GONE_PATHS = new Set([
  "/$", "/%24", "/null", "/undefined",
  // Paginas institucionais de uma versao antiga, sem equivalente hoje. Antes
  // faziam 301 para a home, e o Google trata redirecionamento para a home como
  // "soft 404" (relatorio do GSC de out/2026). Sem pagina equivalente, 410.
  "/medicos", "/corpo-clinico", "/equipe",
  // FAQ geral do WordPress antigo (auditoria de indexacao, 23/10/2026): as
  // perguntas hoje vivem em cada pagina de exame, sem uma pagina equivalente.
  "/faq",
]);

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

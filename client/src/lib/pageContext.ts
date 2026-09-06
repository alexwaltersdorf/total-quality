/*
 * Deriva o contexto de exame a partir da rota atual.
 *
 * O problema que isto resolve: os CTAs de WhatsApp de alcance geral — o botao
 * flutuante, o rodape, a navbar, a secao de contato — nao sabiam em que pagina
 * estavam e mandavam sempre `exam_type: "geral"`. Como sao justamente os
 * botoes de maior volume, o parametro mais util da medicao chegava vazio de
 * significado na maior parte dos cliques, e todo lead caia no valor padrao.
 *
 * Com o contexto derivado da rota, um clique no botao flutuante DENTRO da
 * pagina de tomografia passa a valer como tomografia — sem precisar propagar
 * propriedade por toda a arvore de componentes.
 *
 * LGPD: a rota nao carrega dado pessoal, so o servico consultado. Isto e
 * segmentacao de campanha, nunca identificacao — o `exam_type` continua
 * proibido de ser cruzado com `user_data` (ver lib/userData.ts).
 */

/** Rotas tematicas cujo contexto nao vem de um slug de exame. */
const CONTEXTO_POR_ROTA: Record<string, string> = {
  "/checkup": "checkup",
  "/bioimpedancia": "bioimpedancia",
  "/cartao": "cartao",
  "/convenios": "convenios",
  "/exames": "exames",
  "/laboratorio-caraguatatuba": "laboratorio",
};

export const CONTEXTO_PADRAO = "geral";

/**
 * Contexto de exame para o caminho informado.
 *
 * `/exames/<slug>` devolve o proprio slug, que e a chave usada em
 * lib/leadValues.ts. `/blog` e `/blog/<slug>` devolvem "blog" (intencao fria).
 * Qualquer outra rota devolve "geral".
 */
export function examTypeFromPath(pathname: string): string {
  const limpo = pathname.split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";

  const exame = limpo.match(/^\/exames\/([^/]+)$/);
  if (exame) return exame[1];

  if (limpo === "/blog" || limpo.startsWith("/blog/")) return "blog";

  return CONTEXTO_POR_ROTA[limpo] ?? CONTEXTO_PADRAO;
}

/** Mesma coisa, lendo a rota atual do navegador. Seguro fora do browser. */
export function examTypeAtual(): string {
  if (typeof window === "undefined") return CONTEXTO_PADRAO;
  return examTypeFromPath(window.location.pathname);
}

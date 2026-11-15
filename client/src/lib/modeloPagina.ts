/*
 * Modelo de pagina de exame e de consulta (SEO nov/2026, Fase 3 — plano
 * aprovado pelo Alex em 14/11/2026, docs/seo-plano.md §5).
 *
 * Toda pagina de /exames/*, /especialidades/*, /laboratorio-caraguatatuba,
 * /checkup e /bioimpedancia e desenhada pelo MESMO componente
 * (components/PaginaServico.tsx) a partir de um objeto ConteudoPagina. A
 * pagina e renderizada no servidor e hidratada no navegador (Fase 1), entao o
 * que o Google le e o que o paciente ve saem deste mesmo dado.
 *
 * Regra do conteudo (briefing de 14/11/2026): so entra fato que ja estava no
 * repositorio (examesData, especialidadesData, paginasServico, artigos
 * publicados do blog). O que faltar fica num comentario `// TODO(alex): ...`
 * no arquivo de dados e o BLOCO NAO APARECE — nada de placeholder, "a
 * confirmar" ou texto generico visivel, porque isto vai para producao.
 *
 * Pura: sem React, sem window. Importada pelo cliente e pelo servidor.
 */

/** Quem revisa as paginas de servico (decisao do Alex, 14/11/2026). Sem a sigla do conselho. */
export const REVISOR_PAGINAS = "Dr. Alex Waltersdorf - 267.339";

/** Data em que o conteudo da Fase 3 foi reescrito (AAAA-MM-DD). */
export const REVISAO_FASE_3 = "2026-11-15";

/** Linhas da tabela "Resumo rapido", na ordem em que aparecem. */
export const CAMPOS_RESUMO = [
  ["jejum", "Jejum"],
  ["preparo", "Preparo"],
  ["duracao", "Duração"],
  ["resultado", "Resultado"],
  ["pedidoMedico", "Pedido médico"],
  ["atendimento", "Agendamento"],
  ["convenios", "Convênios"],
] as const;

export type CampoResumo = (typeof CAMPOS_RESUMO)[number][0];

/** Linha ausente = sem dado verificado (TODO no arquivo de dados): a linha nao aparece. */
export type Resumo = Partial<Record<CampoResumo, string>>;

/** H2 em forma de pergunta ("Precisa de jejum ou preparo?"). */
export interface SecaoPergunta {
  /** ancora do "Nesta pagina" */
  id: string;
  titulo: string;
  paragrafos: string[];
  lista?: string[];
}

export interface Subtipo {
  nome: string;
  /** preparo em uma linha, so quando o dado existe */
  preparo?: string;
  href?: string;
}

/** Foto real da clinica em /images (variantes AVIF/WebP geradas por scripts/optimize-images.mjs). */
export interface ImagemReal {
  slug: string;
  alt: string;
  widths: number[];
  /** dimensoes intrinsecas da maior variante (reservam o espaco: sem CLS) */
  width: number;
  height: number;
  legenda?: string;
}

/** Bloco para empresas (medicina do trabalho / exame admissional). */
export interface BlocoEmpresa {
  titulo: string;
  paragrafos: string[];
  itens: string[];
  /** texto do botao: "Solicitar proposta para empresa" */
  cta: string;
  /** mensagem pre-preenchida do WhatsApp */
  mensagem: string;
}

export interface ConteudoPagina {
  /** 40–60 palavras logo abaixo do H1: o que e, para que serve, agendamento ou ordem de chegada. */
  respostaCurta: string;
  resumo: Resumo;
  secoes: SecaoPergunta[];
  subtipos?: { id: string; titulo: string; intro?: string; itens: Subtipo[] };
  empresa?: BlocoEmpresa;
  imagem?: ImagemReal;
  /** "Onde fazer [nome] em Caraguatatuba" */
  nomeOndeFazer: string;
  /** frase do bloco "Onde fazer" (coleta por ordem de chegada, hora marcada...) */
  mensagemOndeFazer: string;
  /** slugs de artigo do blog (2–4); padrao: lib/examBlogLinks.ts */
  blog?: string[];
  /** 3–4 rotas de servico ("Exames relacionados") */
  relacionados: string[];
  /** AAAA-MM-DD da ultima mudanca real do conteudo (→ <time>, lastmod do sitemap) */
  atualizadoEm: string;
}

/** Foto da fachada: entra no "Onde fazer" de toda pagina do modelo. */
export const FOTO_FACHADA: ImagemReal = {
  slug: "fachada",
  alt: "Fachada da Total Quality Medicina Diagnóstica na Rua Padre Anchieta, 1010, no Centro de Caraguatatuba - SP",
  widths: [480, 768, 1024],
  width: 1024,
  height: 843,
};

/** "2026-11-15" → "15/11/2026" (sem toLocaleDateString: o mesmo texto no servidor e no navegador). */
export function dataBr(iso: string): string {
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
}

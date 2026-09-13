/*
 * Blog Data — Total Quality Medicina Diagnóstica
 *
 * PADRÃO PARA NOVOS ARTIGOS (auditoria Lighthouse jul/2026):
 * o texto dos artigos NÃO vive mais neste arquivo. Cada artigo é um JSON em
 * client/src/content/blog/<slug>.json, e o índice de metadados (sem o corpo)
 * fica em client/src/content/blog/index.json.
 *
 * Motivo: o corpo dos artigos era string literal no bundle e viajava no chunk
 * inicial de TODAS as páginas, inclusive para quem nunca abre o blog.
 * Agora só os metadados (título, resumo, imagem) entram no bundle; o corpo é
 * carregado sob demanda, um chunk por artigo.
 *
 * Para publicar um artigo novo:
 *   1. Crie client/src/content/blog/<slug>.json seguindo o formato dos demais
 *      (todos os campos de BlogPost, com "content" como array de parágrafos).
 *   2. Acrescente os metadados (tudo menos "content") em index.json.
 *   3. Registre a rota em server/_core/routes-metadata.ts (blogMetadata) — o
 *      teste guard-rail falha se a rota entrar no sitemap sem conteúdo.
 */

import blogIndex from "@/content/blog/index.json";

export interface BlogPostMeta {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  category: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  image: string;
  tags: string[];
}

export interface BlogPost extends BlogPostMeta {
  content: string[];
}

export const blogCategories = [
  "Todos",
  "Medicina Preventiva",
  "Exames Laboratoriais",
  "Saúde do Coração",
  "Saúde Ocupacional",
  "Nutrição",
  "Bem-Estar",
];

/** Metadados de todos os artigos — leve, seguro para o chunk inicial. */
export const blogPosts: BlogPostMeta[] = blogIndex as BlogPostMeta[];

const PT_MONTHS: Record<string, number> = {
  jan: 0, fev: 1, mar: 2, abr: 3, mai: 4, jun: 5,
  jul: 6, ago: 7, set: 8, out: 9, nov: 10, dez: 11,
};

/**
 * Converte a data em texto do post (ex: "12 Set 2026") para timestamp
 * ordenável. O construtor nativo `Date()` não reconhece meses abreviados em
 * português e devolve Invalid Date/NaN para todo post — a ordenação por
 * "mais recente" nunca funcionou de fato, e o post em destaque/primeiro do
 * grid ficava por ordem de inserção no index.json, não por data.
 */
export function parseBlogDate(date: string): number {
  const match = date.match(/^(\d{1,2})\s+([A-Za-zçÇ]+)\s+(\d{4})$/);
  if (match) {
    const [, day, monthStr, year] = match;
    const month = PT_MONTHS[monthStr.toLowerCase()];
    if (month !== undefined) {
      return new Date(Number(year), month, Number(day)).getTime();
    }
  }
  const fallback = new Date(date).getTime();
  return Number.isNaN(fallback) ? 0 : fallback;
}

/**
 * Extrai os pares pergunta/resposta da seção "## Perguntas frequentes" do
 * corpo de um artigo (títulos "### " dentro dela viram perguntas), para
 * alimentar o FAQPage schema (useFAQSchema em SEOHead.tsx) — mesmo padrão já
 * usado em ExamePage.tsx. Artigos sem essa seção devolvem array vazio, e
 * useFAQSchema simplesmente não injeta nada nesse caso.
 */
export function extractFaqs(content: string[]): { q: string; a: string }[] {
  const faqs: { q: string; a: string }[] = [];
  let inFaqSection = false;
  let current: { q: string; a: string[] } | null = null;

  const flush = () => {
    if (current && current.a.length > 0) faqs.push({ q: current.q, a: current.a.join(" ") });
    current = null;
  };

  for (const block of content) {
    const trimmed = block.trimStart();
    if (trimmed.startsWith("## ")) {
      flush();
      inFaqSection = /perguntas frequentes/i.test(trimmed.slice(3));
      continue;
    }
    if (!inFaqSection) continue;
    if (trimmed.startsWith("### ")) {
      flush();
      current = { q: trimmed.slice(4), a: [] };
      continue;
    }
    if (current) current.a.push(block);
  }
  flush();

  return faqs;
}

/** Cada artigo vira um chunk próprio, carregado só quando alguém o abre. */
const articleLoaders = import.meta.glob<{ default: BlogPost }>(
  "../content/blog/*.json"
);

/**
 * Carrega o artigo completo (com o corpo) sob demanda.
 * Retorna null se o slug não existir.
 */
export async function loadBlogPost(slug: string): Promise<BlogPost | null> {
  const entry = Object.entries(articleLoaders).find(([path]) =>
    path.endsWith(`/${slug}.json`)
  );
  if (!entry) return null;
  const mod = await entry[1]();
  return mod.default;
}

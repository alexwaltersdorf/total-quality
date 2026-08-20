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
  "Nutrição",
  "Bem-Estar",
];

/** Metadados de todos os artigos — leve, seguro para o chunk inicial. */
export const blogPosts: BlogPostMeta[] = blogIndex as BlogPostMeta[];

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

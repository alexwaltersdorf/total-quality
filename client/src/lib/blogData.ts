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
 *   4. Artigo novo nasce com "draft": true e "reviewStatus":
 *      "revisao_medica_pendente" — fica fora do sitemap e da listagem até o
 *      Alex aprovar (ver client/src/lib/blogMeta.ts).
 */

import blogIndex from "@/content/blog/index.json";
import { isPublished, type BlogPost, type BlogPostMeta } from "@/lib/blogMeta";

export type { BlogPost, BlogPostMeta } from "@/lib/blogMeta";
export { parseBlogDate, extractFaqs } from "@/lib/blogMeta";

export const blogCategories = [
  "Todos",
  "Medicina Preventiva",
  "Exames Laboratoriais",
  "Saúde do Coração",
  "Saúde Ocupacional",
  "Nutrição",
  "Bem-Estar",
];

/** Todos os artigos, rascunhos inclusive — só para abrir a URL de um rascunho. */
export const allBlogPosts: BlogPostMeta[] = blogIndex as BlogPostMeta[];

/**
 * Metadados dos artigos PUBLICADOS — leve, seguro para o chunk inicial. É o
 * que listagem, home e relacionados usam: rascunho nunca aparece neles.
 */
export const blogPosts: BlogPostMeta[] = allBlogPosts.filter(isPublished);

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

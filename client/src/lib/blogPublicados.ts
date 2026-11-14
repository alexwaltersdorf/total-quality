/*
 * Metadados dos artigos PUBLICADOS, sem import.meta.glob.
 *
 * Separado de blogData.ts porque as paginas renderizadas no servidor (SEO
 * nov/2026, Fase 1) entram no bundle do servidor pelo esbuild, que nao conhece
 * o import.meta.glob do Vite. blogData.ts reexporta daqui.
 */
import blogIndex from "@/content/blog/index.json";
import { isPublished, type BlogPostMeta } from "@/lib/blogMeta";

/** Todos os artigos, rascunhos inclusive — só para abrir a URL de um rascunho. */
export const allBlogPosts: BlogPostMeta[] = blogIndex as BlogPostMeta[];

/**
 * Metadados dos artigos PUBLICADOS — leve, seguro para o chunk inicial. É o
 * que listagem, home e relacionados usam: rascunho nunca aparece neles.
 */
export const blogPosts: BlogPostMeta[] = allBlogPosts.filter(isPublished);

/**
 * Unificacao dos blogs (decisao do Alex, 27/10/2026).
 *
 * blog.totalquality.med.br era o blog hospedado da Airticles (Next.js na
 * Vercel, GTM-TWRSLQQQ, Article sem autor nem revisor). Em 90 dias teve 189
 * impressoes, contra 104 mil do /blog. O Alex decidiu manter o /blog como
 * unico blog: a Airticles so escreve, e o artigo aprovado entra aqui como
 * rascunho. Analise em ANALISE-DOIS-BLOGS-OUT2026.md (repo de SEO).
 *
 * Quando o DNS do subdominio apontar para este servidor, todo pedido a ele
 * responde 301 para o equivalente no dominio principal:
 *   - artigo migrado e PUBLICADO no /blog -> o artigo;
 *   - artigo migrado ainda em RASCUNHO    -> a pagina do exame (o rascunho e
 *     noindex; mandar o Google para ele jogaria fora o sinal);
 *   - tema que ja existia no /blog         -> o artigo do /blog;
 *   - tema retirado de proposito           -> 410 Gone;
 *   - qualquer outro caminho               -> /blog.
 */
import blogIndex from "../../client/src/content/blog/index.json";
import migrationRoutes from "./blog-migration-routes.json";

export const BLOG_SUBDOMINIO_HOST = "blog.totalquality.med.br";
const DESTINO_BASE = "https://totalquality.med.br";

/** Slug da Airticles (/posts/<slug>) -> slug do /blog. */
export const POSTS_MIGRADOS: Record<string, string> = migrationRoutes.migrated;

/** Retirados por estarem fora do foco da clinica: sem equivalente, 410. */
export const POSTS_REMOVIDOS = new Set(migrationRoutes.removed);

type PostIndice = { slug: string; draft?: boolean; examPages?: string[] };
const INDICE = blogIndex as PostIndice[];

export type RespostaSubdominio = { status: 301; location: string } | { status: 410 };

export function ehHostDoBlogAntigo(host: string | undefined): boolean {
  return (host ?? "").toLowerCase().split(":")[0] === BLOG_SUBDOMINIO_HOST;
}

export function resolverBlogSubdominio(
  pathname: string,
  indice: PostIndice[] = INDICE,
): RespostaSubdominio {
  const caminho = pathname.replace(/\/+$/, "");
  const post = /^\/posts\/([^/]+)$/.exec(caminho)?.[1];
  if (post && POSTS_REMOVIDOS.has(post)) return { status: 410 };

  const slug = post ? POSTS_MIGRADOS[post] : undefined;
  const alvo = slug ? indice.find((p) => p.slug === slug) : undefined;
  if (alvo && !alvo.draft) return { status: 301, location: `${DESTINO_BASE}/blog/${alvo.slug}` };
  if (alvo?.examPages?.[0]) return { status: 301, location: `${DESTINO_BASE}${alvo.examPages[0]}` };
  return { status: 301, location: `${DESTINO_BASE}/blog` };
}

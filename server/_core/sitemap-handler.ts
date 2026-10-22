/**
 * Handler para gerar sitemap.xml dinâmico
 * Retorna todas as rotas com prioridades e frequência de atualização
 */

import { getAllRoutes } from "./routes-metadata";

export function generateSitemap(): string {
  const routes = getAllRoutes();

  // Ordenar por prioridade decrescente
  routes.sort((a, b) => (b.priority || 0.5) - (a.priority || 0.5));

  // lastmod so quando ha data real de alteracao (artigos do blog). Antes toda
  // URL saia com a data do dia em que o sitemap era gerado — o Google aprende
  // a ignorar um lastmod que muda sem a pagina mudar.
  const urlEntries = routes
    .map((route) => {
      return `  <url>
    <loc>${escapeXml(route.canonical)}</loc>
${route.lastmod ? `    <lastmod>${route.lastmod}</lastmod>\n` : ""}    <changefreq>${route.changefreq || "monthly"}</changefreq>
    <priority>${(route.priority || 0.5).toFixed(1)}</priority>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

/**
 * Escapar caracteres especiais em XML
 */
function escapeXml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

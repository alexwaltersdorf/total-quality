#!/usr/bin/env node
/** Read-only audit of public laboratory pages. No credentials or patient data. */
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export const paths = [
  '/', '/laboratorio-caraguatatuba', '/exames/exames-de-sangue', '/exames/hemograma',
  '/blog/siglas-exames-laboratoriais', '/blog/hipoglicemia-sintomas-e-exames',
  '/blog/como-escolher-laboratorio-analises-clinicas',
  '/blog/exame-de-urina-eas-como-coletar', '/blog/hemograma-completo-o-que-avalia',
  '/blog/exames-de-sangue-guia-completo',
];
const canonicalOrigin = 'https://totalquality.med.br';
const decode = s => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
function attrs(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)]
    .map(m => [m[1].toLowerCase(), decode(m[2])]));
}

export function inspectHtml(html, pathname) {
  const errors = [];
  const titles = [...html.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)];
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  const metas = [...html.matchAll(/<meta\b[^>]*>/gi)].map(m => attrs(m[0]));
  const links = [...html.matchAll(/<link\b[^>]*>/gi)].map(m => attrs(m[0]));
  const canonicals = links.filter(a => a.rel?.toLowerCase() === 'canonical');
  const descriptions = metas.filter(a => a.name?.toLowerCase() === 'description');
  if (titles.length !== 1 || !titles[0]?.[1].trim()) errors.push('title ausente, vazio ou duplicado');
  if (h1s.length !== 1 || !h1s[0]?.[1].replace(/<[^>]*>/g, '').trim()) errors.push('H1 ausente, vazio ou duplicado');
  if (canonicals.length !== 1 || canonicals[0].href !== canonicalOrigin + (pathname === '/' ? '/' : pathname)) errors.push('canonical divergente');
  if (descriptions.length !== 1 || !descriptions[0].content?.trim()) errors.push('description ausente, vazia ou duplicada');
  if (metas.some(a => a.name?.toLowerCase() === 'robots' && /\bnoindex\b/i.test(a.content ?? ''))) errors.push('noindex em pagina publica');
  const schema = [];
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (attrs(match[1]).type !== 'application/ld+json') continue;
    try { schema.push(JSON.parse(match[2])); } catch { errors.push('JSON-LD invalido'); }
  }
  if (!schema.length) errors.push('JSON-LD ausente');
  const root = html.match(/<div\b[^>]*id=["']root["'][^>]*>([\s\S]*)/i)?.[1] ?? '';
  if (root.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ').trim().split(/\s+/).length < 80) errors.push('conteudo prerenderizado insuficiente');
  const hrefs = [...html.matchAll(/<a\b[^>]*>/gi)].map(m => attrs(m[0]).href).filter(Boolean);
  return { errors, title: titles[0]?.[1] ?? '', description: descriptions[0]?.content ?? '', hrefs };
}

export async function audit(origin = canonicalOrigin) {
  const issues = [], pages = [];
  const read = async pathname => {
    const response = await fetch(new URL(pathname, origin), {
      headers: { 'Accept-Encoding': 'identity', 'User-Agent': 'TotalQuality-SEO-Health/1.0' },
      signal: AbortSignal.timeout(20000), redirect: 'follow',
    });
    return { response, body: await response.text() };
  };
  const internal = new Set();
  for (const pathname of paths) {
    try {
      const { response, body } = await read(pathname);
      if (/checking your browser|verify you are human|trafego incomum|tráfego incomum/i.test(body)) {
        issues.push({ path: pathname, error: 'verificacao anti-bot; conteudo nao avaliado' });
        continue;
      }
      const result = inspectHtml(body, pathname);
      if (response.status !== 200) result.errors.push(`HTTP ${response.status}`);
      if (!response.headers.get('content-type')?.includes('text/html')) result.errors.push('resposta nao HTML');
      if (/\bnoindex\b/i.test(response.headers.get('x-robots-tag') ?? '')) result.errors.push('X-Robots-Tag noindex');
      pages.push({ path: pathname, status: response.status, title: result.title, description: result.description });
      issues.push(...result.errors.map(error => ({ path: pathname, error })));
      for (const href of result.hrefs) {
        try {
          const u = new URL(href, canonicalOrigin + pathname);
          if (u.origin === canonicalOrigin && !u.search && !/^\/(admin|api|dashboard|metrics)(\/|$)/.test(u.pathname)) internal.add(u.pathname);
        } catch { issues.push({ path: pathname, error: 'link invalido' }); }
      }
    } catch (e) { issues.push({ path: pathname, error: `consulta indisponivel: ${e.message}` }); }
  }
  for (let i = 0; i < pages.length; i++) {
    for (const other of pages.slice(i + 1)) {
      if (pages[i].title === other.title) issues.push({ path: other.path, error: `title duplicado com ${pages[i].path}` });
    }
  }
  for (const pathname of internal) {
    if (paths.includes(pathname)) continue;
    try {
      const { response } = await read(pathname);
      if (response.status !== 200) issues.push({ path: pathname, error: `destino interno HTTP ${response.status}` });
    } catch (e) { issues.push({ path: pathname, error: `destino indisponivel: ${e.message}` }); }
  }
  try {
    const { response, body } = await read('/sitemap.xml');
    if (response.status !== 200 || !body.includes('<urlset')) issues.push({ path: '/sitemap.xml', error: 'sitemap indisponivel ou invalido' });
    for (const pathname of paths) if (!body.includes(`<loc>${canonicalOrigin}${pathname}</loc>`)) issues.push({ path: pathname, error: 'fora do sitemap' });
    const robots = await read('/robots.txt');
    if (robots.response.status !== 200 || !robots.body.includes('Sitemap:')) issues.push({ path: '/robots.txt', error: 'robots indisponivel ou sem sitemap' });
    const missing = await read('/seo-health-rota-inexistente');
    if (missing.response.status !== 404) issues.push({ path: '/seo-health-rota-inexistente', error: `esperado 404; recebido ${missing.response.status}` });
  } catch (e) { issues.push({ path: 'infraestrutura', error: e.message }); }
  return { checkedAt: new Date().toISOString(), origin, pages, internalLinksChecked: internal.size, issues };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const value = flag => args.includes(flag) ? args[args.indexOf(flag) + 1] : undefined;
  const report = await audit(value('--origin') ?? canonicalOrigin);
  const json = JSON.stringify(report, null, 2);
  if (value('--output')) writeFileSync(value('--output'), json + '\n');
  console.log(json);
  if (report.issues.length) process.exitCode = 1;
}

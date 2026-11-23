#!/usr/bin/env node
/** Read-only, bounded public inventory. No DNS/hosting writes or Google credentials. */
import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const OLD = 'https://blog.totalquality.med.br';
const MAIN = 'https://totalquality.med.br';
const readJson = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const routes = readJson('../server/_core/blog-migration-routes.json');
const index = readJson('../client/src/content/blog/index.json');
const inventory = readJson('../docs/seo-blog-antigo-inventario.json');
const decode = s => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const text = s => decode(s.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(m => [m[1].toLowerCase(), decode(m[2] ?? m[3])]));
const allowed = u => [OLD, MAIN].includes(new URL(u).origin);
const antiBot = s => /checking your browser|verify you are human|tr[aá]fego incomum/i.test(s);

export function expectedRedirect(pathname, posts = index) {
  const slug = /^\/posts\/([^/]+)$/.exec(pathname.replace(/\/+$/, ''))?.[1];
  if (routes.removed.includes(slug)) return { status: 410 };
  const target = posts.find(p => p.slug === routes.migrated[slug]);
  const path = target && !target.draft ? `/blog/${target.slug}` : target?.examPages?.[0] ?? '/blog';
  return { status: 301, location: MAIN + path };
}

/** Match only the sitemap namespace, never image:loc (which is an asset). */
export function sitemapLocations(xml) {
  const root = xml.match(/<(\w+:)?(sitemapindex|urlset)\b[^>]*>/);
  if (!root) throw new Error('XML nao e sitemapindex/urlset');
  const prefix = root[1] ?? '';
  const item = root[2] === 'sitemapindex' ? 'sitemap' : 'url';
  const entries = [...xml.matchAll(new RegExp(`<${prefix}${item}\\b[^>]*>([\\s\\S]*?)<\\/${prefix}${item}>`, 'g'))];
  const loc = new RegExp(`<${prefix}loc\\b[^>]*>([\\s\\S]*?)<\\/${prefix}loc>`);
  return { isIndex: item === 'sitemap', urls: entries.map(m => m[1].match(loc)?.[1]).filter(Boolean).map(s => decode(s.trim())) };
}

export function inspectInitialHtml(html) {
  const tags = name => [...html.matchAll(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)<\\/${name}>`, 'gi'))].map(m => text(m[1]));
  const metas = [...html.matchAll(/<meta\b[^>]*>/gi)].map(m => attributes(m[0]));
  const schemas = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter(m => attributes(m[1]).type === 'application/ld+json').map(m => {
      try { return JSON.parse(m[2]); } catch { return { invalidJson: true }; }
    });
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? '';
  const visible = text(body.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ''));
  return {
    title: tags('title'), h1: tags('h1'),
    description: metas.filter(a => a.name?.toLowerCase() === 'description').map(a => a.content ?? ''),
    robots: metas.filter(a => /^(robots|googlebot)$/i.test(a.name ?? '')).map(a => a.content ?? ''),
    canonical: [...html.matchAll(/<link\b[^>]*>/gi)].map(m => attributes(m[0])).filter(a => a.rel === 'canonical').map(a => a.href),
    schemas, initialBodyWords: visible ? visible.split(' ').length : 0,
    images: [...html.matchAll(/<img\b[^>]*>/gi)].map(m => attributes(m[0])).map(a => ({ src: a.src, alt: a.alt, width: a.width, height: a.height })),
    links: [...html.matchAll(/<a\b[^>]*>/gi)].map(m => attributes(m[0]).href).filter(Boolean),
  };
}

export async function readPublic(url, fetcher = fetch) {
  const chain = [];
  let current = url;
  try {
    for (let i = 0; i < 8; i++) {
      if (!allowed(current)) throw new Error('destino fora dos dois dominios; nao consultado');
      const r = await fetcher(current, { redirect: 'manual', signal: AbortSignal.timeout(20000), headers: { 'Accept-Encoding': 'identity', 'User-Agent': 'TotalQuality-SEO-Migration/1.0' } });
      const location = r.headers.get('location');
      chain.push({ url: current, status: r.status, ...(location ? { location: new URL(location, current).href } : {}) });
      if ([301, 302, 303, 307, 308].includes(r.status) && location) {
        await r.body?.cancel();
        const next = new URL(location, current).href;
        if (chain.some(h => h.url === next)) throw new Error('loop de redirect');
        current = next;
        continue;
      }
      const body = await r.text();
      return { url, chain, finalUrl: current, finalStatus: r.status, contentType: r.headers.get('content-type'), xRobotsTag: r.headers.get('x-robots-tag'), hosting: { platform: r.headers.get('platform'), vercelId: r.headers.get('x-vercel-id'), matchedPath: r.headers.get('x-matched-path') }, body, ...(antiBot(body) ? { unavailable: 'anti-bot: conteudo nao avaliado' } : {}) };
    }
    throw new Error('limite de redirects excedido');
  } catch (e) { return { url, chain, finalUrl: current, unavailable: e.message }; }
}

export async function auditMigration({ fetcher = fetch, seeds = inventory.urls, maxPages = 200 } = {}) {
  const cache = new Map();
  const read = url => {
    if (!cache.has(url)) cache.set(url, readPublic(url, fetcher));
    return cache.get(url);
  };
  const unavailable = [], errors = [], warnings = [], sitemapReports = [], discovered = new Map(), pages = [];
  const discover = (url, source) => {
    try {
      const u = new URL(url, OLD); u.hash = '';
      if (u.origin !== OLD || u.search || /\.(webp|avif|png|jpe?g|svg|pdf|ico)$/i.test(u.pathname)) return;
      const sources = discovered.get(u.href) ?? new Set(); sources.add(source); discovered.set(u.href, sources);
    } catch { warnings.push({ url, error: 'URL invalida no inventario/link' }); }
  };
  for (const seed of seeds) for (const source of seed.sources) discover(seed.url, source);
  const robots = await read(OLD + '/robots.txt');
  if (robots.unavailable) unavailable.push({ url: robots.url, error: robots.unavailable });
  const pending = new Set([OLD + '/sitemap.xml']);
  if (!robots.unavailable) for (const m of robots.body.matchAll(/^Sitemap:\s*(\S+)/gim)) {
    try { if (new URL(m[1]).origin === OLD) pending.add(m[1]); }
    catch { unavailable.push({ url: robots.url, error: 'URL de sitemap invalida em robots.txt' }); }
  }
  const visited = new Set();
  while (pending.size && visited.size < 30) {
    const url = pending.values().next().value; pending.delete(url);
    if (visited.has(url)) continue;
    visited.add(url);
    const r = await read(url); const { body, ...metadata } = r; sitemapReports.push(metadata);
    if (r.unavailable) { unavailable.push({ url, error: r.unavailable }); continue; }
    // After activation, legacy sitemap/robots may legitimately redirect to the blog.
    if (r.chain[0]?.location) continue;
    if (r.finalStatus !== 200) { unavailable.push({ url, status: r.finalStatus, error: 'sitemap indisponivel' }); continue; }
    try {
      const parsed = sitemapLocations(body);
      for (const loc of parsed.urls) {
        if (new URL(loc).origin !== OLD) continue;
        if (parsed.isIndex) pending.add(loc); else discover(loc, url);
      }
    } catch (e) { unavailable.push({ url, error: e.message }); }
  }
  if (pending.size) unavailable.push({ error: 'limite de 30 sitemaps atingido; inventario parcial' });
  let done = new Set();
  while ([...discovered.keys()].some(u => !done.has(u)) && pages.length < maxPages) {
    const batch = [...discovered.keys()].filter(u => !done.has(u)).slice(0, Math.min(4, maxPages - pages.length));
    const responses = await Promise.all(batch.map(read));
    for (const r of responses) {
      done.add(r.url);
      const { body, ...metadata } = r;
      const expected = expectedRedirect(new URL(r.url).pathname);
      const entry = { ...metadata, sources: [...discovered.get(r.url)], expected };
      pages.push(entry);
      if (r.unavailable) { unavailable.push({ url: r.url, error: r.unavailable }); continue; }
      const first = r.chain[0];
      entry.matchesPreparedRule = expected.status === 410 ? first.status === 410 : first.status === 301 && first.location === expected.location && r.chain.length === 2 && r.finalStatus === 200;
      if (first.location && !entry.matchesPreparedRule) errors.push({ url: r.url, error: 'redirect publico difere da regra preparada', expected, chain: r.chain });
      if (expected.status === 301 && first.location && /\bnoindex\b/i.test(r.xRobotsTag ?? '')) errors.push({ url: r.url, error: 'destino noindex no cabecalho' });
      if (r.contentType?.includes('text/html')) {
        entry.html = inspectInitialHtml(body);
        if (first.location && entry.html.robots.some(v => /\bnoindex\b/i.test(v))) errors.push({ url: r.url, error: 'redirect termina em pagina noindex' });
        if (entry.html.h1.length !== 1) warnings.push({ url: r.url, error: 'quantidade de H1 diferente de 1', count: entry.html.h1.length });
        if (entry.html.schemas.some(s => s.invalidJson)) warnings.push({ url: r.url, error: 'JSON-LD invalido' });
        if (entry.html.images.some(i => !i.alt || !i.width || !i.height)) warnings.push({ url: r.url, error: 'imagem sem alt ou dimensoes' });
        for (const href of entry.html.links) {
          try { discover(new URL(href, r.finalUrl).href, r.url); }
          catch { warnings.push({ url: r.url, error: 'link invalido no HTML inicial', href }); }
        }
      }
    }
  }
  if (done.size < discovered.size) unavailable.push({ error: 'limite de paginas atingido; inventario parcial' });
  const observed = pages.filter(p => !p.unavailable);
  const migrated = observed.filter(p => p.matchesPreparedRule).length;
  const state = !observed.length ? 'unobservable' : migrated === observed.length ? 'active' : migrated ? 'partial' : 'inactive';
  if (state !== 'active') warnings.push({ error: 'migracao nao comprovada para todas as URLs; nenhuma alteracao de DNS/hospedagem realizada', state });
  return { checkedAt: new Date().toISOString(), state, discoveryComplete: unavailable.length === 0, scope: 'sitemaps e links consultados, mais inventario historico conhecido; nao garante todas as URLs historicas', robots: { ...robots, body: robots.body?.slice(0, 10000) }, sitemaps: sitemapReports, pages, errors, unavailable, warnings };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2); const output = args.includes('--output') ? args[args.indexOf('--output') + 1] : undefined;
  const report = await auditMigration();
  if (output) writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
  const summary = `Blog migration: ${report.state}; ${report.pages.length} URLs; ${report.errors.length} errors; ${report.unavailable.length} observation limits.\n`;
  console.log(summary);
  if (process.env.GITHUB_ACTIONS && report.state !== 'active') console.log('::warning::Blog migration is not confirmed active. Review the JSON artifact before any hosting decision.');
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + 'Inactive/partial requires migration review; exit 0 does not mean migration active. See JSON artifact.\n');
  process.exitCode = report.errors.length ? 1 : report.unavailable.length ? 2 : 0;
}

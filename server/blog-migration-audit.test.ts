import { describe, expect, it } from 'vitest';
import { auditMigration, expectedRedirect, inspectInitialHtml, readPublic, sitemapLocations } from '../scripts/audit-blog-migration.mjs';
import { POSTS_MIGRADOS, POSTS_REMOVIDOS, resolverBlogSubdominio } from './_core/blog-subdominio';
const old = 'https://blog.totalquality.med.br';
const main = 'https://totalquality.med.br';
const html = '<html><head><title>Artigo</title><meta name="description" content="Guia"><link rel="canonical" href="'+main+'/blog"><script type="application/ld+json">{"@type":"BlogPosting"}</script></head><body><h1>Artigo</h1><p>Conteudo real do servidor</p></body></html>';
const response = (body: string, status = 200, headers = {}) => new Response(body, { status, headers: { 'content-type': 'text/html', ...headers } });

describe('Inventario publico da migracao do blog', () => {
  it('separa URLs HTML de image:loc mesmo quando a imagem vem antes da URL', () => {
    expect(sitemapLocations('<urlset xmlns:image="images"><url><image:image><image:loc>https://cdn/image.webp</image:loc></image:image><loc>'+old+'/posts/a</loc></url></urlset>')).toEqual({ isIndex: false, urls: [old+'/posts/a'] });
    expect(sitemapLocations('<sm:sitemapindex xmlns:sm="sitemap"><sm:sitemap><sm:loc>'+old+'/sitemaps/a.xml</sm:loc></sm:sitemap></sm:sitemapindex>')).toEqual({ isIndex: true, urls: [old+'/sitemaps/a.xml'] });
    expect(() => sitemapLocations('<html>anti-bot</html>')).toThrow('XML');
  });
  it('mantem o contrato identico ao resolver usado pelo servidor', () => {
    for (const path of ['/', '/category/dicas-de-saude', ...Object.keys(POSTS_MIGRADOS).map(s=>'/posts/'+s), ...[...POSTS_REMOVIDOS].map(s=>'/posts/'+s)]) {
      expect(expectedRedirect(path)).toEqual(resolverBlogSubdominio(path));
      expect(expectedRedirect(path+'/')).toEqual(resolverBlogSubdominio(path+'/'));
    }
  });
  it('publicar um rascunho muda o destino sem alterar o auditor', () => {
    const slug = 'ultrassom-de-tireoide';
    const path = '/posts/ultrassom-de-tireoide-para-que-serve-e-como-e-feito';
    const post = { slug, draft: true, examPages: ['/exames/ultrassonografia'] };
    expect(expectedRedirect(path, [post])).toEqual(resolverBlogSubdominio(path, [post]));
    expect(expectedRedirect(path, [{...post, draft: false}])).toEqual({ status: 301, location: main+'/blog/'+slug });
  });
  it('nao conta texto dos scripts como conteudo inicial e registra falhas editoriais', () => {
    const page = inspectInitialHtml(html.replace('</body>', '<h1>Duplicado</h1><img src="/a.webp"><script>'+('fantasma '.repeat(300))+'</script></body>'));
    expect(page.h1).toHaveLength(2);
    expect(page.initialBodyWords).toBeLessThan(20);
    expect(page.schemas).toEqual([{ '@type': 'BlogPosting' }]);
    expect(page.images[0].width).toBeUndefined();
  });
  it('preserva a cadeia real e detecta loop sem inventar status final', async () => {
    const result = await readPublic(old+'/', async () => response('', 301, { location: old+'/' }));
    expect(result.chain).toEqual([{url: old+'/', status:301, location: old+'/'}]);
    expect(result.unavailable).toContain('loop');
    expect(result.finalStatus).toBeUndefined();
  });
  it('separa erro de rede e anti-bot de defeito de pagina', async () => {
    const denied = await readPublic(old+'/', async () => { throw new Error('blocked proxy'); });
    expect(denied.unavailable).toBe('blocked proxy');
    expect(denied.chain).toEqual([]);
    const bot = await readPublic(old+'/', async () => response('Checking your browser'));
    expect(bot.unavailable).toContain('anti-bot');
    expect(bot.finalStatus).toBe(200);
  });
  it('nao segue redirects externos', async () => {
    const visited: string[] = [];
    const r = await readPublic(old+'/', async (url: string) => { visited.push(url); return response('',301,{location:'https://external.invalid/'}); });
    expect(visited).toEqual([old+'/']);
    expect(r.unavailable).toContain('fora dos dois dominios');
  });
  const fetcher = (mode: string) => async (url: string) => {
    if (url.endsWith('/robots.txt')) return response('Sitemap: '+old+'/sitemap.xml',200,{'content-type':'text/plain'});
    if (url.endsWith('/sitemap.xml')) return response('<sitemapindex><sitemap><loc>'+old+'/posts.xml</loc></sitemap></sitemapindex>',200,{'content-type':'application/xml'});
    if (url.endsWith('/posts.xml')) return response('<urlset><url><loc>'+old+'/</loc><image:loc>https://cdn/image.webp</image:loc></url></urlset>',200,{'content-type':'application/xml'});
    if (url === old+'/') {
      if (mode === 'inactive') return response(html);
      if (mode === 'blocked') throw new Error('network blocked');
      return response('', mode === 'wrong' ? 302 : 301, {location:main+'/blog'});
    }
    return response(html);
  };
  it('nao confunde migracao preparada com ativa nem inclui imagens como paginas', async () => {
    const r = await auditMigration({fetcher:fetcher('inactive'), seeds:[]});
    expect(r.state).toBe('inactive');
    expect(r.pages.map(p=>p.url)).toEqual([old+'/']);
    expect(r.errors).toEqual([]);
    expect(r.warnings.some(w=>w.state === 'inactive')).toBe(true);
  });
  it('exige 301, destino certo e um salto para comprovar ativacao', async () => {
    const active = await auditMigration({fetcher:fetcher('active'), seeds:[]});
    expect(active.state).toBe('active');
    expect(active.errors).toEqual([]);
    const wrong = await auditMigration({fetcher:fetcher('wrong'), seeds:[]});
    expect(wrong.state).toBe('inactive');
    expect(wrong.errors[0].error).toContain('difere');
  });
  it('explicita inventario parcial e nao inventa metadados sob bloqueio', async () => {
    const r = await auditMigration({fetcher:fetcher('blocked'), seeds:[]});
    expect(r.state).toBe('unobservable');
    expect(r.discoveryComplete).toBe(false);
    expect(r.pages[0].html).toBeUndefined();
  });
  it('nao aceita destino noindex como migracao saudavel', async () => {
    const r = await auditMigration({seeds:[], fetcher:async (url: string) => url === main+'/blog' ? response(html.replace('</head>', '<meta name="robots" content="noindex"></head>')) : fetcher('active')(url)});
    expect(r.errors.some(e=>e.error.includes('noindex'))).toBe(true);
  });
});

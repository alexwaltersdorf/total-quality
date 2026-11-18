import { describe, expect, it } from 'vitest';
import { inspectHtml } from '../scripts/audit-seo.mjs';
import { getRouteMetadata } from './_core/routes-metadata';
import { getSeoContentForPath } from './_core/seo-content';
import { examesData } from '../client/src/lib/examesData';

const page = `<html><head><title>Exame</title><meta name="description" content="Descricao">
<link rel="canonical" href="https://totalquality.med.br/exames/hemograma">
<script type="application/ld+json">{"@type":"MedicalWebPage"}</script>
</head><body><div id="root"><h1>Hemograma</h1><p>${'conteudo '.repeat(90)}</p></div></body></html>`;

describe('SEO public-page audit', () => {
  it('keeps server and client descriptions aligned for the local hemogram service', () => {
    expect(getRouteMetadata('/exames/hemograma')?.description)
      .toBe(examesData.find(e => e.slug === 'hemograma')?.metaDescription);
  });
  it('does not reintroduce universal fasting or outdated clinical guidance in the served HTML', () => {
    const service = getSeoContentForPath('/exames/exames-de-sangue')!;
    expect(service).not.toContain('perfil lipídico exigem jejum de 8 a 12 horas');
    const hypo = getSeoContentForPath('/blog/hipoglicemia-sintomas-e-exames')!;
    expect(hypo).not.toContain('Curva glicêmica com coletas seriadas');
    expect(hypo).toContain('desaconselha');
    const choice = getSeoContentForPath('/blog/como-escolher-laboratorio-analises-clinicas')!;
    expect(choice).not.toContain('302/2005');
    expect(choice).toContain('978/2025');
  });
  it('accepts a populated, indexable page with its own canonical', () => {
    expect(inspectHtml(page, '/exames/hemograma').errors).toEqual([]);
  });
  it('detects SPA fallback canonical, empty content and robots regressions', () => {
    const broken = page.replace('/exames/hemograma', '/')
      .replace('content="Descricao"', 'content=""')
      .replace('</head>', '<meta name="robots" content="noindex,follow"></head>')
      .replace('conteudo '.repeat(90), '');
    expect(inspectHtml(broken, '/exames/hemograma').errors).toEqual(expect.arrayContaining([
      'canonical divergente', 'description ausente, vazia ou duplicada',
      'noindex em pagina publica', 'conteudo prerenderizado insuficiente',
    ]));
  });
  it('rejects duplicate headings and invalid schema', () => {
    const broken = page.replace('</body>', '<h1>Outro</h1></body>').replace('{"@type":"MedicalWebPage"}', '{broken');
    expect(inspectHtml(broken, '/exames/hemograma').errors).toEqual(expect.arrayContaining(['H1 ausente, vazio ou duplicado', 'JSON-LD invalido']));
  });
});

# Padrões de SEO — Total Quality Medicina Diagnóstica

**Última atualização:** 15 de novembro de 2026 (SEO nov/2026, Fase 7 — `docs/seo-relatorio.md`).
A versão de 16/07/2026 recomendava `keywords`, og:image no CloudFront e listava rotas que
não existem mais (mamografia, ecocardiograma, densitometria, teste de esforço, Outubro Rosa).

Os testes em `server/*.test.ts` são o contrato; este documento explica o porquê. Se os dois
divergirem, vale o teste — e este arquivo deve ser corrigido.

---

## Como o HTML de cada rota é montado

| Grupo de rotas | Corpo do `#root` | Arquivo |
|---|---|---|
| `/exames/:slug`, `/especialidades`, `/especialidades/:slug`, `/laboratorio-caraguatatuba`, `/checkup`, `/bioimpedancia`, `/sobre`, `/contato` | **SSR do próprio React** (`renderToString`) e `hydrateRoot` no navegador — o Google e o paciente leem o mesmo HTML | `client/src/entry-server.tsx` (`isSsrPath`), `server/_core/seo-content.ts` (`getSsrPage`), `client/src/main.tsx` |
| home, `/exames`, `/blog`, `/blog/:slug`, `/convenios`, `/privacidade` | bloco pré-renderizado à mão; o React monta por cima | `server/_core/seo-content.ts` (`getSeoContentForPath`) |
| `/cartao` | **sem conteúdo no HTML do servidor** (só o React) — pendência, ver `docs/seo-relatorio.md` | — |

- **Meta tags** (title, description, canonical, og:*, robots): `server/_core/routes-metadata.ts`
  (`getRouteMetadata`, `injectMetaTags`), injetadas por `server/_core/vite.ts`.
- **Uma fonte só para title/description:** páginas de exame e especialidade leem
  `metaTitle`/`metaDescription` de `client/src/lib/examesData.ts` e
  `especialidadesData.ts`; home, laboratório, check-up, bioimpedância, blog, sobre, contato e
  especialidades leem constantes de `shared/const.ts`; artigos, `metaTitle`/`metaDescription`
  (ou `excerpt`) do `client/src/content/blog/index.json`. O React não pode trocar o que o
  servidor mandou — `scripts/auditoria-sitemap.mjs` compara os dois em toda URL do sitemap.
- **Conteúdo das páginas de serviço:** dados em `client/src/lib/paginas/*.ts` e
  `client/src/lib/paginasServico.ts`, desenhados pelo componente `PaginaServico`.
  Bloco sem fato verificado não é publicado: fica um `// TODO(alex): ...` no dado.
- **JSON-LD:** sempre no `<head>`, uma cópia por rota (`server/dados-estruturados.test.ts`).
- **Sitemap:** `server/_core/sitemap-handler.ts`, 49 URLs em 15/11/2026, todas com `lastmod`
  real; nenhuma URL que redireciona.

## Como adicionar uma página

1. **Exame ou consulta:** acrescentar o item em `examesData.ts`/`especialidadesData.ts` e o
   conteúdo em `lib/paginas/exames.ts`/`especialidades.ts`. Rota, SSR, sitemap, hub, JSON-LD e
   meta tags saem do dado. Texto médico só com fonte no repositório.
2. **Outra página:** rota em `client/src/App.tsx`; metadados em `staticRoutes`
   (`routes-metadata.ts`) com `lastmod`; conteúdo no servidor (SSR em `entry-server.tsx` ou
   pré-render em `seo-content.ts` — o guard-rail falha se a rota do sitemap vier vazia).
3. Rodar `pnpm vitest run`, `pnpm build && pnpm start` e
   `node scripts/auditoria-sitemap.mjs http://localhost:3000` (e
   `scripts/paridade-ssr.mjs` para rotas de SSR).

```typescript
// staticRoutes em server/_core/routes-metadata.ts
"/nova-rota": {
  title: "Nova Página em Caraguatatuba | Total Quality", // até 60 caracteres
  description: "…",                                      // 120 a 160 caracteres
  ogImage: "https://totalquality.med.br/images/fachada-1024.webp", // domínio próprio
  canonical: "https://totalquality.med.br/nova-rota",    // a própria URL, sem barra final
  priority: 0.8,
  changefreq: "monthly",
  lastmod: "2026-11-15",
},
```

**Não existe mais `keywords`:** `<meta name="keywords">` foi removido do template e do
`injectMetaTags` (Fase 6) — o Google o ignora e ele só expunha a estratégia. Não reintroduzir.

## Checklist de cada página (o que a auditoria confere)

- [ ] status 200 e nenhum redirecionamento; canonical = a própria URL (https, sem www, sem barra final)
- [ ] um único `<h1>`; nas páginas de serviço, "[Nome] em Caraguatatuba" (caixa alta só no CSS)
- [ ] title ≤ 60 caracteres, único; description 120–160, única; iguais no servidor e no React
- [ ] JSON-LD válido, no `<head>`, sem entidade duplicada; FAQPage = FAQ visível
- [ ] link de WhatsApp `https://api.whatsapp.com/send?phone=551238873535…` (nunca `wa.me`) com evento
- [ ] páginas de serviço com o botão "Ligar" — **é um `<button>` que abre o formulário de
      qualificação antes da ligação** (decisão do Alex, 15/11/2026; guard-rail em
      `server/seo-content.test.ts`), não um link `tel:` direto
- [ ] toda `<img>` com `alt`, `width` e `height`; imagens no domínio próprio
- [ ] og:image no domínio próprio (`/images/…`), nunca CloudFront/S3
- [ ] sem preço, superlativo, promessa de prazo ("24 horas"), comparação ou depoimento (CFM 2.336/2023)

## Boas práticas de texto

- Title: "[Exame] em Caraguatatuba | Total Quality". Ex.: "Hemograma Completo em
  Caraguatatuba | Total Quality". Nada de "última geração", "o melhor", "mais completo".
- Description: o que a pessoa descobre na página e o próximo passo ("Tire dúvidas pelo
  WhatsApp"). Resultado é "em curto prazo", nunca "24 horas" ou "rápido".
- Só serviços que a clínica realiza. **Não realiza:** ecocardiograma, mamografia, ressonância,
  endoscopia, colonoscopia, teste ergométrico (esforço) — e não se cria página "não fazemos X".
  Densitometria óssea não tem página (a lista de jul/2026 a citava por engano).

## Rotas atuais (15/11/2026)

- Institucionais: `/`, `/sobre`, `/contato`, `/convenios`, `/privacidade`, `/cartao`, `/blog`.
- Serviços: `/exames` (hub), 13 em `/exames/:slug` (exames-de-sangue, hemograma,
  tomografia-computadorizada, raio-x, ultrassonografia, exame-admissional, mapa, holter,
  espirometria, eletrocardiograma, eletroencefalograma, exame-toxicologico, sexagem-fetal),
  `/especialidades` (hub) e 5 em `/especialidades/:slug` (endocrinologista,
  gastroenterologista, medicina-do-trabalho, cardiologista, pediatra),
  `/laboratorio-caraguatatuba`, `/checkup`, `/bioimpedancia`.
- Blog: `/blog/:slug`, fonte única em `client/src/content/blog/index.json`. Rascunho
  (`draft: true`) responde 200 com `noindex` e fica fora do sitemap.
- **Removidas com 301** (`server/_core/legacy-redirects.ts`): `/exames/mamografia` e
  `/outubro-rosa` → `/exames/ultrassonografia`; `/posts/*` e `/category/*` → artigo
  equivalente ou `/blog`; `/about-us`, `/contact-us` → `/sobre`, `/contato`; os artigos
  consolidados em 22/10/2026. `/faq` responde 410.
- Redirecionamento em **um salto só**: http/www/barra final/destino legado saem num único 301
  com a query string (`server/_core/index.ts`). O salto http→https da CDN da Hostinger
  (mantendo o www) é configuração do hPanel, fora do repositório.

## Verificação

```bash
pnpm build && pnpm start
node scripts/auditoria-sitemap.mjs http://localhost:3000   # todas as URLs do sitemap
node scripts/paridade-ssr.mjs http://localhost:3000        # servidor x DOM hidratado
curl -s http://localhost:3000/robots.txt                   # bloqueia /admin, /api, /dashboard
```

No Search Console, depois do deploy: Indexação → Páginas ("Duplicada sem canônica",
"Página com redirecionamento", 404), Sitemaps e Melhorias (FAQ, Breadcrumb).

---

## Regras permanentes de SEO técnico (auditorias jul/2026 — NÃO regredir)

Estas regras vieram das auditorias PageSpeed/SEMrush de jul/2026 e estão protegidas
por testes em `server/seo-content.test.ts`:

1. **Toda rota do sitemap DEVE ter conteúdo pré-renderizado.** O site é uma SPA;
   sem o bloco injetado por `server/_core/seo-content.ts` dentro do `#root`, o
   Google recebe HTML vazio e a página não rankeia. Ao criar uma página nova:
   metadata em `routes-metadata.ts` + conteúdo em `seo-content.ts` (o teste
   guard-rail falha se esquecer). *Desde nov/2026 (Fase 1)* as rotas de serviço,
   `/sobre`, `/contato` e `/especialidades` vêm do SSR do próprio React
   (`entry-server.tsx`) com hidratação — o pré-render à mão ficou só para home,
   `/exames`, blog, convênios e privacidade. Exceção conhecida: `/cartao`.
2. **Uma intenção de busca por página (sem canibalização).** Home = "laboratório
   em caraguatatuba" (e "laboratório"); `/laboratorio-caraguatatuba` = "análises
   clínicas"; cada `/exames/:slug` = o nome do exame. Não repetir o mesmo
   título-alvo em duas páginas — **nem no servidor, nem no React**: título,
   description e H1 da home e da landing vêm de `shared/const.ts`
   (`HOME_TITLE`, `HOME_H1`, `ANALISES_TITLE`…). Até out/2026 a landing dizia
   "Análises Clínicas" ao robô e "Laboratório em Caraguatatuba" depois do JS.
   Quem é dona de um termo se decide por Search Console (90 dias, por página),
   nunca por opinião: em 16/10/2026 a home era a URL escolhida pelo Google
   para "laboratório caraguatatuba" (posição ~3–4) e a URL do perfil do Google.
3. **H1 limpo, sem marca empilhada.** A marca vai no `<title>` (após o pipe),
   nunca dentro do `<h1>`.
4. **robots.txt não bloqueia crawlers de IA** (GPTBot/CCBot liberados — o site já
   aparece em respostas de LLMs). Mudar isso só com decisão explícita do negócio.
5. **Rotas inexistentes retornam HTTP 404 real** (`resolveHttpStatus`), nunca 200
   com a homepage.
6. **Imagens**: toda imagem passa por `scripts/optimize-images.mjs` (AVIF + WebP,
   variantes 480/768/1024/1440/1920) e é exibida pelo componente
   `<ResponsiveImage>`, que emite `<picture>` com `srcset`, `sizes` e
   `width`/`height` explícitos. Servidas de `/public/images` no próprio domínio —
   **nunca** referenciar PNG/JPG de CDN externo: os objetos do bucket S3 voltam
   como `application/octet-stream` e sem `Cache-Control`. Só o LCP usa
   `priority` (eager + fetchpriority=high); todo o resto é lazy.
   Scripts de terceiros carregam no idle ou na primeira interação — nunca no
   caminho crítico.
7. **Domínio canônico**: `https://totalquality.med.br` (sem www) — o middleware
   301 em `server/_core/index.ts` consolida; manter.
8. **Silo de análises clínicas**: hub `/exames` organiza as páginas de exame e
   distribui links internos. Novos exames entram em `client/src/lib/examesData.ts`
   (o hub, a página, o sitemap e a pré-renderização são gerados automaticamente).
9. **Artigos de blog em JSON**: o corpo dos artigos fica em
   `client/src/content/blog/<slug>.json` (um arquivo por artigo) e os metadados
   em `index.json`. O corpo é carregado sob demanda via `loadBlogPost()` — nunca
   voltar a embutir texto de artigo em `.ts`, era ~33 KB no chunk inicial de
   todas as páginas. O servidor lê os mesmos JSONs para pré-renderizar.
10. **Mapa**: iframe estático com `loading="lazy"`. Não reintroduzir a Google
    Maps JS API por proxy de terceiros — a anterior
    (`forge.butterfly-effect.dev`) saiu do ar e deixou o mapa quebrado em
    produção.
11. **URLs legadas**: toda URL que o Google já conhece e que deixou de existir
    entra em `server/_core/legacy-redirects.ts` — 301 para o equivalente atual,
    410 para artefato de link quebrado. Nunca deixar cair no catch-all da SPA:
    era a origem de 13 soft 404 (auditoria do Search Console, jul/2026).
12. **Schema.org sem placeholder**: não declarar `SearchAction`/`potentialAction`
    sem um endpoint de busca real. O `target` com `{search_term_string}` foi
    rastreado literalmente e a URL-fantasma `/blog?q=%7Bsearch_term_string%7D`
    acabou indexada no lugar do hub `/blog`. `robots.txt` bloqueia `/*?q=`.
13. **Fontes self-hosted**: Bebas Neue e DM Sans vêm de `/public/fonts`, com
    `@font-face` em `client/src/index.css`. Nunca voltar a apontar para
    `fonts.googleapis.com`/`fonts.gstatic.com` — eram dois `preconnect`, duas
    conexões TLS e uma folha de terceiro no caminho crítico. DM Sans é variável
    (300..700) e cobre todos os pesos usados; só o subset `latin` recebe
    `preload`. Para atualizar, baixar de novo os `.woff2` apontados pela API do
    Google Fonts e manter os `unicode-range` originais.
14. **CSS não bloqueante**: o plugin `nonBlockingCss` (vite.config.ts) converte o
    `<link rel=stylesheet>` do Vite em `preload as=style` + promoção no `onload`,
    com fallback em `<noscript>`. Consequência: **tudo que o bloco
    pré-renderizado precisa para pintar certo tem que estar no `<style>` inline
    do `client/index.html`** — a preflight do Tailwind chega depois. Ao mexer no
    HTML pré-renderizado, conferir se o estilo correspondente está inline.
    *Nov/2026 (Fase 1):* nas rotas de SSR a folha de estilo volta a ser
    bloqueante (`seo-content.ts`), porque o HTML do React precisa do Tailwind no
    primeiro paint — sem isso o CLS só trocaria de causa.
15. **Contraste WCAG AA**: os tokens `text`, `text-light` e `text-muted` estão
    calibrados para passar 4,5:1 sobre os três fundos do site (branco,
    `surface-light` 0.97 e `surface-dark` 0.94, que é o rodapé). Não clarear:
    `text-muted` já foi `#8f8f8f` (3,23:1) e reprovava na auditoria. Os cálculos
    estão no comentário do bloco em `client/src/index.css`.
16. **`aria-label` contém o texto visível**: em qualquer botão ou link com texto,
    o nome acessível precisa começar pelo texto visível, senão o Lighthouse
    acusa `label-content-name-mismatch` e o controle por voz não alcança o
    elemento. Rótulo só descritivo vale apenas para controle com ícone puro.
17. **Nada de `<img>` ou `<iframe>` dentro do `<head>`**: os `noscript` de pixel
    e de tag manager vão no início do `<body>`. Dentro do head o parser fecha a
    seção implicitamente e joga as tags seguintes para o body.
18. **Nunca anunciar serviço não prestado**: listar exame que a clínica não
    realiza viola as diretrizes do Google (risco de suspensão do perfil) e as
    normas do CFM — e, na prática, atrai visita que não converte e piora o sinal
    de engajamento. Hoje estão fora: **ressonância magnética** (decisão de
    29/07/2026), **ecocardiograma** (01/08/2026 — a clínica pretende oferecer no
    futuro; ao passar a oferecer, remover do guard-rail ANTES de anunciar),
    **mamografia** (31/10/2026, 301 para ultrassonografia), endoscopia,
    colonoscopia e teste ergométrico. Cardiologista e pediatra **são** atendidos
    (decisão de 14/11/2026). O
    teste `nunca anunciar servico nao prestado` em `server/seo-content.test.ts`
    varre todas as rotas do sitemap e falha se algum termo reaparecer. Ele já
    pegou duas menções que a busca manual não achou.
19. **Menção a exame é link, não texto**: qualquer lugar do site que cite um
    exame com página própria deve linkar para ela — no React com `<Link>` do
    wouter (renderiza `<a href>` rastreável e mantém navegação client-side) e no
    HTML pré-renderizado com `<a href>` direto. Item sem página fica como texto:
    **só linkar destino que existe**, porque link para rota inexistente cai no
    404 real e desperdiça rastreamento, o que é pior do que não ter link. O
    guard-rail extrai todo `href` de todas as rotas pré-renderizadas e exige
    `resolveHttpStatus` = 200.
20. **A home é a fonte de autoridade interna**: o bloco pré-renderizado de `/`
    precisa linkar todas as páginas de exame. Se ela parar de linkar, todas elas
    perdem a principal fonte de autoridade do site. Há teste específico para isso.
21. **`express.static` com `index: false`**: sem isso o Express responde `/` com
    o `index.html` cru e curto-circuita o catch-all que injeta meta tags por rota
    e o conteúdo pré-renderizado — a home ficava com o `<div id="root">` vazio
    enquanto todas as outras rotas recebiam tudo. Descoberto em 01/08/2026 por
    curl na home; o teste unitário não pegava porque exercitava
    `getSeoContentForPath("/")` isolado, sem passar pelo servidor. **Ao mexer no
    `serveStatic`, conferir a home por curl, não só por teste.**
22. **Regra de ouro — os cinco indicadores do Google** ("Como a Pesquisa Google
    determina a classificação de resultados"): **significado** (a intenção, que
    para "laboratório" é local e transacional), **relevância** (o termo no título
    e no corpo, com conteúdo útil ao redor — não repetição), **qualidade**
    (conhecimento, legitimidade e confiabilidade: responsável técnico
    identificado, só fatos verificáveis, links de sites legítimos), **usabilidade**
    (celular e velocidade desempatam) e **contexto** (local e personalização —
    não existe "1º lugar" único; medir por Search Console e grade). Toda
    mudança precisa melhorar um indicador sem piorar outro, e nunca às custas da
    verdade: nada de "última geração", "mais completo", nota declarada pelo site
    ou "diversos convênios" (são três, `CONVENIOS_TEXTO`). Um único nó de
    negócio no JSON-LD (`#medicalbusiness`, com `DiagnosticLab` e `hasMap`).
    Travas em `server/regra-ouro-ranking.test.ts`. Documento completo, com os
    dados de out/2026: `REGRA-OURO-RANKING-GOOGLE.md` no repositório
    `SEO---Total-Quality`.

23. **Artigo de saúde nasce rascunho** (out/2026): todo artigo novo entra em
    `client/src/content/blog/` com `"draft": true` e `"reviewStatus":
    "revisao_medica_pendente"`. Rascunho abre pela URL com `noindex, nofollow`
    (para revisão), mas fica fora do sitemap, da listagem, da home, dos
    relacionados e de qualquer link de página publicada. Publicar = `draft:
    false`, `reviewStatus: "aprovado"` e `lastReviewed` preenchido, sem
    marcador `{{PRAZO}}` pendente. Metadados da rota vêm do `index.json`
    (`metaTitle` = `<title>` no prerender e no React); `lastmod` do sitemap só
    com data real (`dateModified`). Schema do artigo: `BlogPosting` com
    `publisher` → `#medicalbusiness` e `MedicalWebPage` sobre `MedicalTest`.
    O quadro de contato (`ExamCTA`) nunca diz "agende" para coleta
    laboratorial. Travas em `server/blog-exames.test.ts`.

24. **Blog: uma URL por intenção, e do artigo para o exame** (out/2026, system prompt do
    blog de 21/10): busca com "Caraguatatuba" pertence à página `/exames/` (ou à landing);
    artigo de blog não leva o nome da cidade no title nem no H1 quando existe página de
    serviço equivalente — a ligação local fica no quadro de contato (`ExamCTA`), que entra
    no meio e no fim de todo artigo publicado, com botão para a página do exame
    (`examPages`) e WhatsApp. Artigo que disputa a intenção de uma página de serviço é
    consolidado nela com 301, levando antes o conteúdo útil. Autoria é a clínica; o topo
    mostra "Revisado por Dr. Alex Waltersdorf - 267.339" e "Publicado em/Atualizado em" com
    `<time datetime>` (nov/2026, Fase 4; nunca em rascunho). Link de WhatsApp só por `whatsappUrl()` (api.whatsapp.com, fixo
    (12) 3887-3535) — nunca `wa.me`. Relatório: `docs/seo-blog-2026-10-22.md`. Travas em
    `server/blog-exames.test.ts` e `server/seo-content.test.ts`.

25. **Regra do pixel em toda atualização, a começar pelo blog** (decisão do Alex,
    29/10/2026, depois da perícia de rastreamento de 28/10): toda página nova ou
    alterada mantém a medição completa — CTA por `tracking.ts`, conversão no
    envio do formulário com `event_id`, evento novo também no regex do GTM,
    consentimento negado por padrão. **No blog:** contato só pelo `ExamCTA`;
    nenhum link de WhatsApp, `tel:`, `wa.me` ou mapa no corpo do artigo; todo
    artigo com `examType`, e o publicado também com `examPages`; nada de script ou pixel no JSON.
    Detalhe nos itens 8 a 13 da seção "Rastreamento" do `CLAUDE.md`. Travas em
    `server/rastreamento-100.test.ts`.

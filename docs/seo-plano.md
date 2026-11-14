# Plano de otimização de SEO — nov/2026 (Fase 0)

**Status:** aguardando aprovação do Alex. Nenhum código foi alterado nesta fase.
**Branch:** `seo/otimizacao-nov-2026` (a partir de `origin/main` em `fc5bfe0`, merge do PR #104).
**Base:** briefing de 14/11/2026 (decisões da seção 3 preenchidas pelo Alex), `CLAUDE.md`,
`SEO_STANDARDS.md` (desatualizado em parte — ver §9) e os guard-rails em `server/*.test.ts`.

Objetivo do projeto: mais cliques orgânicos e mais contatos por WhatsApp/telefone. Não é
redesign: identidade visual, componentes e URLs ficam; cada critério de aceite recebe a
menor mudança que o cumpre.

---

## 1. Mapa do código (onde cada coisa vive)

| Peça | Arquivo | Observação |
|---|---|---|
| Router (wouter, rotas em `React.lazy`) | `client/src/App.tsx:29-57` | `Home` em import estático (`:9`); `/especialidades/:slug` reusa `ExamePage` (`:41`); não existe `/especialidades`, `/sobre` nem `/contato` |
| Montagem do React | `client/src/main.tsx:55` | `createRoot().render()` — **sem hidratação**: o React apaga o HTML do servidor e redesenha |
| Dados de exame | `client/src/lib/examesData.ts` (interface `ExamData` em `:19-39`, 13 exames) | `title` já vem em CAIXA ALTA no dado (ex.: `:424` "HEMOGRAMA COMPLETO") |
| Dados de especialidade | `client/src/lib/especialidadesData.ts` (3 páginas, mesmo `ExamData`) | endocrinologista, gastroenterologista, medicina-do-trabalho |
| Template de exame (React) | `client/src/pages/ExamePage.tsx` | |
| Hooks de head/JSON-LD no cliente | `client/src/components/SEOHead.tsx`, `client/src/hooks/useSchemaLocalBusiness.ts` | |
| Meta tags por rota (servidor) | `server/_core/routes-metadata.ts` (`injectMetaTags` em `:599-698`) | duplica title/description de `examesData` (ver §2, item 1d) |
| Corpo pré-renderizado (servidor) | `server/_core/seo-content.ts` (`renderExamHtml` `:270-331`, `getSeoContentForPath` `:531-565`, `resolveHttpStatus` `:913-947`) | HTML escrito à mão, paralelo ao React |
| Injeção no HTML | `server/_core/vite.ts:45-56` (dev) e `:91-106` (produção) | |
| Servidor Express (redirects, cache, robots, sitemap) | `server/_core/index.ts` | robots inline `:251-265`; sitemap `:245-248` gerado **a cada requisição** |
| Sitemap | `server/_core/sitemap-handler.ts` | |
| Redirecionamentos legados | `server/_core/legacy-redirects.ts` | |
| llms.txt | `client/public/llms.txt` | |
| Formulário de qualificação (todo CTA passa por ele) | `client/src/contexts/ContatoLeadContext.tsx` | |
| Eventos | `client/src/lib/tracking.ts` | `whatsapp_click` em `trackWhatsAppConversion` (`:163`) |
| Guard-rails de SEO/CFM/rastreamento | `server/seo-content.test.ts` (1.769 linhas), `server/rastreamento-100.test.ts`, `server/regra-ouro-ranking.test.ts`, `server/blog-exames.test.ts`, `server/schema-semrush.test.ts` | "se falhar, corrigir o código — nunca afrouxar o teste" |
| Blog | `client/src/content/blog/*.json` + `index.json` (43 artigos, 27 com `examPages`) ; `client/src/pages/BlogPost.tsx`; `client/src/lib/blogMeta.ts`; `client/src/lib/examBlogLinks.ts` | o mapa artigo → página de serviço **já existe** no campo `examPages` |

---

## 2. Afirmações do briefing: confirmadas ou refutadas

Legenda: ✅ confirmada · ❌ refutada · ⚠️ parcialmente / com ressalva. "prod" = medido em
https://totalquality.med.br em 14/11/2026 com `curl` sem compressão.

### 2.1 Arquitetura e rastreamento

| # | Afirmação | Veredito | Evidência |
|---|---|---|---|
| a | SPA React+Vite servida por Express | ✅ | `vite.config.ts`, `server/_core/index.ts`, `vite.ts:68-107` |
| b | Servidor injeta HTML de SEO por rota dentro do `#root` (title, description, canonical, JSON-LD, corpo simplificado) e o React substitui | ✅ | `vite.ts:91-102`; `seo-content.ts:862-875` (`<main class="seo-prerender">`); JSON-LD dentro do corpo `seo-content.ts:157-165`; substituição por `createRoot` em `main.tsx:55` |
| c | GTM-WLR7JD57 via gateway first-party `/metrics/` | ✅ | `client/index.html:43-55` (`j.src='/metrics/?id='+i`); proxy em `server/_core/tag-gateway.ts`; prod `/metrics/?id=GTM-WLR7JD57` → 200 (532 KB) |
| d | GA4 G-FZH25GKTJ9, Meta Pixel, consentimento padrão negado (`localStorage tq-consent`) | ✅ | `index.html:16-30`; IDs em `CLAUDE.md` (regra 2); Pixel só dentro do GTM |
| e | Evento-chave `whatsapp_click` | ✅ (com ressalva) | `tracking.ts:163-176`. Ressalva: a **conversão do Ads** é o envio do formulário (`lead_qualificado`, `CLAUDE.md` regra 8); `whatsapp_click` é a intenção |
| f | Meta `clientParamBuilder` carregado cedo | ✅ (fora do repositório) | Não existe no código. Vem do **template do Meta Pixel dentro do contêiner GTM**, que injeta `cdn.jsdelivr.net/npm/meta-capi-param-builder-clientjs/dist/clientParamBuilder.bundle.js` (fallback unpkg) — achado no JS do contêiner servido em `/metrics/?id=GTM-WLR7JD57` |
| g | GTM não pode bloquear a renderização | ✅ já cumpre | `index.html:45` `j.async=true` — não bloqueia; nada a mudar no snippet |

### 2.2 Fase 1 — fonte única de conteúdo

| # | Afirmação | Veredito | Evidência |
|---|---|---|---|
| 1a | `/exames/hemograma`: H1 do servidor "Hemograma Completo em Caraguatatuba" × renderizado "HEMOGRAMA COMPLETO" | ✅ | servidor: `seo-content.ts:271` (deriva do `metaTitle`); prod: `<h1>Hemograma Completo em Caraguatatuba</h1>`. React: `ExamePage.tsx:117-123` usa `exam.title` = `examesData.ts:424` "HEMOGRAMA COMPLETO" |
| 1b | Caixa alta deve vir só do CSS | ⚠️ hoje vem dos dois | `.heading-display { text-transform: uppercase }` em `client/src/index.css:223-225` **e** texto já maiúsculo no dado (`examesData.ts` campos `title`) e no JSX (`ExamePage.tsx:173` `.toUpperCase()`, `:359`) |
| 1c | H2 diferentes e em outra ordem | ✅ | servidor: "O que é / Como funciona / Indicações / Preparo para o exame / Saiba mais no nosso blog / Perguntas frequentes / Onde fazer em Caraguatatuba / Outros exames…" (`seo-content.ts:311-322`). React: "O QUE É O HEMOGRAMA? / QUANDO REALIZAR? / COMO SE PREPARAR / SAIBA MAIS NO NOSSO BLOG / PERGUNTAS FREQUENTES / OUTROS EXAMES / FAÇA SEU HEMOGRAMA SEM AGENDAMENTO" (`ExamePage.tsx:172-384`); "Como funciona" não é H2 no React |
| 1d | Meta description diverge entre servidor e React | ✅ (achado extra) | hemograma: `routes-metadata.ts:159` ≠ `examesData.ts:429`; ultrassonografia: `routes-metadata.ts:82` ≠ `examesData.ts:166`. O React reescreve a description depois de montar (`ExamePage.tsx:36-42`) |
| 1e | "Respostas do FAQ ausentes do DOM" em `/exames/hemograma` | ❌ **refutada** | `ExamePage.tsx:324-337`: cada pergunta é `<details>` com a resposta num `<div>` filho — está no DOM desde o primeiro render (fechado, mas presente). Ressalva: o bloco tem classe `.reveal` (opacidade 0 até o IntersectionObserver). **Onde o FAQ falta de verdade:** `/checkup` (o servidor publica 2 perguntas em `seo-content.ts:638-642`; `CheckUp.tsx` não renderiza FAQ nenhum) e a **home** (FAQPage JSON-LD no pré-render `seo-content.ts:507-524`, nenhum FAQ visível no React) — JSON-LD de FAQ sem FAQ visível contraria a diretriz do Google |
| 1f | Seção "Onde fazer em Caraguatatuba" ausente na página renderizada | ✅ | existe só no servidor (`seo-content.ts:202-215`); `ExamePage.tsx` não tem a seção (o endereço aparece só no `Footer`) |
| 1g | Conteúdo raso | ✅ | palavras no pré-render (prod, incluindo NAP e lista de links): hemograma 616, ultrassonografia 521, raio-x 437, gastroenterologista 640, checkup 340, laboratorio-caraguatatuba 687 |
| 1h | CLS desktop 0,254 | ⚠️ não medido aqui (Lighthouse não roda no sandbox). Causas confirmadas no código: (1) a troca do bloco `.seo-prerender` (68ch, estilos inline `index.html:336-359`) pelo layout do React — leiaute completamente diferente; (2) fontes sem fallback métrico em 6 declarações (PR #68 descreve e corrige) |

### 2.3 Fase 2 — CTAs e navegação

| # | Afirmação | Veredito | Evidência |
|---|---|---|---|
| 2a | "Agendar" é `<button>` sem href | ✅ | `Navbar.tsx:246` (desktop), `:331` (mobile) |
| 2b | "Resultados" é `<button>` | ✅ | `Navbar.tsx:239`, `:341`; destino atual `RESULTADOS_URL = "https://app.totalquality.med.br/"` (`Navbar.tsx:20`), aberto por `window.open` (`:127-132`); prod: 200 (S3) |
| 2c | "Sobre" e "Contato" são `<button>` | ✅ | `Navbar.tsx:22-25` (âncoras `#sobre`/`#contato`), `:178-182`, `:274-283`; no rodapé, `Footer.tsx:97` |
| 2d | "Ligar" é `<button>` | ✅ | `ExamePage.tsx:140`, `:400`; `Navbar.tsx:350`; `Footer.tsx:138` |
| 2e | Todos os botões de WhatsApp são `<button>` sem href | ✅ | 44 pontos de clique em 22 arquivos chamam `openWhatsApp`/`abrirTelefone` (`grep`), todos `<button>`. Ex.: `ExamePage.tsx:133`, `:393`; `WhatsAppFAB.tsx:40`; `Footer.tsx:58`, `:146`; `HeroSection.tsx:61`, `:69`; `ExamCTA.tsx:52` |
| 2f | `/sobre` e `/contato` redirecionam para a home | ✅ | `legacy-redirects.ts:30-31` (`/sobre → /#sobre`, `/contato → /#contato`); prod: 301 → `https://totalquality.med.br/#sobre` |
| 2g | Logo não é link para a home | ✅ (achado extra) | `Navbar.tsx:153-156`: `href="#inicio"` com `preventDefault` |

### 2.4 Fase 3 — template de exame

| # | Afirmação | Veredito | Evidência |
|---|---|---|---|
| 3a | `/especialidades` (índice) responde 404 | ✅ | prod 404; sem rota em `App.tsx`, fora de `CLIENT_ROUTES` (`seo-content.ts:878-898`) |
| 3b | Ultrassonografia: title/H2 não cobrem "ultrassom" | ✅ | `examesData.ts:165` "Ultrassonografia em Caraguatatuba \| Total Quality"; H2 do React "O QUE É A ULTRASSONOGRAFIA?" |
| 3c | Hemograma: página de serviço × artigo `/blog/hemograma-completo-o-que-avalia` | ⚠️ já tratado em parte | 301 de `/blog/hemograma-caraguatatuba` → `/exames/hemograma` (`legacy-redirects.ts:61`); links cruzados existem (`examPages` do artigo e `examBlogLinks.ts`). Falta diferenciar a intenção no texto |
| 3d | Imagens reais disponíveis | ⚠️ | fotos reais em `client/public/images/`: `fachada`, `recepcao`, `laboratorio`, `tomografia`, `cardiologia` (AVIF/WebP em várias larguras). `hero-clinica` é banco de imagem (não usar). Sem foto: raio-x, ultrassom, holter, MAPA, espirometria, EEG, toxicológico, sexagem, admissional, bioimpedância → `TODO(alex)` |
| 3e | Check-up: detalhe por plano existe no repositório | ✅ | `CheckUp.tsx:21-90` (Básico/Select/Premium com listas) — mas o pré-render (`seo-content.ts:620-644`) descreve outra coisa e os números do subtítulo (19/30/39 exames) não batem com as listas |

### 2.5 Fase 4 — blog

| # | Afirmação | Veredito | Evidência |
|---|---|---|---|
| 4a | Sem `<time>` em datas | ✅ | nenhum `<time` em `client/src`; datas como texto em `BlogPost.tsx` e `seo-content.ts:814` |
| 4b | Imagens dos artigos relacionados sem width/height | ✅ | `BlogPost.tsx:311-316` (só `loading="lazy"`); a imagem principal já tem (`:201-205`) |
| 4c | Autor/revisor visível | ⚠️ existe, mas fora do padrão pedido | `BlogPost.tsx:186-187` mostra "autor · cargo" e `linhaRevisao` ("Revisado por Alex Waltersdorf, Responsável Técnico") — `blogMeta.ts:134`. Pedido: "Revisado por Dr. Alex Waltersdorf - 267.339" |
| 4d | CTA contextual no primeiro terço e no fim | ⚠️ existe meio+fim | `ExamCTA` no marcador `[[cta]]` (`BlogPost.tsx:237`) e no fim (`:242`); a posição "meio" depende do marcador no JSON, não do primeiro terço |
| 4e | Arquivo de mapeamento artigo → serviço | ⚠️ já existe | campo `examPages` em `index.json` (27/43 artigos) + `examBlogLinks.ts`. Inconsistência: EAS (exame de urina) aponta para `/exames/exames-de-sangue` |
| 4f | Artigos com muitas impressões e CTR ~0 | (dado do GSC, não verificável aqui) | metaTitles atuais: EAS "Exame de Urina EAS: O Que É e Como Coletar \| Total Quality"; ECG "Eletrocardiograma (ECG): Para Que Serve e Como É Feito"; hemograma "Hemograma Completo: O Que Avalia e Quais Exames Inclui"; exames de sangue "Tipos de Exame de Sangue e Como Entender o Resultado" |

### 2.6 Fase 5 — dados estruturados

| # | Afirmação | Veredito | Evidência |
|---|---|---|---|
| 5a | Grafo MedicalBusiness+DiagnosticLab+MedicalClinic e WebSite | ✅ | `index.html:127-318`, `:322-329` |
| 5b | BreadcrumbList, FAQPage, MedicalWebPage+MedicalTest | ✅ | servidor `seo-content.ts:284-298`, `:169-192`; cliente `SEOHead.tsx:18-120` |
| 5c | JSON-LD duplicado/divergente | ⚠️ | não há duplicação simultânea (o do servidor some quando o React substitui o `#root`), mas são **dois grafos diferentes**: o servidor emite `MedicalWebPage` com `about: MedicalTest` ancorado em `#medicalbusiness`; o cliente emite um `MedicalTest` solto com `provider` repetindo o endereço (`SEOHead.tsx:89-124`). O que o Google vê depende de quando renderiza |
| 5d | Sem AggregateRating | ✅ cumpre | guard-rail `seo-content.test.ts:394-415` |
| 5e | `lastReviewed`/`reviewedBy`, `usedToDiagnose`, Physician/AboutPage/ContactPage | ❌ ausentes | nenhum ocorre em `server/` ou `client/src` fora do blog (`blogPostingLd`) |

### 2.7 Fase 6 — técnico

| # | Afirmação | Veredito | Evidência |
|---|---|---|---|
| 6a | `/posts/*` antigos dão 404 | ✅ | prod: `/posts/hemograma-completo-o-que-ele-pode-revelar` → 404; `/category/saude` → 404 (`/category/blog` já faz 301, `legacy-redirects.ts:85`) |
| 6b | Página 404 indexável e com canonical da home | ✅ | prod 404 serve `robots: index, follow` e `canonical https://totalquality.med.br/` — padrões do `index.html:73,76`, porque `getRouteMetadata` devolve `null` e nada é trocado (`vite.ts:93-96`). React: `NotFound.tsx:24-34` em **inglês** ("Page Not Found"), um único botão, sem links |
| 6c | Redirect custa 190–600 ms | ⚠️ só nas entradas http/www | `https://totalquality.med.br/` não redireciona. `http://www.…/exames/hemograma/` faz **2 saltos**: CDN da Hostinger (`server: hcdn`) http→https mantendo o www, depois Express www→apex (`index.ts:129-151`). O 1º salto é da CDN, não do código |
| 6d | Barra final sem forma canônica | ✅ | prod: `/exames/`, `/blog/`, `/exames/hemograma/` → **200** (conteúdo duplicado; o canonical aponta para a forma sem barra — `routes-metadata.ts:502`) |
| 6e | Sitemap: 45 URLs, 19 com lastmod | ✅ | prod: 45 `<loc>`, 19 `<lastmod>`. Só o blog tem data (`sitemap-handler.ts:142-149`; `routes-metadata.ts:564`). Gerado por requisição (`index.ts:245`), não no build |
| 6f | Preload de `/images/recepcao-1024.avif` em todas as rotas | ✅ | `index.html:362-369` (template global). A foto só é LCP na home (`HeroSection.tsx:106-113`); `/checkup` e `/bioimpedancia` usam `recepcao-1024.webp`, não o AVIF (`CheckUp.tsx:17`, `Bioimpedancia.tsx:15`) |
| 6g | ~290 KB de JS não usado | ⚠️ plausível | `Home` em import estático (`App.tsx:9`); bundle de entrada do último build local 482 KB brutos (`dist/public/assets/index-C0Jolx8D.js`, 31/10 — medir de novo no build da Fase 6) |
| 6h | Favicon: `/favicon.ico` 404 e ícone é o logo 276×96 | ✅ | `index.html:379` `logo-276.webp`; prod `/favicon.ico` 404 **com `Cache-Control: immutable` de 1 ano** (a regex de cache de `index.ts:179` casa `.ico` mesmo no 404); `/site.webmanifest` 404 |
| 6i | og:image da home no CloudFront | ✅ | `routes-metadata.ts:379` sobrescreve o `fachada-1024.webp` do `index.html:91`; prod confirma o PNG `optik-hero` do CloudFront. O guard-rail lê só o `index.html` e não pega (PR #68 corrige) |
| 6j | llms.txt com horário "08h às 18h" | ✅ e pior | `client/public/llms.txt:10` "08h às 18h"; **`:3` "resultados online em até 24h"** (viola a regra "nunca prometer 24 horas"); `:35` "equipamentos de última geração" (superlativo, CFM). Faltam especialidades, hemograma, sexagem, admissional. Servido com `max-age=0` |
| 6k | `<meta name="keywords">` | ✅ | `index.html:70`; injetado por rota em `routes-metadata.ts:689-695` |
| 6l | Cache: HTML interno desalinhado da home; assets imutáveis | ✅ | prod: `/` → `public, max-age=300, must-revalidate`; `/exames/hemograma` → **sem Cache-Control** (`index.ts:191` cobre só `/` e `.html`). CSS/JS com hash → `max-age=31536000, immutable` ✅. **AVIF → `max-age=0`**: a regex `index.ts:179` não inclui `avif`, então a imagem LCP da home não é cacheada |
| 6m | Blog duplicado em `blog.totalquality.med.br` | ✅ | prod: Vercel, 200, canonical próprio (`https://blog.totalquality.med.br`); o site linka para ele (`shared/const.ts:95`, `Footer.tsx:17`, `seo-content.ts:683`). O PR #94 (aberto) já implementa o 301 do subdomínio |

---

## 3. Fase 1 — fonte única (servidor = página renderizada)

### 3.1 Abordagem escolhida: SSR do mesmo componente React + `hydrateRoot`, por grupo de rotas

**Por quê esta e não a "função compartilhada":**

1. A função compartilhada (dados → HTML string no servidor e dados → JSX no cliente) é o que
   existe hoje (`seo-content.ts` comenta "mesmo texto exibido pelo React") e é exatamente o
   que divergiu: H1, H2, ordem, description, FAQ do check-up. Duas renderizações escritas à
   mão sempre se separam; um teste de paridade só pega o que alguém lembrou de comparar.
2. O CLS vem da **troca** do bloco pré-renderizado pelo layout do React (`main.tsx:55`
   `createRoot` apaga o `#root`). Com o mesmo markup no servidor e `hydrateRoot` no cliente,
   não há troca: o primeiro paint já é o layout final.
3. O terreno está pronto: React 19.2 (`renderToString`/`prerenderToNodeStream` resolvem
   `Suspense` + `lazy`), wouter 3 tem `ssrPath`, o servidor já intercepta todas as rotas e o
   build já empacota o servidor com esbuild (basta `--jsx=automatic`; os aliases `@/` vêm do
   `tsconfig.json`, que o esbuild lê).
4. **Pior caso = comportamento atual:** se a hidratação divergir, o React 19 registra erro
   recuperável e redesenha a raiz no cliente — o mesmo que acontece hoje. O risco de
   regressão visível é baixo.

**Escopo do SSR:** só o grupo do template (Fase 3): `/exames/:slug`, `/especialidades`,
`/especialidades/:slug`, `/laboratorio-caraguatatuba`, `/checkup`, `/bioimpedancia`, `/sobre`,
`/contato`. Home, blog e `/cartao` continuam com o pré-render atual nesta fase (blog e home já
têm conteúdo do servidor coerente; migram depois, se o resultado justificar).

### 3.2 Passos e arquivos

| Passo | Arquivos |
|---|---|
| Separar o template em componentes **apresentacionais** (sem `window`/`document` no render; efeitos só em `useEffect`) | `client/src/pages/ExamePage.tsx` → `client/src/components/exame/*` (Hero, ResumoRapido, NestaPagina, Secao, Subtipos, OndeFazer, Faq, SaibaMais, Revisao) |
| Entrada SSR: `renderPage(pathname)` com `Router ssrPath`, providers do `App` e páginas importadas estaticamente | `client/src/entry-server.tsx` (novo) |
| Cliente: nas rotas SSR, pré-carregar o chunk da rota e `hydrateRoot`; demais rotas seguem com `createRoot` | `client/src/main.tsx` |
| Servidor: para as rotas SSR, `getSeoContentForPath` passa a devolver o HTML do React (mantém a assinatura — os guard-rails existentes continuam valendo) | `server/_core/seo-content.ts`, `server/_core/vite.ts` (dev usa `vite.ssrLoadModule`) |
| JSON-LD da rota sai de dentro do `#root` e vai para o `<head>` (injetado pelo servidor); os hooks `useFAQSchema`/`useMedicalTestSchema`/`useBreadcrumbSchema` deixam de emitir nessas rotas | `server/_core/routes-metadata.ts`, `client/src/components/SEOHead.tsx` |
| Meta title/description com **uma** fonte: `routes-metadata.ts` passa a ler `examesData`/`especialidadesData` (como já faz para especialidades em `:196-210`) | `server/_core/routes-metadata.ts:44-192` |
| H1 "[Exame] em Caraguatatuba" em caixa normal no dado; caixa alta só via `.heading-display` | `examesData.ts` (novo campo `h1`/`nomeExame`), `ExamePage.tsx:117-123`, `:173`, `:359` |
| `.reveal` não pode esconder conteúdo no SSR: estado inicial visível sem JS (classe aplicada só após a hidratação) | `client/src/index.css`, hook de reveal |
| CSS: nas rotas SSR o CSS principal volta a bloquear o paint (o bloco do servidor passa a depender das classes do Tailwind), ou CSS crítico inline da rota | `vite.config.ts` (`nonBlockingCss`) |
| Fallback métrico das fontes (conteúdo do PR #68) | `client/index.html`, `client/src/index.css` |
| `build`: `--jsx=automatic` no esbuild do servidor | `package.json:8` |

### 3.3 Testes novos (contrato)

- `server/paridade-ssr.test.ts`: para 5 rotas de amostra (`/exames/hemograma`,
  `/exames/ultrassonografia`, `/especialidades/medicina-do-trabalho`, `/checkup`,
  `/laboratorio-caraguatatuba`) extrai do HTML do servidor a sequência H1 → H2s → perguntas e
  respostas do FAQ → hrefs, e compara com `renderToStaticMarkup` da mesma página. Igualdade exata.
- FAQ: toda resposta do FAQ visível aparece, palavra por palavra, no `FAQPage` do JSON-LD (e vice-versa).
- `<h1>` único, sem caixa alta no texto-fonte.

**Critério de aceite:** curl × DOM iguais nas 5 rotas (teste acima + conferência manual pós-deploy);
CLS desktop de laboratório < 0,1 (medido pelo Alex no PageSpeed após o deploy — Lighthouse não
roda neste ambiente).

**Tamanho:** G (≈ 3–5 dias de desenvolvimento + validação com Playwright fora do sandbox, regra 13 do `CLAUDE.md`).

---

## 4. Fase 2 — CTAs e navegação como links reais

**Regra de ouro:** cada ponto de clique mantém exatamente as chamadas de hoje
(`trackScheduleExam`/`trackWhatsAppClick`/… + `openWhatsApp`/`abrirTelefone`), só muda o elemento.

| Item | Como | Arquivos |
|---|---|---|
| WhatsApp (44 pontos) | `<a href={whatsappUrl(msg)} target="_blank" rel="noopener noreferrer" onClick={e => { e.preventDefault(); /* chamadas atuais */ }} onAuxClick={…}>` com as mesmas classes (`btn-pill`…). O `preventDefault` mantém o formulário de qualificação (regra 8); o `href` torna o CTA rastreável e acessível. Clique do meio/Ctrl também interceptado, senão pula o formulário | componente novo `client/src/components/CtaWhatsApp.tsx` usado nos 22 arquivos listados em §2.3-2e |
| Mensagem por página | `"Olá, vim pelo site e quero informações sobre ${nomeExame}"` derivada do dado (substitui `whatsappMessage` fixo). **Atenção:** `buildMessageWithName` (`ContatoLeadContext.tsx:174-180`) só reconhece "Olá!" — com "Olá," geraria "Olá! Meu nome é X. , vim pelo site". Ajustar a regex junto | `examesData.ts`, `especialidadesData.ts`, `ContatoLeadContext.tsx` |
| Ligar | Duas opções (decisão do Alex, ver §10): **(A, recomendada)** `<a href="tel:+551238873535" onClick={preventDefault → abrirTelefone(...)}>`, o que exige reescrever o guard-rail `seo-content.test.ts:723-759` para "tel: só em `<a>` que intercepta com `abrirTelefone`" (troca de regra, não afrouxamento, mas mexe em guard-rail); **(B)** `<a href="/ligar">` (rota que já passa pelo formulário, `CallRedirect.tsx`) — sem `tel:` no código, mas `/ligar` precisa de `noindex` e o comentário da rota diz que nenhuma página aponta para ela | `ExamePage.tsx`, `Navbar.tsx`, `Footer.tsx`, `HeroSection.tsx` etc. |
| Agendar | mesmo `CtaWhatsApp` (mensagem geral) | `Navbar.tsx:246`, `:331` |
| Resultados | `<a href="https://app.totalquality.med.br/" target="_blank" rel="noopener noreferrer" onClick={trackResultsClick}>` — sem `preventDefault` | `Navbar.tsx:239`, `:341` |
| Sobre / Contato | `<Link href="/sobre">`, `<Link href="/contato">` no menu e no rodapé; a home mantém as seções `#sobre`/`#contato` | `Navbar.tsx:22-25`, `Footer.tsx:12-15` |
| Logo | `href="/"` | `Navbar.tsx:153` |
| `/sobre` e `/contato` reais | tirar as duas linhas de `legacy-redirects.ts:30-31`; repontar `/about-us`, `/contact-us`, `/contact-us-2`, `/appointment` (`:86-89`) para as páginas novas (um salto só); rota no `App.tsx`, `CLIENT_ROUTES`, `staticRoutes`, sitemap. Conteúdo reaproveitado de `SobreSection.tsx` e `ContatoSection.tsx` (o formulário de contato já existe) | vários |
| Guard-rail novo | todo `<a>` com `whatsappUrl(` tem `onClick` que chama `openWhatsApp`; todo CTA tem `href` | `server/rastreamento-100.test.ts` |

**Não muda:** nomes de evento, `lead_source`, regex do GTM, consentimento, captura de gclid/UTM.

**Tamanho:** M (≈ 1,5–2 dias). Validação de eventos com Playwright + Tag Assistant fora do sandbox.

---

## 5. Fase 3 — template de exame orientado a dados

### 5.1 Extensão do esquema (`ExamData`)

Proposta (campos novos opcionais; página só publica o que tem dado — o que faltar vira
`TODO(alex)` e **não aparece** em produção):

```ts
interface ExamData {
  // ...campos atuais
  nomeExame: string;              // "Hemograma completo" — base de H1, mensagem e schema
  h1?: string;                    // padrão: `${nomeExame} em Caraguatatuba`
  respostaCurta: string;          // 40–60 palavras, logo abaixo do H1
  resumo: {                       // tabela "Resumo rápido"
    jejum: Valor; preparo: Valor; duracao: Valor; prazoResultado: Valor;
    pedidoMedico: Valor; atendimento: "ordem_de_chegada" | "hora_marcada" | "ambos";
    convenios: true;              // sempre CONVENIOS_TEXTO
  };
  secoes: Array<{ id: string; pergunta: string; paragrafos: string[]; lista?: string[] }>; // H2 em forma de pergunta
  subtipos?: Array<{ nome: string; descricao?: string; href?: string }>;
  imagem?: { slug: string; alt: string; width: number; height: number }; // via ResponsiveImage (AVIF/WebP)
  examesRelacionados: string[];   // 3–4 slugs
  blogRelacionados?: string[];    // padrão: examBlogLinks.ts (2–4)
  naoRealizamos?: ExamFAQ[];      // ex.: ressonância na página de tomografia (se aprovado)
  blocoEmpresa?: { titulo: string; itens: string[]; mensagem: string }; // B2B
  revisao: { dataRevisao: string; dataAtualizacao: string }; // AAAA-MM-DD → <time>, lastReviewed, sitemap lastmod
  schema?: { usedToDiagnose?: string[]; usesDevice?: string; bodyLocation?: string };
}
type Valor = string | { pendente: string }; // { pendente } = TODO(alex), oculto em produção
```

`REVISOR` (`blogMeta.ts:134`) passa a ser `"Dr. Alex Waltersdorf - 267.339"` (sem a sigla do
conselho), compartilhado por blog e páginas de serviço. Um teste lista todos os `pendente` para o
Alex responder em lote.

### 5.2 Ordem da página (mesma no servidor e no React, por construção — Fase 1)

H1 → resposta curta → CTAs (WhatsApp + Ligar) → Resumo rápido → Nesta página → H2 em pergunta →
subtipos (quando houver) → "Onde fazer [exame] em Caraguatatuba" (endereço, horário 7h30–18h seg–sex,
área: Caraguatatuba, Ubatuba, São Sebastião e Ilhabela; mapa com carregamento preguiçoso) →
FAQ (6–8, `<details>`) → Saiba mais (2–4 artigos + 3–4 exames) → "Revisado por Dr. Alex Waltersdorf
- 267.339 · Atualizado em `<time>`" → imagem real (ou `TODO(alex)`). Meta: 1.200–1.800 palavras
úteis, sem enchimento.

### 5.3 Páginas atendidas

Todas as 13 de `/exames/*`, as 3 (+2 novas) de `/especialidades/*`, `/laboratorio-caraguatatuba`,
`/checkup`, `/bioimpedancia`. Conteúdo hoje fora de `examesData`
(`LaboratorioCaraguatatuba.tsx`, `CheckUp.tsx:21-90`, `Bioimpedancia.tsx:34-56`, blocos de
`seo-content.ts:333-644`) migra para módulos de dados (`client/src/lib/paginasServico.ts`).

Específicos:
- **Ultrassonografia:** title "Ultrassonografia (Ultrassom) em Caraguatatuba | Total Quality" (≤ 60) e H2 com "ultrassom"; subtipos só dos que já estão no dado (`examesData.ts:160-200`: abdominal, pélvica, obstétrica, tireoide, mamas, Doppler).
- **Tomografia, raio-X, exames de sangue:** subtipos só do repositório (exames de sangue: `examesDeSangueLista` em `examBlogLinks.ts`).
- **Hemograma:** página de serviço = intenção local/transacional (onde fazer, preparo, prazo, como agendar); artigo = intenção informativa (o que cada série mostra). Links cruzados nos dois sentidos, sem repetir parágrafos.
- **Medicina do trabalho / exame admissional:** bloco B2B (PCMSO, ASO, admissional/periódico/demissional/retorno/mudança de função — só o que já está no dado) com CTA "Solicitar proposta para empresa" (WhatsApp, `lead_source` próprio — **evento novo exige linha no regex do GTM**, regra 9). Pode usar a imagem `aso-medicina-do-trabalho-1672.jpg` do PR #87 se o Alex aprovar.
- **Check-up:** detalhe por plano a partir de `CheckUp.tsx:21-90`; números "19/30/39 exames" a confirmar (`TODO(alex)`); remover "resultados em até 48 horas úteis" (`CheckUp.tsx:96`).
- **`/especialidades`:** índice novo com as especialidades do dado.

### 5.4 Páginas novas — o que existe × o que falta

| Página | Dado no repositório | `TODO(alex)` |
|---|---|---|
| `/especialidades/cardiologista` | nenhum texto de consulta. Exames ligados que a clínica faz: ECG, Holter, MAPA (`examesData.ts`). `index.html:180` já declara `Cardiovascular` | quando procurar, como é a consulta, dias/horários, preparo, se atende retorno/laudo; **nunca** citar ecocardiograma/teste ergométrico (guard-rail `seo-content.test.ts:1132`) |
| `/especialidades/pediatra` | nenhum | faixa etária, o que leva, vacinação? (não inventar), dias/horários. Exige trocar `seo-content.test.ts:1120-1122` (hoje afirma 404) e `regra-ouro-ranking.test.ts:179-195` ("sem pediatria") e acrescentar `Pediatric` ao schema só junto com a página |
| `/exames/exame-de-dna` (slug a confirmar) | **nenhum** — só sexagem fetal (`examesData.ts:460-495`) e DNA-HPV no artigo de Papanicolau | quais testes (paternidade, vínculo, judicial × particular), tipo de coleta, laboratório de apoio, prazo, documentos, menores de idade, LGPD de dado genético |
| `/especialidades` | `especialidadesData.ts` | — |
| `/sobre` | `SobreSection.tsx`, `foundingDate` 2003-07-08, identificação do art. 5º | fotos da equipe sem nome? (sem nome de médico) |
| `/contato` | NAP, horário, `ContatoSection.tsx` (formulário), mapa | — |

**Tamanho:** GG — desenvolvimento ≈ 4–6 dias; o gargalo é o conteúdo (≈ 20 páginas × 1.200–1.800
palavras) e as respostas do Alex. Sugestão: 1º lote com as 5 maiores em impressões (hemograma,
laboratório, ultrassonografia, exames de sangue, gastroenterologista).

---

## 6. Fase 4 — blog → páginas de serviço

| Item | Abordagem | Arquivos |
|---|---|---|
| Mapeamento artigo → serviço | reaproveitar `examPages` (já em 27/43 artigos) como arquivo de mapeamento; preencher os 16 que faltam e corrigir o EAS (urina ≠ exames de sangue → `/laboratorio-caraguatatuba` ou página nova de exame de urina, a decidir) | `client/src/content/blog/index.json`, `blog-exames.test.ts` |
| CTA no primeiro terço + fim | o `ExamCTA` passa a ser inserido automaticamente após o 1º terço das palavras quando o artigo não tiver `[[cta]]` antes disso (o do fim já existe). Sem link de WhatsApp/tel no corpo (regra 12) | `BlogPost.tsx:237-242`, `seo-content.ts:743-781` |
| Links descritivos no corpo | âncoras "hemograma em Caraguatatuba" em vez de "clique aqui", via `internalLinkTargets.ts` | `client/src/lib/internalLinkTargets.ts` |
| Autor/revisor + datas com `<time>` | `<time datetime>` para publicado/atualizado; "Revisado por Dr. Alex Waltersdorf - 267.339" | `BlogPost.tsx:186-187`, `MedicalFooter.tsx`, `blogMeta.ts:134-156`, `seo-content.ts:841-842`, `:814` |
| Title/description dos artigos com CTR ~0 | reescrever só `metaTitle`/`excerpt` (H1 e URL ficam) de EAS, eletrocardiograma, hemograma, exames de sangue — rascunho para aprovação | `index.json` |
| Imagens dos relacionados | `width`/`height` (1024×640, proporção 16/10) | `BlogPost.tsx:311` |

Conflito: o PR #101 reescreve trechos desses mesmos artigos (ver §11).

**Tamanho:** M (≈ 1,5 dia + revisão de texto pelo Alex).

---

## 7. Fase 5 — dados estruturados

- Manter o grafo atual (`index.html` + página). Uma fonte por rota, emitida pelo servidor no `<head>`
  (Fase 1); remover o `MedicalTest` solto do cliente (`SEOHead.tsx:89-124`).
- Página de exame: `MedicalWebPage` (`lastReviewed`, `reviewedBy` → `Person` "Alex Waltersdorf",
  `about` → `MedicalTest` com `usedToDiagnose`/`usesDevice` **só quando o dado existir**).
- Consulta: `MedicalWebPage` + `about: MedicalSpecialty`; `Physician` genérico (sem nome),
  `memberOf/worksFor` → `#medicalbusiness`. Pediatria/cardiologia no `medicalSpecialty` do negócio só
  junto com as páginas.
- Artigo: `BlogPosting` com `author` (Organization, como hoje) e `reviewedBy` `Person`.
- `/sobre` → `AboutPage`; `/contato` → `ContactPage`.
- `FAQPage` gerado da mesma lista do FAQ visível (teste de igualdade); remover o `FAQPage` da home
  enquanto ela não tiver FAQ visível (ou exibir o FAQ — decisão).
- Nada de `AggregateRating`/`Review` (guard-rail existente).

Arquivos: `server/_core/seo-content.ts`, `server/_core/routes-metadata.ts`, `client/index.html`,
`client/src/components/SEOHead.tsx`, `client/src/lib/blogMeta.ts` (`blogPostingLd`),
`server/schema-semrush.test.ts`. **Tamanho:** M (≈ 1–1,5 dia).

---

## 8. Fase 6 — técnico

| Item | Abordagem | Arquivos |
|---|---|---|
| 301 de `/posts/*` | reaproveitar a tabela `POSTS_MIGRADOS` do PR #94 (`server/_core/blog-subdominio.ts`) também para o domínio principal: hipoglicemia → `/blog/hipoglicemia-sintomas-e-exames`; hemograma → `/blog/hemograma-completo-o-que-avalia`; tirzepatida e ultrassom de tireoide → artigo se publicado, senão a página de exame/`/blog` (os artigos só existem no PR #94, como rascunho); hormônios do amor → **conflito: o briefing diz `/blog`, o PR #94 diz 410** (pergunta §10); demais `/posts/*` e `/category/*` → `/blog` | `legacy-redirects.ts` (regra por prefixo), `seo-content.test.ts` |
| 404 | `noindex`, sem canonical, título "Página não encontrada", texto em português, links para home, exames, laboratório, blog, contato; pré-render também no 404 | `vite.ts:86-107`, `routes-metadata.ts`, `NotFound.tsx` |
| Um salto só | Express: barra final → 301 para a forma sem barra (inclui `/blog/`, `/exames/`), juntando com www→apex no mesmo redirect. O salto http→https da CDN (`hcdn`) mantém o www: corrigir no hPanel/CDN da Hostinger (fora do código — pergunta §10) | `server/_core/index.ts:129-151` |
| Sitemap no build com lastmod real | `dataAtualizacao` de cada página (Fase 3) + `dateModified` do blog; script no `build` grava `dist/public/sitemap.xml`; teste: nenhuma URL do sitemap está em `LEGACY_REDIRECTS`/`GONE_PATHS`; 100% com lastmod. (Datas do git não servem: o deploy usa `fetch-depth: 2`) | `sitemap-handler.ts`, `package.json`, `scripts/` |
| Preload do LCP só onde é LCP | tirar o preload global (`index.html:362-369`) e injetar por rota (home; demais rotas com imagem LCP própria declaram a sua) | `index.html`, `routes-metadata.ts` |
| Divisão de JS | `Home` em `lazy` ou separar seções abaixo da dobra; medir antes/depois no build (sem estimar nota) | `App.tsx:9`, `Home.tsx` |
| `clientParamBuilder` do Meta | **mudança no contêiner GTM, não no código**: disparar a tag do Meta após consentimento/interação. O pacote do GTM vive no repositório de SEO (`gtm/…`); não mexer no snippet do `index.html` | contêiner GTM (Alex) |
| Favicons | `favicon.ico` (48), PNG 96/192/512 quadrados, `apple-touch-icon` (180), `site.webmanifest`; arte quadrada a partir do símbolo do logo (`TODO(alex)` se não houver versão quadrada) | `client/public/`, `index.html:379` |
| og:image | home → domínio próprio (PR #68); por exame quando houver foto real (tomografia, laboratório, cardiologia) | `routes-metadata.ts` |
| llms.txt | horário 7h30 às 18h; "resultados online em curto prazo"; tirar "última geração"; incluir especialidades, hemograma, sexagem, admissional, `/sobre`, `/contato`; idealmente gerado no build a partir dos dados | `client/public/llms.txt` |
| `<meta name="keywords">` | remover do template, do `injectMetaTags` e da interface | `index.html:70`, `routes-metadata.ts:22`, `:689-695` |
| Cache | HTML interno = home (`public, max-age=300, must-revalidate`); incluir `avif` (e `webmanifest`) na regra de imagens; não marcar 404 como `immutable` | `server/_core/index.ts:172-200` |

**Tamanho:** M-G (≈ 2–3 dias).

---

## 9. Fase 7 — verificação e relatório (depois)

`docs/seo-relatorio.md` com: curl × DOM das 5 rotas, sitemap (contagem e lastmod), status dos
301/404, PageSpeed medido pelo Alex, eventos validados com Playwright fora do sandbox. O script de
auditoria diária do PR #101 (`scripts/audit-seo.mjs` + `.github/workflows/seo-health.yml`) pode ser
a base da verificação contínua. Atualizar o `SEO_STANDARDS.md` (cita ainda `/exames/mamografia`,
`keywords` obrigatório e og:image no CloudFront). **Tamanho:** P-M.

---

## 10. Perguntas abertas para o Alex

1. **Agendamento da coleta — conflito.** O briefing diz "sem agendamento, por ordem de chegada"; a
   decisão de 25/10/2026 diz "com e sem agendamento". **O site hoje diz as duas coisas:** "sem
   agendamento" em `ExamePage.tsx:376`, `:387`, `seo-content.ts:301`, `:485`, `:500`, `:518`, `:849` e
   no guard-rail `seo-content.test.ts:901-912`; "sem agendamento, por ordem de chegada, **ou com
   horário marcado** pelo WhatsApp" na sexagem fetal (`examesData.ts:469`, `:487`) e no fechamento de
   8 artigos do blog (ex.: `exame-de-urina-eas-como-coletar.json:72`). Qual vale para todas as páginas?
2. **Cardiologista e pediatra.** Em 31/10 a informação era que a clínica não tinha essas
   especialidades; em 14/11 "SIM, ATENDEMOS. PODE CRIAR". Confirmar que vale a de 14/11 (há campanha
   `pesquisa-pediatra-cardiologista` no Ads, `utmTracker.ts:174`) e enviar os dados da consulta
   (§5.4). Criar as páginas exige trocar dois guard-rails que hoje afirmam o contrário.
3. **Ressonância.** O guard-rail `seo-content.test.ts:132-148` proíbe a palavra "ressonância" em
   qualquer página pré-renderizada, inclusive para dizer que não faz. Opções: **(A, recomendada)** não
   mencionar e não criar URL — `/exames/ressonancia` e `/exames/ressonancia-magnetica` já dão 404 e não
   há URL antiga no repositório para redirecionar; **(B)** uma pergunta no FAQ da tomografia ("A Total
   Quality faz ressonância magnética? Não. A escolha do exame é do médico; a tomografia não substitui a
   ressonância.") com exceção estreita no guard-rail, no modelo do da mamografia. **Risco CFM/Google:**
   qualquer página que ranqueie para um exame que a clínica não faz atrai paciente que não será atendido
   e pode ser lida como anúncio de serviço não prestado; nunca sugerir que a tomografia substitui. Nunca
   301 de "ressonância" para tomografia sem uma URL antiga com histórico.
4. **Blog no subdomínio.** `blog.totalquality.med.br` segue no ar (Vercel, canonical próprio) e o site
   linka para ele (`shared/const.ts:95`). O PR #94 (aberto) unifica no `/blog` e faz 301 do subdomínio
   — depende de apontar o DNS. Mergear o #94 antes da Fase 6? E o `/posts/hormonios-do-amor-…`: 410
   (PR #94) ou 301 para `/blog` (briefing)?
5. **Botão "Ligar":** opção A (`tel:` interceptado, exige reescrever o guard-rail de telefone) ou B
   (`/ligar`)? (§4)
6. **Preços.** "Não publicar preço": vale também para `/outubro-rosa` (R$ 399,90, `OutubroRosa.tsx:40`,
   `:417`; campanha encerrada em 31/10 — sugestão: retirar a rota com 301 para `/checkup` ou
   `/exames/ultrassonografia`) e para `/cartao` (mensalidades em `cartaoPlanos.ts:28-96`)? E o "até
   70% de desconto" (`examesData.ts:74`, `CartaoPage.tsx:236`)?
7. **Promessas de prazo/superlativos já no ar:** `CheckUp.tsx:96` ("resultados em até 48 horas
   úteis"), `llms.txt:3` ("até 24h"), `llms.txt:35` ("última geração"), `seo-content.ts:502` ("Mais de
   400 avaliações no Google" — prova social). Posso corrigir na Fase 6/3?
8. **Exame de DNA:** quais testes, coleta, laboratório de apoio, prazo, documentos (§5.4).
9. **Redirect da CDN:** autoriza ajustar no hPanel para o http://www ir direto ao https apex?
10. **`clientParamBuilder`:** autoriza mudar o disparo da tag do Meta no contêiner GTM (pacote no
    repositório de SEO)?
11. **PR #101** muda textos médicos (jejum do perfil lipídico, "laboratório de apoio"). Revisar e
    mergear antes da Fase 3, ou incorporar o que for aprovado no template?
12. Check-up: os subtítulos "19/30/39 exames" batem com as listas? Imagem quadrada do logo para favicon?

---

## 11. PRs abertos — sobreposição e decisão

| PR | Estado | Toca | Decisão |
|---|---|---|---|
| **#68** `correcao/cls-ogimage-e-localizacao` | aberto, rascunho, **conflito** com a main em `routes-metadata.ts` | og:image da home (`routes-metadata.ts:379`), fallback métrico das fontes (CLS), teste do HTML injetado | **Mergear primeiro** (resolver o conflito de uma linha) e rebasear esta branch. É pré-requisito do aceite de CLS da Fase 1 e resolve o item 6i |
| #100 `seo/blog-tipo-sanguineo` | **fechado** (substituído pelo #104, já na main) | — | Ignorar |
| **#101** `fix/seo-laboratorio-confiabilidade` | aberto, rascunho, atrás da main, conflito em 3 JSON do blog | `examesData.ts` (hemograma, exames de sangue), 7 artigos, `routes-metadata.ts` (description do hemograma), `shared/const.ts`, workflow de auditoria diária | **Revisão do Alex antes da Fase 3/4** (texto médico). Se aprovado: rebasear sobre a main e mergear antes; esta branch rebaseia depois. Se não: aproveitar só `scripts/audit-seo.mjs` na Fase 7 |
| #102 `fix/sheets-leads-apos-migracao` | **mergeado** em 14/11 | leads no Sheets | Nada a fazer |
| **#87** `claude/whatsapp-sales-analysis-lzbse7` | aberto | só `automacao/ana-agenda/*` e a imagem `aso-medicina-do-trabalho-1672.jpg` | Ignorar (não toca o site). A imagem pode ser reaproveitada na página de medicina do trabalho, com aprovação |
| **#94** `seo/unifica-blog` (não listado no briefing) | aberto, rascunho, conflito em `index.json` | 301 do subdomínio do blog, `POSTS_MIGRADOS`, artigos tirzepatida e ultrassom de tireoide, remove o link para o blog externo | **Relevante para a Fase 6** (`/posts/*`). Mergear antes da Fase 6, se o Alex confirmar (pergunta 4) |

---

## 12. Riscos

- **CFM 2.336/2023:** página de exame não realizado (ressonância, eco, ergométrico, mamografia,
  endoscopia, colonoscopia); superlativos, promessa de prazo ("24 horas"), preço, comparação,
  depoimento. Todo texto novo passa pela skill de compliance e pelos guard-rails; identificação do
  art. 5º em toda página nova.
- **Rastreamento:** trocar 44 botões por links pode duplicar ou perder eventos se o `preventDefault`
  falhar (ou em clique do meio). Mitigação: componente único, guard-rail novo, validação com
  Playwright + Tag Assistant fora do sandbox antes do merge.
- **Hidratação/CLS:** divergência de markup volta ao comportamento atual (sem regressão visível),
  mas o CSS precisa estar disponível no primeiro paint das rotas SSR — senão o CLS troca de causa.
- **Conteúdo médico inventado:** proibido; tudo que não está no repositório vira `TODO(alex)` e não
  é publicado.
- **Guard-rails que precisam mudar por decisão de negócio** (pediatra, telefone, ressonância):
  cada troca registrada no teste com data e autor da decisão — nunca afrouxar em silêncio.
- **Conflitos de merge** com #68, #94, #101 (mesmos arquivos).

## 13. Estimativa por fase

| Fase | Tamanho | Depende de |
|---|---|---|
| 1 Fonte única (SSR + hidratação) | G | #68 |
| 2 CTAs/links + `/sobre` `/contato` | M | perguntas 5 |
| 3 Template + páginas novas | GG (conteúdo) | perguntas 1, 2, 3, 8, 11, 12 |
| 4 Blog → serviço | M | #101 |
| 5 Dados estruturados | M | Fase 1 |
| 6 Técnico | M-G | perguntas 4, 6, 7, 9, 10; #94 |
| 7 Verificação + relatório | P-M | todas |

---

## 14. Proposta: histórico permanente de atualizações do site

**Arquivo:** `docs/historico-de-atualizacoes.md` — um registro só, sempre em ordem cronológica
inversa, atualizado no mesmo PR de cada mudança (o PR não fecha sem a linha). Não substitui o git:
diz **por que** mudou e **o que olhar** depois.

**Formato (uma linha por mudança):**

| Data | Mudança | Motivo / dado que motivou | PR | Métrica a acompanhar (e quando) |
|---|---|---|---|---|

**Semente com os PRs já mergeados (datas em horário de Brasília; títulos e commits do git):**

| Data | Mudança | Motivo / dado que motivou | PR | Métrica a acompanhar |
|---|---|---|---|---|
| 14/11/2026 | Blog: rascunhos de tipo sanguíneo, ferritina e espirometria (ids 51–53), vindos da Airticles | Airticles passa a só escrever; artigo entra no `/blog` como rascunho para revisão (substitui #100 e #103) | #104 | Publicação após revisão; impressões dos 3 temas no GSC em 28 dias |
| 14/11/2026 | Lead gravado no Google Sheets mesmo com o banco fora do ar | Leads se perdiam depois da migração quando o banco falhava | #102 | Leads no Sheets × `lead_qualificado` no GA4, semanal |
| 14/11/2026 | Mamografia sai do site; `/exames/mamografia` → 301 para `/exames/ultrassonografia` | Decisão do Alex (31/10): a clínica não realiza mamografia — anunciar serviço não prestado viola CFM e as regras do Google | #99 | Impressões/cliques de `/exames/ultrassonografia`; queries "mamografia" no GSC |
| 14/11/2026 | Blog: matéria do aplicativo Total Quality Health (rascunho) | Respostas do Alex sobre o aplicativo; `/cartao` sem o check-up gratuito para os 100 primeiros | #95 | — (rascunho) |
| 14/11/2026 | Blog: padrão editorial do orquestrador (referências, citation, Twitter, datas, breadcrumb) | Padronizar E-E-A-T e dados do artigo | #93 | CTR médio do blog no GSC |
| 29/10/2026 | Meta: lead como evento próprio (`lead_qualificado`); `faq_index` limpo após `faq_open` | Meta restringia o evento `Lead` padrão; parâmetro grudava nos eventos seguintes do GA4 | #98 | Eventos no Events Manager e GA4 |
| 29/10/2026 | Regra do pixel para futuras atualizações, com trava nos artigos do blog | Link de WhatsApp no corpo do artigo pulava formulário e evento | #97 | Guard-rail `rastreamento-100.test.ts` |
| 28/10/2026 | Rastreamento: visitante que volta, lead do contato e ids de clique na planilha | Consentimento salvo entrava no `default` e o visitante que voltava não era medido (perícia de 28/10) | #96 | Sessões de retorno no GA4; gclid preenchido na planilha |
| 24/10/2026 | Lead: valor da sexagem fetal (R$ 250, interno — não publicado) | Valor do lead por tipo para o Ads | #92 | Valor de conversão no Ads |
| 24/10/2026 | Página de sexagem fetal (`/exames/sexagem-fetal`) | Demanda de busca sem página própria | #91 | Impressões/posição da página (hoje 65–123 impr./28d) |
| 24/10/2026 | Páginas de especialidade: endocrinologista, gastroenterologista, medicina do trabalho | Pedido do Alex; consultas sem página | #90 | Impressões e eventos por página (gastro 434 impr., endócrino 425, medicina do trabalho 357 em 28d) |
| 24/10/2026 | Schema: bloco MedicalClinic do Alex fundido no `#medicalbusiness` | Duas entidades de negócio com `@id` diferentes | #89 | Rich Results / Search Console > Melhorias |
| 23/10/2026 | Indexação: 10 URLs 404 com histórico viram 301; `/faq` vira 410 | Auditoria do Search Console (404 com impressões) | #88 | Relatório de páginas do GSC (404/soft 404) |
| 22/10/2026 | Blog: publica "Siglas de exames laboratoriais" | Aprovado pelo Alex | #86 | Impressões do artigo |
| 22/10/2026 | Blog: 5 artigos para exames prioritários + rodapé no modelo de fechamento; uma URL por intenção | Canibalização entre artigos e páginas de serviço (GSC de 21/10) | #85, #84 | Posição de "ultrassonografia caraguatatuba" e das páginas de serviço |

---

*Fase 0 concluída. Próximo passo: o Alex responde §10 e aprova (ou ajusta) a ordem das fases; a
Fase 1 começa depois do merge do #68.*

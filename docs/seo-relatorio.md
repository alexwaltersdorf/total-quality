# Relatório de SEO — nov/2026 (Fase 7: verificação)

**Branch:** `seo/otimizacao-nov-2026` (PR #105), comparado com `origin/main` em `fc5bfe0`.
**Data:** 15/11/2026. **Ambiente:** servidor de produção local (`pnpm build` +
`NODE_ENV=production node dist/index.js`) — a main na porta 3200 ("antes"), o branch na 3100
("depois"). Nada aqui é dado de campo: os números de desempenho são de laboratório, numa
máquina local, sem rede real nem terceiros. O que vale para o Google é o relatório de
experiência na página do Search Console/CrUX, 28 dias depois do deploy.

Plano: `docs/seo-plano.md`. Histórico: `docs/historico-de-atualizacoes.md`.

## Resumo

- Build, 1.674 testes, `tsc` (13 erros = teto herdado do CI) — ok. Sem script de lint no repositório.
- Auditoria das URLs do sitemap: **antes 0 de 45** passavam em todas as checagens; **depois 48 de
  49**. A única reprovação é `/cartao` (sem H1/conteúdo no HTML do servidor, description de
  109), que por decisão do Alex não foi mexida.
- Nesta fase foram corrigidos 7 defeitos de dado/atributo achados pela auditoria (§2.2); nenhuma
  mudança de comportamento, rastreamento ou URL.
- Paridade servidor × DOM hidratado: ok em 12 rotas (as 5 do plano + 7 extras), sem aviso de hidratação.
- Lighthouse 12.6.1 (rodou localmente): nota de desempenho mobile 93 → 98 (home), 93 → 97
  (hemograma), 82 → 83 (artigo); CLS 0 em todas as execuções do branch. Ressalva: o CLS
  intermitente de ~0,22 da home no celular **continua possível** (pré-existente, §4.3).
- 18 `TODO(alex)` com informação pendente (§5). Nada bloqueia o merge do ponto de vista técnico (§10).

## 1. Build, testes, tipos e lint

| Checagem | Comando | Resultado |
|---|---|---|
| Build | `pnpm build` | ok (vite + esbuild; `dist/index.js` 608,7 kb) |
| Testes | `pnpm vitest run` | **23 arquivos ok, 4 pulados; 1.674 testes ok, 34 pulados, 0 falhas** (antes desta fase: 1.652 — os 22 novos são da §2.2) |
| Tipos | `npx tsc --noEmit` | **13 erros** — exatamente o teto herdado do CI (`.github/workflows/ci.yml`: drizzle, google-ads-api, ga4-client, AutoSeoArticle, @testing-library). Nenhum erro novo |
| Lint | — | o `package.json` não tem script de lint (só `format`, prettier); não há o que rodar |

Bundle de entrada (JS que toda página baixa): main `index-*.js` 488,6 kB (gzip 142,2 kB) →
branch 358,5 kB (gzip 111,2 kB); Home e 404 viraram chunks próprios (Fase 6).

## 2. Auditoria de todas as URLs do sitemap

Script novo: **`scripts/auditoria-sitemap.mjs`** (`node scripts/auditoria-sitemap.mjs <base>
[--json saida.json]`). Para cada `<loc>` de `<base>/sitemap.xml` ele lê o HTML do servidor
(JavaScript desligado — o que o curl e o Googlebot recebem) e confere: status 200 sem
redirecionamento; exatamente um `<h1>`, com "Caraguatatuba" nas páginas de serviço
(`/exames/*`, `/especialidades/*`, `/laboratorio-caraguatatuba`, `/checkup`,
`/bioimpedancia`); title ≤ 60; description 120–160; canonical = a própria URL do sitemap;
JSON-LD presente e válido; imagens com alt/width/height. Depois abre a mesma URL com JavaScript
(terceiros bloqueados) e confere se o React mantém title, description e canonical, se há link
`api.whatsapp.com/send` e se o botão "Ligar" existe, e repete a checagem de imagens na página
montada. Mede também, no conteúdo principal (`<main>`), palavras, H2, links internos distintos
e imagens.

**Sobre o "Ligar":** ele é, de propósito, um `<button>` que abre o formulário de qualificação
antes da ligação (decisão do Alex de 15/11/2026: "passe pelo formulário também"; guard-rail
`server/seo-content.test.ts`). O script procura esse botão, **não** um link `tel:`. Ele é
exigido nas 21 páginas de serviço e na home; no blog e nas institucionais o contato é pelo
WhatsApp/ExamCTA, e a coluna mostra "—".

### 2.1 Resultado (branch, servidor local de produção)

**48 de 49 URLs passam em todas as checagens.** Colunas: Imgs e WhatsApp como "HTML do
servidor / página montada".

| URL | Status | H1 | Title | Desc. | Canonical | JSON-LD | Palavras | H2 | Links int. | Imgs (serv./mont.) | WhatsApp (serv./mont.) | Ligar | Img alt/w/h | Resultado |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| / | 200 | ok | 44 | 155 | ok | 3 | 464 | 4 | 22 | 0/8 | 1/11 | ok | ok | ok |
| /checkup | 200 | ok | 50 | 147 | ok | 5 | 994 | 11 | 8 | 3/3 | 10/10 | ok | ok | ok |
| /exames | 200 | ok | 48 | 157 | ok | 4 | 355 | 7 | 21 | 0/1 | 1/5 | — | ok | ok |
| /exames/exames-de-sangue | 200 | ok | 49 | 160 | ok | 5 | 1102 | 12 | 10 | 3/3 | 7/7 | ok | ok | ok |
| /exames/tomografia-computadorizada | 200 | ok | 59 | 154 | ok | 5 | 895 | 12 | 7 | 3/3 | 7/7 | ok | ok | ok |
| /exames/raio-x | 200 | ok | 47 | 155 | ok | 5 | 796 | 12 | 7 | 2/2 | 7/7 | ok | ok | ok |
| /exames/ultrassonografia | 200 | ok | 58 | 149 | ok | 5 | 985 | 12 | 7 | 3/3 | 7/7 | ok | ok | ok |
| /exames/hemograma | 200 | ok | 51 | 158 | ok | 5 | 1041 | 11 | 9 | 3/3 | 7/7 | ok | ok | ok |
| /exames/exame-admissional | 200 | ok | 56 | 143 | ok | 5 | 920 | 12 | 7 | 2/2 | 8/8 | ok | ok | ok |
| /especialidades | 200 | ok | 55 | 158 | ok | 4 | 230 | 3 | 7 | 2/2 | 5/5 | — | ok | ok |
| /bioimpedancia | 200 | ok | 46 | 148 | ok | 5 | 823 | 10 | 5 | 3/3 | 7/7 | ok | ok | ok |
| /blog | 200 | ok | 54 | 145 | ok | 4 | 766 | 2 | 37 | 0/20 | 0/6 | — | ok | ok |
| /laboratorio-caraguatatuba | 200 | ok | 50 | 160 | ok | 5 | 1340 | 14 | 22 | 3/3 | 7/7 | ok | ok | ok |
| /cartao | 200 | **X** | 49 | 109 **X** | ok | 2 | 0 | 0 | 0 | 0/1 | 0/5 | — | ok | FALHA |
| /exames/mapa | 200 | ok | 41 | 121 | ok | 5 | 836 | 11 | 7 | 2/2 | 7/7 | ok | ok | ok |
| /exames/holter | 200 | ok | 43 | 153 | ok | 5 | 776 | 11 | 8 | 2/2 | 7/7 | ok | ok | ok |
| /exames/espirometria | 200 | ok | 56 | 121 | ok | 5 | 672 | 10 | 5 | 2/2 | 7/7 | ok | ok | ok |
| /exames/eletrocardiograma | 200 | ok | 56 | 156 | ok | 5 | 794 | 11 | 8 | 2/2 | 7/7 | ok | ok | ok |
| /exames/eletroencefalograma | 200 | ok | 58 | 158 | ok | 5 | 610 | 10 | 5 | 2/2 | 7/7 | ok | ok | ok |
| /exames/exame-toxicologico | 200 | ok | 51 | 151 | ok | 5 | 952 | 11 | 7 | 2/2 | 7/7 | ok | ok | ok |
| /exames/sexagem-fetal | 200 | ok | 46 | 156 | ok | 5 | 847 | 9 | 5 | 3/3 | 7/7 | ok | ok | ok |
| /especialidades/endocrinologista | 200 | ok | 49 | 151 | ok | 5 | 785 | 10 | 8 | 3/3 | 7/7 | ok | ok | ok |
| /especialidades/gastroenterologista | 200 | ok | 52 | 153 | ok | 5 | 834 | 10 | 7 | 3/3 | 7/7 | ok | ok | ok |
| /especialidades/medicina-do-trabalho | 200 | ok | 53 | 140 | ok | 5 | 927 | 12 | 7 | 2/2 | 8/8 | ok | ok | ok |
| /especialidades/cardiologista | 200 | ok | 46 | 152 | ok | 5 | 730 | 9 | 8 | 3/3 | 7/7 | ok | ok | ok |
| /especialidades/pediatra | 200 | ok | 41 | 135 | ok | 5 | 566 | 8 | 5 | 3/3 | 7/7 | ok | ok | ok |
| /convenios | 200 | ok | 59 | 160 | ok | 4 | 326 | 4 | 19 | 0/1 | 2/7 | — | ok | ok |
| /contato | 200 | ok | 40 | 152 | ok | 4 | 127 | 1 | 6 | 1/1 | 7/7 | ok | ok | ok |
| /blog/hipoglicemia-sintomas-e-exames | 200 | ok | 51 | 124 | ok | 5 | 1566 | 11 | 23 | 0/5 | 3/7 | — | ok | ok |
| /blog/exames-de-sangue-guia-completo | 200 | ok | 60 | 149 | ok | 5 | 1909 | 9 | 26 | 0/5 | 3/7 | — | ok | ok |
| /blog/saude-do-coracao-prevencao | 200 | ok | 52 | 147 | ok | 5 | 1710 | 14 | 24 | 0/4 | 3/7 | — | ok | ok |
| /blog/alimentacao-e-exames-laboratoriais | 200 | ok | 58 | 149 | ok | 5 | 1660 | 11 | 26 | 0/5 | 3/7 | — | ok | ok |
| /blog/vitamina-d-importancia-saude | 200 | ok | 56 | 145 | ok | 5 | 1861 | 12 | 25 | 0/5 | 3/7 | — | ok | ok |
| /blog/hemograma-completo-o-que-avalia | 200 | ok | 51 | 150 | ok | 5 | 1912 | 15 | 25 | 0/5 | 3/7 | — | ok | ok |
| /blog/tomografia-computadorizada-como-funciona | 200 | ok | 58 | 134 | ok | 4 | 1258 | 15 | 24 | 0/5 | 3/7 | — | ok | ok |
| /blog/mapa-ou-holter-diferenca | 200 | ok | 49 | 130 | ok | 4 | 1417 | 14 | 23 | 0/5 | 3/7 | — | ok | ok |
| /blog/check-up-medico-quais-exames-fazer | 200 | ok | 52 | 136 | ok | 4 | 1625 | 17 | 25 | 0/5 | 3/7 | — | ok | ok |
| /blog/diferenca-ultrassom-comum-doppler | 200 | ok | 56 | 123 | ok | 5 | 1267 | 14 | 23 | 0/5 | 3/7 | — | ok | ok |
| /blog/mamografia-ultrassom-mamas-diferencas | 200 | ok | 60 | 150 | ok | 5 | 1294 | 13 | 23 | 0/5 | 3/7 | — | ok | ok |
| /blog/diferenca-raio-x-tomografia | 200 | ok | 54 | 122 | ok | 5 | 1295 | 13 | 24 | 0/5 | 3/7 | — | ok | ok |
| /blog/eletrocardiograma-o-que-e-como-e-feito | 200 | ok | 57 | 148 | ok | 5 | 1804 | 16 | 25 | 0/5 | 3/7 | — | ok | ok |
| /blog/como-escolher-laboratorio-analises-clinicas | 200 | ok | 50 | 146 | ok | 5 | 1297 | 15 | 24 | 0/5 | 3/7 | — | ok | ok |
| /blog/resultado-de-exames-online-seguranca | 200 | ok | 48 | 137 | ok | 5 | 1208 | 10 | 25 | 0/5 | 3/7 | — | ok | ok |
| /blog/exame-de-urina-eas-como-coletar | 200 | ok | 53 | 147 | ok | 5 | 1574 | 13 | 25 | 0/5 | 3/7 | — | ok | ok |
| /blog/siglas-exames-laboratoriais | 200 | ok | 52 | 147 | ok | 5 | 2607 | 18 | 25 | 0/5 | 3/7 | — | ok | ok |
| /sobre | 200 | ok | 48 | 136 | ok | 4 | 293 | 6 | 12 | 2/2 | 6/6 | ok | ok | ok |
| /blog/aso-exames-ocupacionais | 200 | ok | 54 | 141 | ok | 5 | 1574 | 16 | 23 | 0/5 | 3/7 | — | ok | ok |
| /blog/exame-toxicologico-cnh | 200 | ok | 58 | 133 | ok | 5 | 1605 | 16 | 23 | 0/5 | 3/7 | — | ok | ok |
| /privacidade | 200 | ok | 60 | 124 | ok | 2 | 231 | 4 | 0 | 0/1 | 1/5 | — | ok | ok |

**Falha restante:** `/cartao` — 0 H1 e nenhum conteúdo no HTML do servidor (a página só existe
depois do JavaScript; o pré-render não tem bloco para ela) e description de 109 caracteres.
Não corrigida: o Alex decidiu não mexer em `/cartao` (preços do plano). Fica na §9. Era igual
na main.

Observação: nas páginas de serviço o número de links internos **no `<main>`** caiu (ex.:
hemograma 20 → 9), porque o pré-render antigo terminava com uma grade fixa de "outros exames";
o modelo novo tem links escolhidos ("Saiba mais", "Exames relacionados"). Todos os exames e
especialidades continuam linkados no menu e no rodapé do HTML do servidor (17 destinos em
`/exames/*` e `/especialidades/*` a partir do hemograma). Exceção: `/exames/exame-admissional`
não está no menu/rodapé — só nos hubs, na medicina do trabalho e nos relacionados.

### 2.2 Defeitos achados e corrigidos nesta fase (dado/atributo, sem mudança de comportamento)

Na primeira passada o branch tinha 38/49. Corrigido:

| Defeito | Onde | Correção |
|---|---|---|
| description fora de 120–160: hemograma 164, Holter 112, ECG 113, EEG 117 | `client/src/lib/examesData.ts` (`metaDescription`) | reescritas só com fatos já na página (registro contínuo, arritmias, 5 a 10 min, não invasivo, "resultado em curto prazo") — 153 a 158 car. |
| bioimpedância 111 | `shared/const.ts` (`BIOIMPEDANCIA_DESCRIPTION`) | 148 car. |
| `/exames` 165 | `ExamesHub.tsx` e `routes-metadata.ts` | 157 car. |
| `/blog`: description 115 no servidor e outra de 196 no React; title de 54 no servidor trocado por um de 75 no React | `Blog.tsx`, `routes-metadata.ts` | `BLOG_TITLE`/`BLOG_DESCRIPTION` em `shared/const.ts`, lidos pelos dois lados (145 car.) |
| 6 artigos (hipoglicemia, tomografia, MAPA ou Holter, check-up, como escolher laboratório, resultado online): o React trocava a description do servidor pelo `excerpt` (até 211 car.) | `BlogPost.tsx`, `index.json` e os 6 JSON | campo `metaDescription` no índice/artigo (o texto que o servidor já servia), lido pelo servidor e pelo React; teste novo em `server/blog-exames.test.ts` |
| `/convenios` e `/privacidade`: description diferente no React | `Convenios.tsx`, `Privacidade.tsx` | o React repete a do servidor |
| cards do blog (home e `/blog`) sem width/height | `Blog.tsx`, `BlogPreviewSection.tsx` | `width={1024} height={640}`, como os relacionados do artigo (Fase 4); a caixa já tinha `aspect-[16/10]`, então nada muda visualmente; teste novo |

Na main (mesmo script, 45 URLs) **nenhuma** URL passava: em nenhuma das 45 o WhatsApp era
link (`<button>` sem href); title, description ou canonical eram trocados pelo React em 19
páginas; 9 descriptions fora da faixa; imagens sem dimensões em 24 páginas; `/cartao` sem H1;
e o "Ligar" ausente da página montada de `/bioimpedancia` e `/laboratorio-caraguatatuba`.

### 2.3 Sitemap, redirecionamentos e 404 (servidor local, com `Host`/`X-Forwarded-Proto` de produção)

- `sitemap.xml`: **49 `<loc>`, 49 `<lastmod>`** (main: 45 e 19). Nenhuma URL do sitemap redireciona (todas 200).
- Um salto só: `http://www.…/exames/hemograma/` → 301 `https://totalquality.med.br/exames/hemograma`;
  `/exames/`, `/blog/` → sem barra; `/outubro-rosa` e `/exames/mamografia` → `/exames/ultrassonografia`;
  `/posts/hemograma-completo-o-que-ele-pode-revelar` → `/blog/hemograma-completo-o-que-avalia`;
  `/posts/qualquer-coisa?utm_source=x` → `/blog?utm_source=x`; `/category/saude` → `/blog`;
  `/about-us` → `/sobre`. `/faq` → 410.
- 404: status 404, `noindex, follow`, sem canonical.
- `/favicon.ico` 200 `image/x-icon` (`max-age=86400`, sem `immutable`); `/site.webmanifest` 200.

## 3. Servidor × DOM renderizado (`scripts/paridade-ssr.mjs`)

Compara o HTML do servidor (JS desligado) com a página hidratada: H1, sequência de H2/H3, FAQ,
links do `#root`, FAQPage × FAQ visível, avisos de hidratação no console e se o React
reaproveitou o DOM do servidor.

| Rota | H1 | H2/H3 | FAQ | Links | Resultado |
|---|---|---|---|---|---|
| /exames/hemograma | Hemograma Completo em Caraguatatuba | 22 | 7 | 100 | ok, sem aviso de hidratação |
| /exames/ultrassonografia | Ultrassonografia em Caraguatatuba | 23 | 7 | 99 | ok |
| /especialidades/endocrinologista | Endocrinologista em Caraguatatuba | 21 | 6 | 98 | ok |
| /laboratorio-caraguatatuba | Análises clínicas em Caraguatatuba | 27 | 6 | 122 | ok |
| /checkup | Check-up Preventivo em Caraguatatuba | 25 | 6 | 102 | ok |
| /bioimpedancia | Bioimpedância em Caraguatatuba | 21 | 7 | 96 | ok |
| /exames/raio-x | Raio-X em Caraguatatuba | 23 | 6 | 99 | ok |
| /especialidades/cardiologista | Cardiologista em Caraguatatuba | 20 | 6 | 97 | ok |
| /especialidades/pediatra | Pediatra em Caraguatatuba | 19 | 5 | 94 | ok |
| /sobre | Sobre a Total Quality em Caraguatatuba | 19 | — | 94 | ok |
| /contato | Contato da Total Quality em Caraguatatuba | 9 | — | 89 | ok |
| /especialidades | Especialidades em Caraguatatuba | 15 | — | 87 | ok |

**12/12 rotas idênticas.** Para as rotas que não são SSR (home, `/exames`, blog, convênios,
privacidade) a auditoria da §2 confere que title, description e canonical não mudam depois do
React — ok em todas.

## 4. Desempenho antes × depois

### 4.1 Método

**Lighthouse 12.6.1** (`npx lighthouse`, só a categoria desempenho) com o Chromium do
Playwright (`/opt/pw-browsers/chromium-1243`, Chrome for Testing 153, `--headless=new
--no-sandbox`) contra o servidor de produção local: main na 3200, branch na 3100. Perfis:
padrão do Lighthouse (celular simulado: Moto G Power, 4G lento, CPU 4×) e `--preset=desktop`.
**3 execuções** por combinação, mediana. Terceiros bloqueados nos dois lados
(`--blocked-url-patterns` para GTM, GA, Facebook, DoubleClick, Google Maps e `/metrics/`), para
comparar só o código do site. O Lighthouse rodou — não foi preciso o plano B com
PerformanceObserver; usei PerformanceObserver (Playwright) só para achar a origem do CLS (§4.3).

### 4.2 Resultados (mediana de 3)

| Página | Perfil | Versão | Nota | LCP | CLS | TBT | FCP | JS transferido | Total transferido | Execuções |
|---|---|---|---|---|---|---|---|---|---|---|
| / | mobile | antes (main) | 93 | 3.03 s | 0.000 | 65 ms | 1.71 s | 152.0 KB | 294.6 KB | 3 (CLS: 0.000, 0.217, 0.000) |
| / | mobile | depois (branch) | 98 | 2.26 s | 0.000 | 6 ms | 1.56 s | 177.5 KB | 308.3 KB | 3 (CLS: 0.000, 0.000, 0.000) |
| / | desktop | antes (main) | 100 | 0.68 s | 0.000 | 0 ms | 0.38 s | 152.0 KB | 336.0 KB | 3 (CLS: 0.000, 0.000, 0.241) |
| / | desktop | depois (branch) | 100 | 0.81 s | 0.000 | 0 ms | 0.38 s | 177.5 KB | 349.8 KB | 3 (CLS: 0.000, 0.000, 0.000) |
| /exames/hemograma | mobile | antes (main) | 93 | 3.06 s | 0.000 | 0 ms | 1.71 s | 177.1 KB | 317.3 KB | 3 (CLS: 0.000, 0.000, 0.050) |
| /exames/hemograma | mobile | depois (branch) | 97 | 2.49 s | 0.000 | 0 ms | 1.71 s | 203.3 KB | 343.7 KB | 3 (CLS: 0.000, 0.000, 0.000) |
| /exames/hemograma | desktop | antes (main) | 100 | 0.66 s | 0.000 | 0 ms | 0.39 s | 177.1 KB | 317.3 KB | 3 (CLS: 0.000, 0.000, 0.000) |
| /exames/hemograma | desktop | depois (branch) | 100 | 0.65 s | 0.000 | 0 ms | 0.46 s | 203.3 KB | 357.8 KB | 3 (CLS: 0.000, 0.000, 0.000) |
| /blog/hemograma-completo-o-que-avalia | mobile | antes (main) | 82 | 4.69 s | 0.000 | 0 ms | 1.66 s | 168.3 KB | 526.3 KB | 3 (CLS: 0.046, 0.000, 0.000) |
| /blog/hemograma-completo-o-que-avalia | mobile | depois (branch) | 83 | 4.63 s | 0.000 | 33 ms | 1.55 s | 164.3 KB | 488.9 KB | 3 (CLS: 0.046, 0.000, 0.000) |
| /blog/hemograma-completo-o-que-avalia | desktop | antes (main) | 96 | 1.46 s | 0.000 | 0 ms | 0.38 s | 168.3 KB | 526.3 KB | 3 (CLS: 0.000, 0.054, 0.000) |
| /blog/hemograma-completo-o-que-avalia | desktop | depois (branch) | 97 | 1.33 s | 0.000 | 0 ms | 0.37 s | 164.3 KB | 488.8 KB | 3 (CLS: 0.000, 0.000, 0.000) |

Leitura:
- **Celular:** LCP da home 3,03 → 2,26 s e do hemograma 3,06 → 2,49 s. Na main o elemento LCP
  da primeira visita era o texto do banner de cookies (pintado só depois do JS); no branch, no
  hemograma, passa a ser a resposta curta do topo, já no HTML do servidor (SSR). Artigo
  praticamente igual (LCP ~4,7 s nos dois — é a foto do topo do artigo; candidata a próxima
  otimização).
- **Desktop:** tudo ≥ 96 nos dois lados; diferenças dentro do ruído.
- **CLS:** mediana 0 nos dois lados, mas a main teve execuções com CLS 0,217 (home celular),
  0,241 (home desktop), 0,050 (hemograma celular) e 0,054 (artigo desktop); o branch teve 0 em
  todas as 18 execuções, exceto 0,046 no artigo celular (presente também na main).
- **JS transferido** sobe na home (152 → 177,5 KB) e no hemograma (177 → 203 KB): o JS de
  entrada caiu, mas a página agora baixa o próprio chunk (Home / PaginaServico) e o React da
  hidratação; no artigo cai (168 → 164 KB). O peso total segue entre 300 e 490 KB.

### 4.3 CLS intermitente nas páginas pré-renderizadas (pré-existente, não corrigido)

Medindo com `PerformanceObserver` (`layout-shift`, 6 recargas por rota, terceiros bloqueados):

| Rota / perfil | main | branch |
|---|---|---|
| `/laboratorio-caraguatatuba` desktop 1350 px | 0 / 0,028 (2 de 6) | **0 nas 6** |
| `/` celular 412 px | 0,217 em 1 de 6 | 0,217 em 2 de 6 |
| `/` desktop 1350 px | — | 0 nas 6 |
| `/convenios` celular | — | 0,091 em 2 de 4 |
| `/blog/hemograma-completo-o-que-avalia` celular | — | 0 nas 4 |

O deslocamento acontece a ~60–100 ms, no H1/parágrafo/lista do topo, e só nas rotas que ainda
usam o **pré-render escrito à mão** (home, convênios): quando o navegador chega a pintar o
bloco do servidor antes de o React montar, o React troca o `#root` por um layout ligeiramente
diferente. As rotas com SSR + hidratação (Fase 1) não têm esse salto. Não é regressão (a main
tem o mesmo) e a correção não é de dado — é levar o SSR + hidratação também à home, `/exames`,
`/convenios` e blog. **Recomendação para a próxima etapa**, não bloqueio. Conferir no PageSpeed
real após o deploy (§8): a meta do Alex é CLS desktop < 0,1, que o laboratório já cumpre aqui.

## 5. `TODO(alex)` — o que falta para completar as páginas

18 marcadores `// TODO(alex)` foram introduzidos neste projeto (`git grep "TODO(alex)"`; a
`main` não tinha nenhum). Em todos, o bloco correspondente **não aparece** na página — nenhum
placeholder vai ao ar. Há ainda 5 menções explicativas ao padrão (cabeçalhos de
`PaginaServico.tsx`, `modeloPagina.ts`, `paginas/exames.ts`, `paginas/especialidades.ts`,
`especialidadesData.ts`) que não são pendências.

| # | Arquivo:linha | Página | Informação que falta |
|---|---|---|---|
| 1 | `client/src/lib/paginas/especialidades.ts:153` | /especialidades/medicina-do-trabalho | foto real de atendimento ocupacional (a do PR #87 depende de aprovação) |
| 2 | `client/src/lib/paginas/especialidades.ts:224` | /especialidades/cardiologista | dias e horários; o que acontece na consulta (o que o médico avalia e pede); se atende retorno com laudo; faixa etária; convênios aceitos na consulta |
| 3 | `client/src/lib/paginas/especialidades.ts:276` | /especialidades/pediatra | faixa etária; dias e horários; o que levar (caderneta, cartão de vacina?); se a clínica vacina; quais exames infantis são coletados; convênios da consulta |
| 4 | `client/src/lib/paginas/exames.ts:118` | /exames/exames-de-sangue | jejum do perfil lipídico diverge (dado: 8–12 h; artigo: não obrigatório na maioria) — tratado no PR #101 |
| 5 | `client/src/lib/paginas/exames.ts:358` | /exames/tomografia-computadorizada | se a clínica faz angiotomografia (o artigo cita; ficou fora) |
| 6 | `client/src/lib/paginas/exames.ts:380` | /exames/raio-x | foto real da sala/aparelho de raio-X |
| 7 | `client/src/lib/paginas/exames.ts:459` | /exames/mapa | foto do aparelho de MAPA |
| 8 | `client/src/lib/paginas/exames.ts:527` | /exames/holter | foto do Holter |
| 9 | `client/src/lib/paginas/exames.ts:595` | /exames/eletrocardiograma | foto do eletrocardiógrafo (`cardiologia-*.webp` é de ultrassom com Doppler) |
| 10 | `client/src/lib/paginas/exames.ts:662` | /exames/eletroencefalograma | se o EEG exige jejum (linha "Jejum" fora do resumo); foto do aparelho |
| 11 | `client/src/lib/paginas/exames.ts:726` | /exames/espirometria | se há jejum (o dado só diz "evitar refeições pesadas 2 h antes"); artigo de espirometria ainda rascunho; foto do espirômetro |
| 12 | `client/src/lib/paginas/exames.ts:791` | /exames/exame-toxicologico | se exige pedido médico; foto da coleta |
| 13 | `client/src/lib/paginas/exames.ts:860` | /exames/sexagem-fetal | se exige pedido médico (o dado só diz "fale com a equipe") |
| 14 | `client/src/lib/paginas/exames.ts:915` | /exames/exame-admissional | foto real de atendimento ocupacional (PR #87) |
| 15 | `client/src/lib/paginasServico.ts:87` | /checkup | "Para quem é indicado" (faixas etárias e periodicidade do pré-render antigo) — recomendação médica sem fonte, aguarda confirmação do texto |
| 16 | `client/src/lib/paginasServico.ts:234` | /checkup | se os pacotes são cobertos por Cartão de Todos, Solumedi ou Leader |
| 17 | `client/src/lib/paginasServico.ts:292` | /bioimpedancia | se o exame é coberto por convênio; foto do aparelho |
| 18 | `client/src/pages/CheckUp.tsx:42` | /checkup | número de exames do plano intermediário (subtítulo dizia "30", a lista soma 31 dosagens) |


## 6. Antes × depois por página

Mesmo script (`scripts/auditoria-sitemap.mjs`, contagem no `<main>` do HTML do servidor), main
× branch. "Imagens" = `<img>` dentro do conteúdo principal no HTML do servidor (o pré-render
antigo não tinha nenhuma).

| Página | Palavras (antes → depois) | H2 | Links internos | Imagens no conteúdo |
|---|---|---|---|---|
| / | 456 → 464 | 4 → 4 | 19 → 22 | 0 → 0 |
| /bioimpedancia | 477 → 823 | 5 → 10 | 15 → 5 | 0 → 2 |
| /checkup | 315 → 994 | 5 → 11 | 15 → 8 | 0 → 2 |
| /especialidades (nova) | — → 230 | — → 3 | — → 7 | — → 1 |
| /especialidades/cardiologista (nova) | — → 730 | — → 9 | — → 8 | — → 2 |
| /especialidades/endocrinologista | 559 → 785 | 8 → 10 | 16 → 8 | 0 → 2 |
| /especialidades/gastroenterologista | 597 → 834 | 8 → 10 | 16 → 7 | 0 → 2 |
| /especialidades/medicina-do-trabalho | 590 → 927 | 8 → 12 | 17 → 7 | 0 → 1 |
| /especialidades/pediatra (nova) | — → 566 | — → 8 | — → 5 | — → 2 |
| /exames | 285 → 355 | 6 → 7 | 15 → 21 | 0 → 0 |
| /exames/eletrocardiograma | 368 → 794 | 8 → 11 | 16 → 8 | 0 → 1 |
| /exames/eletroencefalograma | 377 → 610 | 7 → 10 | 16 → 5 | 0 → 1 |
| /exames/espirometria | 387 → 672 | 7 → 10 | 15 → 5 | 0 → 1 |
| /exames/exame-admissional | 522 → 920 | 8 → 12 | 17 → 7 | 0 → 1 |
| /exames/exame-toxicologico | 520 → 952 | 8 → 11 | 17 → 7 | 0 → 1 |
| /exames/exames-de-sangue | 658 → 1102 | 9 → 12 | 23 → 10 | 0 → 2 |
| /exames/hemograma | 568 → 1041 | 8 → 11 | 20 → 9 | 0 → 2 |
| /exames/holter | 389 → 776 | 8 → 11 | 16 → 8 | 0 → 1 |
| /exames/mapa | 460 → 836 | 8 → 11 | 16 → 7 | 0 → 1 |
| /exames/raio-x | 396 → 796 | 8 → 12 | 17 → 7 | 0 → 1 |
| /exames/sexagem-fetal | 656 → 847 | 7 → 9 | 16 → 5 | 0 → 2 |
| /exames/tomografia-computadorizada | 482 → 895 | 8 → 12 | 17 → 7 | 0 → 2 |
| /exames/ultrassonografia | 476 → 985 | 8 → 12 | 17 → 7 | 0 → 2 |
| /laboratorio-caraguatatuba | 662 → 1340 | 7 → 14 | 23 → 22 | 0 → 2 |
| /blog | 757 → 766 | 2 → 2 | 34 → 37 | 0 → 0 |
| /cartao | 0 → 0 | 0 → 0 | 0 → 0 | 0 → 0 |
| /contato (nova) | — → 127 | — → 1 | — → 6 | — → 0 |
| /convenios | 320 → 326 | 4 → 4 | 16 → 19 | 0 → 0 |
| /outubro-rosa (removida, 301) | 371 → — | 5 → — | 16 → — | 0 → — |
| /privacidade | 231 → 231 | 4 → 4 | 0 → 0 | 0 → 0 |
| /sobre (nova) | — → 293 | — → 6 | — → 12 | — → 1 |
| /blog/alimentacao-e-exames-laboratoriais | 1645 → 1660 | 11 → 11 | 23 → 26 | 0 → 0 |
| /blog/aso-exames-ocupacionais | 1559 → 1574 | 16 → 16 | 20 → 23 | 0 → 0 |
| /blog/check-up-medico-quais-exames-fazer | 1610 → 1625 | 17 → 17 | 22 → 25 | 0 → 0 |
| /blog/como-escolher-laboratorio-analises-clinicas | 1282 → 1297 | 15 → 15 | 21 → 24 | 0 → 0 |
| /blog/diferenca-raio-x-tomografia | 1276 → 1295 | 13 → 13 | 21 → 24 | 0 → 0 |
| /blog/diferenca-ultrassom-comum-doppler | 1252 → 1267 | 14 → 14 | 20 → 23 | 0 → 0 |
| /blog/eletrocardiograma-o-que-e-como-e-feito | 1789 → 1804 | 16 → 16 | 22 → 25 | 0 → 0 |
| /blog/exame-de-urina-eas-como-coletar | 1561 → 1574 | 13 → 13 | 22 → 25 | 0 → 0 |
| /blog/exame-toxicologico-cnh | 1590 → 1605 | 16 → 16 | 20 → 23 | 0 → 0 |
| /blog/exames-de-sangue-guia-completo | 1894 → 1909 | 9 → 9 | 23 → 26 | 0 → 0 |
| /blog/hemograma-completo-o-que-avalia | 1897 → 1912 | 15 → 15 | 22 → 25 | 0 → 0 |
| /blog/hipoglicemia-sintomas-e-exames | 1551 → 1566 | 11 → 11 | 20 → 23 | 0 → 0 |
| /blog/mamografia-ultrassom-mamas-diferencas | 1279 → 1294 | 13 → 13 | 20 → 23 | 0 → 0 |
| /blog/mapa-ou-holter-diferenca | 1392 → 1417 | 14 → 14 | 20 → 23 | 0 → 0 |
| /blog/resultado-de-exames-online-seguranca | 1193 → 1208 | 10 → 10 | 22 → 25 | 0 → 0 |
| /blog/saude-do-coracao-prevencao | 1687 → 1710 | 14 → 14 | 21 → 24 | 0 → 0 |
| /blog/siglas-exames-laboratoriais | 2591 → 2607 | 18 → 18 | 22 → 25 | 0 → 0 |
| /blog/tomografia-computadorizada-como-funciona | 1243 → 1258 | 15 → 15 | 21 → 24 | 0 → 0 |
| /blog/vitamina-d-importancia-saude | 1846 → 1861 | 12 → 12 | 22 → 25 | 0 → 0 |

Páginas nas duas versões: 44. Somas: palavras 41645 → 49514; H2 425 → 494; links 813 → 709; imagens 0 → 29

Páginas de serviço: de 315–662 para **566–1.340 palavras** (mínimo: pediatra, 566), 7–14 H2,
1–2 fotos reais com dimensões. Blog: +13 a +25 palavras por artigo (revisor e datas no topo,
quadro de contato no primeiro terço) e +3 links internos (página de serviço com texto
descritivo). `/cartao` segue vazio no HTML do servidor (§9).


## 7. URLs para pedir reindexação no Search Console

Inspeção de URL → "Solicitar indexação", na ordem abaixo (o GSC limita os pedidos por dia —
cerca de 10 a 12 por propriedade; seguir a ordem em dias consecutivos). Antes, reenviar o
sitemap (`https://totalquality.med.br/sitemap.xml`, 49 URLs).

**Dia 1 — páginas novas**
1. https://totalquality.med.br/especialidades
2. https://totalquality.med.br/especialidades/cardiologista
3. https://totalquality.med.br/especialidades/pediatra
4. https://totalquality.med.br/sobre
5. https://totalquality.med.br/contato

**Dias 1–2 — as 19 páginas de serviço reescritas no modelo novo**
6. https://totalquality.med.br/laboratorio-caraguatatuba
7. https://totalquality.med.br/exames/exames-de-sangue
8. https://totalquality.med.br/exames/hemograma
9. https://totalquality.med.br/exames/ultrassonografia
10. https://totalquality.med.br/exames/tomografia-computadorizada
11. https://totalquality.med.br/exames/raio-x
12. https://totalquality.med.br/exames/exame-admissional
13. https://totalquality.med.br/exames/exame-toxicologico
14. https://totalquality.med.br/exames/sexagem-fetal
15. https://totalquality.med.br/exames/mapa
16. https://totalquality.med.br/exames/holter
17. https://totalquality.med.br/exames/eletrocardiograma
18. https://totalquality.med.br/exames/eletroencefalograma
19. https://totalquality.med.br/exames/espirometria
20. https://totalquality.med.br/especialidades/endocrinologista
21. https://totalquality.med.br/especialidades/gastroenterologista
22. https://totalquality.med.br/especialidades/medicina-do-trabalho
23. https://totalquality.med.br/checkup
24. https://totalquality.med.br/bioimpedancia

**Dia 3 — os 4 artigos com title/description novos (Fase 4)**
25. https://totalquality.med.br/blog/exame-de-urina-eas-como-coletar
26. https://totalquality.med.br/blog/eletrocardiograma-o-que-e-como-e-feito
27. https://totalquality.med.br/blog/hemograma-completo-o-que-avalia
28. https://totalquality.med.br/blog/exames-de-sangue-guia-completo

**Depois (menor prioridade):** home, `/exames`, `/blog` (description nova nesta fase), os
6 artigos cuja description deixou de ser trocada pelo React (hipoglicemia, tomografia, MAPA ou
Holter, check-up, como escolher laboratório, resultado online). Os 301
(`/outubro-rosa`, `/exames/mamografia`, `/posts/*`) não precisam de pedido: o Google
reprocessa ao rastrear; conferir em "Página com redirecionamento" em 28 dias.

## 8. Checklist pós-deploy (produção)

Rodar **sem compressão** (`curl` sem `--compressed`): as requisições comprimidas deste IP
recebem o anti-bot da Hostinger.

**Redirecionamentos (um salto, 301, destino final direto)**
```bash
for u in http://totalquality.med.br/ http://www.totalquality.med.br/exames/hemograma/ \
  https://www.totalquality.med.br/ https://totalquality.med.br/exames/ https://totalquality.med.br/blog/ \
  https://totalquality.med.br/exames/hemograma/ https://totalquality.med.br/outubro-rosa \
  https://totalquality.med.br/exames/mamografia \
  https://totalquality.med.br/posts/hemograma-completo-o-que-ele-pode-revelar \
  "https://totalquality.med.br/posts/qualquer?utm_source=x" https://totalquality.med.br/category/saude \
  https://totalquality.med.br/about-us; do
  curl -s -o /dev/null -w "%{http_code} $u -> %{redirect_url}\n" "$u"; done
```
- [ ] cada um responde **301** direto para a forma final (https, sem www, sem barra), query preservada
- [ ] `http://www.…` — hoje a CDN da Hostinger dá um 1º salto http→https **mantendo o www**; com o
      código novo o 2º salto já vai ao destino final. Se ainda houver 2 saltos, é o hPanel (pendência §9)
- [ ] `/outubro-rosa` e `/exames/mamografia` → `/exames/ultrassonografia`; `/faq` → 410;
      `/uma-pagina-que-nao-existe` → 404 com `noindex` e sem canonical
- [ ] `curl -sI https://totalquality.med.br/favicon.ico` → 200 `image/x-icon`, **sem** `immutable`;
      `/site.webmanifest` → 200
- [ ] `curl -s https://totalquality.med.br/sitemap.xml | grep -c "<loc>"` = 49 e `grep -c "<lastmod>"` = 49
- [ ] `node scripts/auditoria-sitemap.mjs https://totalquality.med.br` (de uma máquina fora do
      sandbox) → 48/49 (só `/cartao`) e `node scripts/paridade-ssr.mjs https://totalquality.med.br` → ok

**PageSpeed Insights** (pagespeed.web.dev — dado de laboratório do Google; o de campo só muda em 28 dias)
- [ ] `/laboratorio-caraguatatuba` e `/exames/hemograma` desktop: **CLS < 0,1** (era 0,254)
- [ ] home e `/blog/hemograma-completo-o-que-avalia`, celular e desktop: anotar LCP, CLS, INP/TBT

**GTM — Tag Assistant** (tagassistant.google.com, contêiner GTM-WLR7JD57), aceitar cookies:
- [ ] clique em WhatsApp de uma página de exame → `whatsapp_click` com `lead_source`,
      `exam_type`, `value`, `currency: BRL`; o formulário de qualificação abre; envio → `lead_qualificado`
- [ ] botão "Ligar" → `phone_click` no clique (mesma origem de antes), o formulário de qualificação abre (decisão de 15/11); envio → `lead_qualificado` e o discador
- [ ] "Resultados" no menu → `results_online_click`
- [ ] artigo do blog: quadro do meio → `lead_source: artigo_cta_meio`; do fim → `artigo_cta_fim`
- [ ] GA4 Tempo real e Meta Events Manager recebendo; recarregar como visitante que volta (consentimento salvo vira `update`)

**Rich Results Test** (search.google.com/test/rich-results), sem erro:
- [ ] `/exames/hemograma` (MedicalWebPage + MedicalTest, FAQPage, BreadcrumbList)
- [ ] `/blog/hemograma-completo-o-que-avalia` (BlogPosting, revisor, FAQPage se houver)
- [ ] `/` (MedicalBusiness/DiagnosticLab/MedicalClinic, WebSite, FAQPage)

**Operação**
- [ ] **Recepção avisada** de que o WhatsApp chega com o texto novo pré-preenchido:
      "Olá, vim pelo site e quero informações sobre [exame]" (mais o código de referência
      do anúncio, quando houver) — muda a primeira mensagem que a equipe vê
- [ ] **Google Ads:** nenhum anúncio/sitelink com URL final em `/outubro-rosa` (esperado: nenhum
      — campanha encerrada em 31/10). Se houver, trocar pela URL final de destino
      (`/exames/ultrassonografia`) em vez de depender do 301
- [ ] Search Console: reenviar o sitemap e pedir a reindexação da §7
- [ ] fechar o PR #68 (já incorporado no #105) e atualizar título/descrição do PR #105
      (ainda diz "Fase 0: plano")

## 9. Pendências fora do repositório (ou que dependem do Alex)

| Pendência | Onde | Por que importa |
|---|---|---|
| Redirect http→https da CDN da Hostinger mantém o `www` (2 saltos em `http://www.…`) | hPanel da Hostinger | o código já faz o resto em 1 salto; o 1º salto é da CDN |
| `clientParamBuilder` da Meta: disparar a tag após consentimento/interação | contêiner GTM (pacote no repositório de SEO) | aviso da Meta; não mexer no snippet do `index.html` |
| Logo vetorial quadrado | arte (Alex) | o favicon atual foi recortado do símbolo do logo 276×96; uma versão vetorial quadrada melhora 512 px e o ícone no Google |
| PR #94 (blog unificado / subdomínio) e PR #101 (texto médico) em conflito com `client/src/content/blog/index.json` | GitHub | esta fase acrescentou `metaDescription` a 6 artigos no índice e nos JSON — o rebase desses PRs vai precisar resolver essas linhas |
| `blog.totalquality.med.br` no ar (Vercel, canonical próprio) | DNS/Vercel + PR #94 | conteúdo duplicado fora do domínio; não mexido por decisão |
| `/cartao`: preços dos planos publicados; **sem H1 nem conteúdo no HTML do servidor** (só React); description de 109 caracteres | `CartaoPage.tsx`, `cartaoPlanos.ts` | única URL do sitemap que reprova na auditoria; não mexida por decisão do Alex (14/11) |
| Página de exame de DNA | conteúdo (Alex) | realizado, mas sem nenhum dado no repositório além da sexagem fetal — não publicada |
| Cardiologista e pediatra: detalhes da consulta | conteúdo (Alex) | itens 2 e 3 da §5; páginas no ar só com o que vale para toda consulta |
| Coleta "sem agendamento, por ordem de chegada" × "ou com horário marcado" | Alex | redação mantida como estava; confirmar a regra |
| Fotos reais (raio-X, MAPA, Holter, ECG, EEG, espirômetro, coleta, ocupacional) | Alex | itens 6–14 da §5 |
| Validação de eventos com Tag Assistant e PageSpeed reais | produção, fora do sandbox | só valem depois do deploy (§8) |

## 10. O que deveria bloquear o merge?

**Nada técnico.** Build, testes e tipos ok; 48/49 URLs aprovadas (a 49ª é `/cartao`, intocada
por decisão e igual à main); paridade ok; nenhum indicador de laboratório piorou. Antes de
mergear (o merge é o deploy):

1. **Revisão do Alex do texto novo** — especialmente as páginas de cardiologista e pediatra
   (no ar só com o que vale para toda consulta) e as descriptions reescritas nesta fase.
2. **Aviso à recepção** sobre o texto pré-preenchido do WhatsApp (§8) — muda o que a equipe vê.
3. Ter alguém para rodar o checklist da §8 logo depois do deploy (Tag Assistant e PageSpeed só
   valem em produção).
4. Saber que os PRs #94 e #101 vão conflitar com `index.json`/artigos do blog (§9).

Riscos conhecidos, não bloqueantes: CLS intermitente nas rotas de pré-render à mão (home,
convênios — §4.3, igual à main); `/cartao` sem conteúdo no servidor.

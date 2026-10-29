# Site da Total Quality Medicina Diagnóstica

Contexto permanente deste repositório. Ler antes de agir.

## Onde está cada regra

| Documento | Assunto |
|---|---|
| `SEO_STANDARDS.md` | 17 regras técnicas de SEO — canonical, prerender, sitemap, schema |
| `docs/analytics.md` | Esquema completo de eventos, IDs oficiais e validação no Tag Assistant |
| `server/seo-content.test.ts` | Guard-rails: o teste é o contrato, não a documentação |

A base de conhecimento do trabalho de SEO e do perfil no Google vive no outro
repositório, `alexwaltersdorf/SEO---Total-Quality` (`CLAUDE.md` e
`REGRA-GTM-RASTREAMENTO.md`).

## Rastreamento — regra permanente

Vale para qualquer alteração que toque pixel, tag, evento ou conversão, mesmo
que o assunto principal da conversa seja outro.

1. **GTM-WLR7JD57 é o único distribuidor.** Proibido `fbq()`, `ttq.*`,
   `gtag('config')`, script do gtag no HTML e `<noscript>` de pixel — inclusive
   disfarçados de `(window as any).fbq()`. Meta e Ads se configuram no contêiner,
   nunca no código.
2. **IDs oficiais:** GA4 `G-FZH25GKTJ9`; Google Ads `AW-312778444` (conta
   920-715-3288, a que tem investimento, rótulo `JbzkCNiX6docEMy9kpUB`) e
   `AW-17886498822` (conta 660-569-9690); Meta Pixel `1868545660691533`, dentro
   do GTM. Nunca usar `G-KZGKP7ZCJG` nem o pixel `1536672876562340`.
3. **ID lido por API de conector só vale quebrado por `date` e pela dimensão
   mais granular, conferido em dois períodos.** Campo numérico é somado pelo
   conector: o antigo "AW-14387808424" era `46 × 312778444`.
4. **Rastreamento centralizado** em `client/src/lib/tracking.ts`. Zero
   `dataLayer.push` solto em componente.
5. **Evento canônico de conversão: `whatsapp_click`**, com `event_label`,
   `lead_source`, `exam_type`, `currency: "BRL"` e `value`. Formulário emite
   `form_submit`. `generate_lead` e `ads_conversion` estão aposentados.
6. **`page_view` tem fonte única:** o hook `usePageViewTracking`, montado uma vez
   no `App`. Nenhuma página chama `trackPageView`, e a configuração do GA4 no
   contêiner não pode emitir o dela.
7. **Todo CTA de WhatsApp abre em nova aba e dispara evento**; todo link `tel:`
   dispara `phone_click` com origem própria.
8. **Toda conversão passa pelo formulário de qualificação e leva `event_id`.**
   O clique no CTA emite `whatsapp_click` (intenção); a conversão do Ads é o
   envio do formulário (`trackLeadQualificado` → `event_label:
   "formulario_qualificacao"`), e o mesmo `event_id` vai ao servidor por
   `trackLeadDirect` (Meta CAPI e GA4 MP deduplicam). Formulário novo segue o
   modelo de `ContatoSection`/`ContatoLeadContext`; nunca contar conversão em
   tela de sucesso nem em janela aberta sozinha.
9. **Evento novo só existe se o GTM souber dele.** Nome novo entra em
   `tracking.ts` **e** no regex do gatilho GA4 do pacote
   (`gtm/gtm-import-rastreamento-v2-2026-10.json`, repo de SEO), com nota no
   `gtm/README.md`. Fora do regex, o evento vai ao dataLayer e não chega a lugar
   nenhum.
10. **Consentimento: default sempre negado; o salvo entra como `update`.** Nunca
    ler o consentimento salvo dentro do `default` — foi o que deixou o
    visitante que volta sem medição até 29/10/2026. `user_data` só sai por
    `trackLeadQualificado` e é limpo do dataLayer logo após o push.
11. **Use o que já é medido de graça:** pergunta frequente em `<details>` gera
    `faq_open` e link para `google.com/maps` gera `directions_click`
    (`useInteractionTracking`, no `App`). Não reimplementar com `onClick`.
12. **Blog — regra do pixel nos artigos** (decisão do Alex, 29/10/2026):
    - contato no artigo **só pelo `ExamCTA`** (meio e fim), que passa pelo
      formulário de qualificação com `lead_source` próprio
      (`artigo_cta_meio`/`artigo_cta_fim`) e o `examType` do artigo;
    - **nenhum link de WhatsApp, `tel:`, `wa.me` ou mapa no corpo** do artigo
      (`client/src/content/blog/<slug>.json`) — link no texto pula o formulário
      e o evento, e o lead some da planilha e do Ads. Texto vindo da Airticles
      perde esses links na migração;
    - todo artigo tem `examType` (dimensão do GA4 e valor do lead em
      `leadValues.ts`); o publicado tem também `examPages` (botão para a página
      do exame) — rascunho pode nascer sem;
    - nada de script, `onclick`, iframe ou pixel no corpo do artigo;
    - artigo novo com CTA diferente do `ExamCTA` precisa de evento no
      `tracking.ts` e de linha no regex do GTM (item 9) **antes** de publicar.
    Travas em `server/rastreamento-100.test.ts`.
13. **Antes de dizer que funciona:** Playwright com user agent de iPhone (o de
    headless é filtrado pelo Meta), aceitar os cookies, conferir dataLayer e
    rede (GA4 `/g/collect`, Ads com `label`, Meta `/tr`), recarregar como
    visitante que volta e enviar um formulário. Teste unitário não basta.

## LGPD — dado sensível de saúde

A clínica é um laboratório de análises clínicas: contato somado ao exame
procurado é **dado sensível** (art. 11 da LGPD), não apenas dado pessoal.

- **Nunca** dado pessoal ou tipo de exame em URL, query string, hash, nome de
  evento ou parâmetro. Entre telas, usar `sessionStorage` lido uma vez e apagado
  na leitura (`client/src/lib/leadHandoff.ts`).
- **Consent Mode v2 negado por padrão**, inline antes do GTM, com banner
  (`client/src/components/CookieConsent.tsx`).
- **Conversões aprimoradas só com SHA-256 no cliente**
  (`client/src/lib/userData.ts`) e só com consentimento de marketing. Texto puro
  jamais entra no dataLayer.
- **Não cruzar `user_data` com `exam_type`** em público, segmentação ou
  relatório — juntos permitem reidentificar quem procurou qual exame.

## Guard-rails

`server/seo-content.test.ts` quebra o build quando a regra é violada: pixel
direto em qualquer disfarce, evento aposentado, CTA de WhatsApp sem tracking ou
na mesma aba, link de telefone sem evento, PII em query string, contato em texto
puro no dataLayer, serviço não prestado em peça pública, horário divergente.

**Se um guard-rail falhar, corrigir o código — nunca afrouxar o teste.** Foi
assim que um `fbq` sobreviveu escondido em `(window as any).fbq()` e que o
`<noscript>` do pixel ficou para trás numa limpeza.

## Deploy

Push na `main` dispara `.github/workflows/deploy.yml`, que faz SSH para a
Hostinger, `git reset --hard origin/main`, build e restart do Passenger.
**Mergear o PR é o deploy** — não existe pipeline separada.

Nada medido em produção vale antes do deploy: até lá o contêiner não recebe
nenhum evento do código novo.

## Ambiente

Lighthouse e Playwright não rodam no sandbox — o proxy bloqueia navegadores.
Reportar apenas métricas medidas no build real, nunca estimar nota de
Lighthouse. Requisições comprimidas deste IP recebem o anti-bot da Hostinger
("Checking your browser"); só medições sem compressão são confiáveis daqui.

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

## Identificação profissional (CFM) — texto fixo

A Resolução CFM nº 2.336/2023 (arts. 4º, 5º e 6º) exige identificação em peça pública de
estabelecimento de saúde. Para a Total Quality os dados são estes, definidos pelo Alex:

- **Registro no CRM/SP: `970616`**
- **Responsável Técnico: `Alex Waltersdorf - 267.339`**

**Nunca escrever a sigla "CRM" no texto renderizado nem em campo de dado.** Só os números.
Vale para rodapé, `authorRole` de artigo, JSON-LD, meta tag, alt de imagem — qualquer coisa
que chegue ao usuário ou ao robô.

Bloco padrão:

> Total Quality Medicina Diagnóstica — Registro 970616
> Responsável Técnico: Alex Waltersdorf - 267.339

`266.339` é um número errado que já circulou em rascunho. Se aparecer, trocar por `267.339`.

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

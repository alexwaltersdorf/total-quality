# Esquema de rastreamento do site

Última revisão: 11/08/2026.

## Arquitetura

O site **não dispara nenhum pixel direto**. Todo evento vai para o `dataLayer` e
o **GTM (GTM-WLR7JD57) é o único distribuidor** para GA4, Google Ads e Meta.
Consequência prática: para mudar o destino de um evento mexe-se no contêiner,
não no código; e nenhum PR precisa carregar ID de plataforma nova.

O carregamento do GTM passa pelo **gateway first-party**: `client/index.html`
pede `/metrics/?id=GTM-WLR7JD57`, e `server/_core/tag-gateway.ts` faz proxy para
`GTM-WLR7JD57.fps.goog`. Se o gateway falhar, o `onerror` do script cai para
`googletagmanager.com` — a medição não para.

Todo rastreamento sai de **`client/src/lib/tracking.ts`**. Não existe
`dataLayer.push` em componente, e o teste `server/seo-content.test.ts` quebra se
alguém reintroduzir `fbq(`, `ttq.` ou `gtag('config'`.

## IDs oficiais

| Destino | ID | Observação |
|---|---|---|
| GTM | `GTM-WLR7JD57` | contêiner único |
| GA4 | `G-FZH25GKTJ9` | propriedade "totalqualitymedicina" (294418772) |
| Google Ads | `AW-14387808424` | conta 920-715-3288, a que tem investimento ativo |
| Google Ads | `AW-125205491754` | conta 660-569-9690 |
| Meta Pixel | `1868545660691533` | configurado dentro do GTM, nunca no código |

**Nunca usar:** `AW-16697936154`, `AW-312778444`, `AW-18050059780`,
`AW-17886498822` e o pixel `1536672876562340`. Não pertencem à clínica ou estão
aposentados — conversões enviadas a eles ficam invisíveis para as campanhas.

## Eventos

Todo evento carrega automaticamente `event_timestamp`, `page_location`,
`page_path`, `page_title`, `page_hostname` e `page_referrer`.

| Evento | Quando dispara | Parâmetros próprios |
|---|---|---|
| `whatsapp_click` | **conversão principal** — qualquer clique em botão ou link de WhatsApp | `event_category: "conversion"`, `event_label`, `lead_source`, `exam_type`, `currency: "BRL"`, `value` |
| `phone_click` | qualquer link `tel:` | `event_category`, `event_label`, `contact_method: "phone"`, `lead_source` |
| `form_submit` | envio do formulário de contato | `event_category: "conversion"`, `form_name`, `contact_subject` |
| `form_start` | primeiro caractere digitado no formulário | `event_category`, `form_name` |
| `page_view` | uma vez por navegação real | `page_name`, `content_group` |
| `section_view` | seção entra no viewport (30%) | `section_name`, `event_label` |
| `scroll` | 25%, 50%, 75%, 90% da página | `percent_scrolled`, `event_label` |
| `time_on_page` | 30s, 60s e 180s de aba **visível** | `engagement_time_seconds`, `event_label` |
| `view_item` | abertura de uma página de exame | `item_name`, `item_category` |
| `select_content` | escolha de categoria de exame e CTAs que não levam ao WhatsApp | `content_type`, `content_id`, `event_label` |
| `nav_click` | item do menu | `nav_item`, `event_label` |
| `results_online_click` | botão "Resultados Online" | `event_category`, `event_label` |
| `map_interaction` | interação com o mapa | `event_label` |
| `external_link_click` | redes sociais e links externos | `platform`, `link_url` |

### Eventos aposentados

`generate_lead` e `ads_conversion` saíram do código em 02/08/2026 e **não devem
voltar**. Todo clique de WhatsApp virou `whatsapp_click`, com origem no
`lead_source`. Há guard-rail de teste impedindo o retorno.

## Regras invioláveis

1. **Nenhum dado pessoal ou de saúde em URL, nome de evento ou parâmetro.** Em
   laboratório de análises clínicas, contato somado ao exame procurado é dado
   sensível de saúde (art. 11 da LGPD), não só dado pessoal. O lead do
   formulário viaja por `sessionStorage` (`client/src/lib/leadHandoff.ts`), é
   lido uma única vez e apagado na leitura; `/formulario-sucesso` carrega com
   URL limpa. Guard-rail de teste cobre isso.
2. **`page_view` tem fonte única**: `usePageViewTracking`, montado uma vez no
   `App`. Nenhuma página chama `trackPageView`. O gatilho de History Change do
   GTM **não deve** emitir `page_view` — senão o evento volta a duplicar.
3. **Todo CTA de WhatsApp abre em nova aba** (`target="_blank"` ou
   `window.open(..., "_blank", "noopener,noreferrer")`) e dispara evento.
4. **Nenhum pixel direto.** Meta e Ads são configurados no GTM.

## Valor da conversão

`client/src/lib/leadValues.ts` mapeia tipo de lead para valor em reais. O
ticket médio informado pela clínica é **R$ 249,60**, aplicado a todos os tipos.
Enquanto o valor for o mesmo para todos, o Ads otimiza por volume com o valor
correto em reais — o que já habilita relatórios de ROAS e estratégias de lance
por valor. Quando houver ticket médio **por tipo** de lead, trocar linha a
linha; só a partir daí o Ads consegue preferir os leads que valem mais.

## Conversões aprimoradas (enhanced conversions)

Implementadas em `client/src/lib/userData.ts`. O contato sai do navegador já
normalizado e com **hash SHA-256 em hexadecimal** — texto puro nunca entra no
dataLayer, nunca chega ao GTM e nunca chega ao Google.

Normalização, no padrão do Google:

- **E-mail**: sem espaços, minúsculo; em `gmail.com`/`googlemail.com` os pontos
  da parte local são removidos.
- **Telefone**: E.164 assumindo Brasil quando o DDI não vem escrito —
  `(12) 98888-7777` vira `+5512988887777`.

O `user_data` só é montado quando **as três condições** valem: o visitante
aceitou cookies de marketing no banner (`tq-consent = granted`, que também
concede `ad_user_data`), o navegador expõe Web Crypto (contexto seguro) e pelo
menos um dos dois campos é válido. Faltando qualquer uma, a conversão continua
sendo enviada — apenas sem identificação.

Pontos que enviam `user_data`, todos com o paciente já identificado por
iniciativa dele:

| Evento | Origem |
|---|---|
| `form_submit` | formulário de contato |
| `whatsapp_click` (`form_success_cta`) | tela de confirmação do formulário |
| `whatsapp_click` (`leads_modal`) | modal de leads do cartão |

**Cuidado permanente com dado de saúde:** o `exam_type` viaja no evento para
segmentação interna e o `user_data` serve apenas para casar o clique com o
anúncio. Não criar público nem relatório que cruze os dois — laboratório de
análises clínicas, contato somado a exame procurado é dado sensível (art. 11 da
LGPD).

No painel do Ads, a ação de conversão precisa ter **conversões aprimoradas
ativadas** e a tag do GTM precisa de uma variável de dados fornecidos pelo
usuário lendo `user_data` do dataLayer.

## Consent Mode v2

`client/index.html` define o estado **negado por padrão** antes do snippet do
GTM (`ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage`;
`functionality_storage` e `security_storage` concedidos; `wait_for_update: 500`).
O banner é `client/src/components/CookieConsent.tsx`, com "Aceitar cookies" e
"Somente essenciais", link para `/privacidade`, e escolha persistida em
`localStorage['tq-consent']`. Enquanto negado, o Google envia pings sem cookie.

## Como validar no Tag Assistant

1. Abrir o **Visualizar** (Preview) do GTM apontando para
   `https://totalquality.med.br`.
2. Na home, conferir na aba **Summary**: deve haver **um** `page_view`. Dois
   significa que o gatilho de History Change do GTM voltou a emitir o evento.
3. Clicar em qualquer botão de WhatsApp: deve aparecer **um** `whatsapp_click`
   com `lead_source` correspondente ao local do clique, e a página deve
   continuar aberta (a conversa abre em outra aba).
4. Clicar num link de telefone: **um** `phone_click` com `lead_source`.
5. Enviar o formulário: `form_start` no primeiro caractere e `form_submit` no
   envio. Na tela de sucesso, **conferir que a URL não tem query string**.
6. Esperar na página: `time_on_page` aos 30s e aos 60s, uma vez cada. Trocar de
   aba e voltar — o contador não deve ter avançado enquanto oculto.
7. No GA4 → Tempo real, confirmar que os eventos chegam na propriedade
   **totalquality medicina** (`G-FZH25GKTJ9`).

## Pendências no painel (não são código)

1. A versão publicada do GTM ainda aponta a conversão para **AW-312778444**,
   conta que não é da clínica. Trocar para `AW-14387808424`, criar a ação de
   conversão dentro da conta 920-715-3288, colar o rótulo novo e publicar.
2. Gatilho da conversão precisa virar `^(whatsapp_click|phone_click)$` —
   `ads_conversion` não existe mais.
3. Adicionar `form_submit` à RegEx do gatilho da tag "GA4 - eventos do site".
4. Marcar `whatsapp_click`, `phone_click` e `form_submit` como eventos
   principais no GA4.
5. A tag `FB_CONVERSIONS_API-...-Web-Tag-GA4_Event` manda o evento interno
   `gtm.dom` como nome de evento para o GA4 — restringir a uma allowlist.
6. Garantir que o gatilho de History Change não emita `page_view` (regra 2).

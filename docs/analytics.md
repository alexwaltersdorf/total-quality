# Esquema de rastreamento do site

Última revisão: 11/08/2026.

## Arquitetura

O site **não dispara nenhum pixel direto**. Todo evento vai para o `dataLayer` e
o **GTM (GTM-WLR7JD57) é o único distribuidor** para GA4, Google Ads e Meta.
Consequência prática: para mudar o destino de um evento mexe-se no contêiner,
não no código; e nenhum PR precisa carregar ID de plataforma nova.

O carregamento do GTM passa pelo **gateway first-party**: `client/index.html`
pede `/metrics/?id=GTM-WLR7JD57`, e `server/_core/tag-gateway.ts` faz proxy para
`GTM-WLR7JD57.fps.goog`. A tag de configuracao do GA4 deve usar obrigatoriamente
`transport_url: https://totalquality.med.br/metrics`. O fallback do HTML para
`googletagmanager.com` recupera somente o carregamento do container; ele nao
recupera hits enviados para um `transport_url` indisponivel.

O workflow `Measurement health` verifica a cada 30 minutos o loader, o endpoint
`/metrics/healthy`, o ID do GA4 dentro do container publicado, o transporte de
coleta e a ausencia do endpoint Cloud Run aposentado.

## Incidente de 03/08/2026

As versoes 8 e 9 do GTM, publicadas em 02/08, estavam vazias. A versao 10
restaurou as tags em 04/08, mas a configuracao do GA4 continuou com
`transport_url` apontando para
`server-side-tagging-ie4lymzpwa-uc.a.run.app`, que respondia 500/503. Isso
explica a queda abrupta no GA4 enquanto Search Console e Google Ads continuaram
registrando demanda.

Tambem foi removida a sobrescrita de `window.dataLayer.push` no navegador. A
captura do painel proprio agora recebe uma copia antes do `push` normal, sem
desconectar o listener instalado pelo GTM.

Todo rastreamento sai de **`client/src/lib/tracking.ts`**. Não existe
`dataLayer.push` em componente, e o teste `server/seo-content.test.ts` quebra se
alguém reintroduzir `fbq(`, `ttq.` ou `gtag('config'`.

## IDs oficiais

| Destino | ID | Observação |
|---|---|---|
| GTM | `GTM-WLR7JD57` | contêiner único |
| GA4 | `G-FZH25GKTJ9` | propriedade "totalqualitymedicina" (294418772) |
| Google Ads | `AW-312778444` | conta 920-715-3288, a que tem investimento ativo; rótulo `JbzkCNiX6docEMy9kpUB` |
| Google Ads | `AW-17886498822` | conta 660-569-9690 |
| Meta Pixel | `1868545660691533` | configurado dentro do GTM, nunca no código |

`AW-16697936154` e `AW-18050059780` aparecem em tags antigas do contêiner e não
têm origem identificada — não usar em tag nova, e não excluir do contêiner sem
conferir no painel de qual conta vieram. O pixel `1536672876562340` está
aposentado.

> **Correção de 11/08/2026.** Até 10/08 esta tabela dizia `AW-14387808424` e
> `AW-125205491754`. Estava errada. Os números vieram de uma leitura da API do
> Windsor sem perceber que o conector **soma** o campo
> `customer_conversion_tracking_setting_conversion_tracking_id` linha a linha:
> `14387808424` é `46 × 312778444`. Para ler um identificador nessa API, sempre
> quebrar por `date` e por campanha e conferir em dois períodos — se o valor
> muda com o período, é agregação, não é o ID.

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

`client/src/lib/leadValues.ts` é a fonte atual dos valores informados pela
clínica por serviço em 06/09/2026. Laboratório e o fallback estão em R$ 135;
o antigo ticket uniforme de R$ 249,60 não descreve mais o código atual.
Esses valores são referências comerciais atribuídas a **cliques**, não
receita recebida nem valor esperado calibrado pela taxa de fechamento.

Não chamar `valor de conversão / custo` de ROAS financeiro enquanto a
conversão for um clique ou uma ligação sem receita conciliada. Para lances
por valor, usar receita real ou valor esperado validado (probabilidade de
fechamento × margem/valor acordado) e documentar sua origem. Esta auditoria
preserva os valores fornecidos pelo negócio; não inventa valores substitutos.

## Funil de WhatsApp — revisão de 14/09/2026

Abrir o menu do botão flutuante agora emite `select_content` (`fab_open`),
sem emitir `whatsapp_click`. O botão **Iniciar Conversa** continua emitindo
um `whatsapp_click`. Isso remove a dupla contagem daquela sequência; uma
queda no volume de cliques após o deploy pode ser correção de medição.

O provider emite duas etapas adicionais de observação:

| Evento | Momento | Interpretação |
|---|---|---|
| `whatsapp_modal_open` | formulário de nome aberto | tentativa de contato |
| `whatsapp_redirect_requested` | nome válido e pedido de abertura do WhatsApp | intenção de prosseguir; não comprova envio, atendimento ou venda |

Ambos usam `lead_source` e um `flow_id` aleatório que existe apenas na
tentativa, sem armazenamento no navegador. Compartilham o contexto de página
do emissor central; não recebem nome, telefone, e-mail, texto da mensagem,
`user_data`, `exam_type`, valor ou moeda. Não cruzar o ID com dados de paciente.

**Código disponível não significa coleta validada no GA4.** No GTM, conferir
se a tag de eventos GA4 inclui explicitamente esses dois nomes e somente os
parâmetros necessários. Manter Consent Mode. Não adicionar esses eventos aos
gatilhos de conversão do Ads/Meta nem marcá-los como eventos principais.
Não cadastrar `flow_id` como dimensão personalizada de alta cardinalidade;
usar exportação técnica aprovada para contar tentativas distintas, se houver.

Validar em Preview: menu aberto → só `select_content`; Iniciar Conversa →
um clique + uma abertura; cancelar → nenhuma saída; continuar com nome válido
→ uma saída com o mesmo `flow_id`. O teste de continuação deve ser identificado
como teste no CRM e excluído dos resultados comerciais. O pedido de
redirecionamento não comprova que o navegador abriu o aplicativo.

O abandono deve usar tentativas de modal com a mesma coorte e prazo de
observação. Não dividir saídas pelo total histórico de `whatsapp_click`, que
também inclui outros caminhos de contato. Registro da mudança e indicadores:
[auditoria PMAX](auditorias/google-ads/pmax-laboratorio-caraguatatuba/README.md).

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

1. Gatilho da conversão precisa virar `^(whatsapp_click|phone_click)$` —
   `ads_conversion` não existe mais. O ID e o rótulo da tag publicada
   (`AW-312778444` / `JbzkCNiX6docEMy9kpUB`) estão **corretos**, não mexer.
2. Adicionar `form_submit` e `page_view` à RegEx do gatilho da tag
   "GA4 - eventos do site".
3. **Desligar o page_view automático da tag de configuração do GA4** — o site
   passou a ser a fonte única, e a configuração mandando o dela no
   carregamento é o que duplicava o evento.
4. Marcar `whatsapp_click`, `phone_click` e `form_submit` como eventos
   principais no GA4.
5. Ativar conversões aprimoradas na ação de conversão do Ads e, na tag do GTM,
   apontar a variável de dados fornecidos pelo usuário (modo manual) para
   `user_data` do dataLayer.
6. A tag `FB_CONVERSIONS_API-...-Web-Tag-GA4_Event` manda o evento interno
   `gtm.dom` como nome de evento para o GA4 — restringir a uma allowlist.

O pacote de importação pronto, com essas correções já aplicadas, está em
`gtm/gtm-import-conversoes-eventos.json` no repositório `SEO---Total-Quality`.

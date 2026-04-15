# Guia Completo de Configuração do Google Tag Manager

## Total Quality Medicina Diagnóstica — GTM-WLR7JD57

Este guia detalha toda a configuração necessária no painel do Google Tag Manager para rastrear eventos, conversões e comportamento dos visitantes do site da Total Quality. O código do site já envia todos os eventos para o `dataLayer` automaticamente.

---

## 1. PASTAS (Folders)

Organize suas tags, acionadores e variáveis em pastas para manter o GTM limpo e gerenciável.

| Pasta | Descrição |
|-------|-----------|
| **01 - Google Analytics 4** | Todas as tags relacionadas ao GA4 |
| **02 - Meta Pixel (Facebook/Instagram)** | Tags do Meta Pixel |
| **03 - TikTok Pixel** | Tags do TikTok Pixel |
| **04 - Google Ads** | Tags de conversão e remarketing do Google Ads |
| **05 - LinkedIn Insight** | Tags do LinkedIn Insight Tag |
| **06 - Variáveis Customizadas** | Variáveis de dataLayer |
| **07 - Acionadores de Conversão** | Acionadores de eventos de conversão |
| **08 - Acionadores de Engajamento** | Acionadores de eventos de engajamento |

---

## 2. VARIÁVEIS (Variables)

### 2.1 Variáveis Integradas (Built-In) — Ativar

Acesse **Variáveis > Configurar** e ative as seguintes variáveis integradas:

| Variável | Tipo | Descrição |
|----------|------|-----------|
| **Event** | Integrada | Nome do evento no dataLayer |
| **Page Hostname** | Integrada | Hostname da página (ex: totalquality.med.br) |
| **Page Path** | Integrada | Caminho da página (ex: /checkup) |
| **Page URL** | Integrada | URL completa da página |
| **Referrer** | Integrada | URL de referência (de onde veio o visitante) |
| **Click URL** | Integrada | URL do elemento clicado |
| **Click Text** | Integrada | Texto do elemento clicado |
| **Click Element** | Integrada | Elemento HTML clicado |
| **Click Classes** | Integrada | Classes CSS do elemento clicado |
| **Click ID** | Integrada | ID do elemento clicado |
| **Form Element** | Integrada | Elemento do formulário |
| **Form ID** | Integrada | ID do formulário |
| **Scroll Depth Threshold** | Integrada | Profundidade do scroll |
| **Scroll Depth Units** | Integrada | Unidade de medida do scroll |
| **Scroll Direction** | Integrada | Direção do scroll |

### 2.2 Variáveis de Camada de Dados (Data Layer Variables)

Crie as seguintes variáveis customizadas do tipo **Variável de camada de dados**:

| Nome da Variável | Nome no Data Layer | Pasta |
|-------------------|--------------------|-------|
| **DLV - event_category** | `event_category` | 06 - Variáveis Customizadas |
| **DLV - event_label** | `event_label` | 06 - Variáveis Customizadas |
| **DLV - lead_source** | `lead_source` | 06 - Variáveis Customizadas |
| **DLV - exam_type** | `exam_type` | 06 - Variáveis Customizadas |
| **DLV - content_type** | `content_type` | 06 - Variáveis Customizadas |
| **DLV - content_id** | `content_id` | 06 - Variáveis Customizadas |
| **DLV - section_name** | `section_name` | 06 - Variáveis Customizadas |
| **DLV - page_name** | `page_name` | 06 - Variáveis Customizadas |
| **DLV - content_group** | `content_group` | 06 - Variáveis Customizadas |
| **DLV - contact_method** | `contact_method` | 06 - Variáveis Customizadas |
| **DLV - click_source** | `click_source` | 06 - Variáveis Customizadas |
| **DLV - form_name** | `form_name` | 06 - Variáveis Customizadas |
| **DLV - contact_subject** | `contact_subject` | 06 - Variáveis Customizadas |
| **DLV - outbound_url** | `outbound_url` | 06 - Variáveis Customizadas |
| **DLV - platform** | `platform` | 06 - Variáveis Customizadas |
| **DLV - nav_item** | `nav_item` | 06 - Variáveis Customizadas |
| **DLV - percent_scrolled** | `percent_scrolled` | 06 - Variáveis Customizadas |
| **DLV - engagement_time_seconds** | `engagement_time_seconds` | 06 - Variáveis Customizadas |
| **DLV - map_action** | `map_action` | 06 - Variáveis Customizadas |
| **DLV - currency** | `currency` | 06 - Variáveis Customizadas |
| **DLV - value** | `value` | 06 - Variáveis Customizadas |
| **DLV - event_timestamp** | `event_timestamp` | 06 - Variáveis Customizadas |
| **DLV - page_referrer** | `page_referrer` | 06 - Variáveis Customizadas |

### 2.3 Variáveis de Constante

| Nome da Variável | Tipo | Valor | Pasta |
|-------------------|------|-------|-------|
| **CONST - GA4 Measurement ID** | Constante | `G-XXXXXXXXXX` (substituir pelo seu ID GA4) | 01 - Google Analytics 4 |
| **CONST - Meta Pixel ID** | Constante | (seu Pixel ID do Meta) | 02 - Meta Pixel |
| **CONST - TikTok Pixel ID** | Constante | (seu Pixel ID do TikTok) | 03 - TikTok Pixel |
| **CONST - Google Ads Conversion ID** | Constante | (seu Conversion ID) | 04 - Google Ads |
| **CONST - LinkedIn Partner ID** | Constante | (seu Partner ID) | 05 - LinkedIn Insight |

---

## 3. ACIONADORES (Triggers)

### 3.1 Acionadores de Conversão

| Nome do Acionador | Tipo | Condição | Pasta |
|--------------------|------|----------|-------|
| **TRIG - Agendamento Exame (Lead)** | Evento Personalizado | Event = `generate_lead` E DLV - event_label = `schedule_exam_whatsapp` | 07 - Conversão |
| **TRIG - Agendamento Check-Up** | Evento Personalizado | Event = `generate_lead` E DLV - event_label = `schedule_checkup` | 07 - Conversão |
| **TRIG - Agendamento Bioimpedância** | Evento Personalizado | Event = `generate_lead` E DLV - event_label = `schedule_bioimpedancia` | 07 - Conversão |
| **TRIG - Formulário Enviado** | Evento Personalizado | Event = `generate_lead` E DLV - event_label = `contact_form_submit` | 07 - Conversão |
| **TRIG - Interesse Cartão** | Evento Personalizado | Event = `generate_lead` E DLV - event_label = `card_interest` | 07 - Conversão |
| **TRIG - Qualquer Lead (generate_lead)** | Evento Personalizado | Event = `generate_lead` | 07 - Conversão |

### 3.2 Acionadores de Engajamento

| Nome do Acionador | Tipo | Condição | Pasta |
|--------------------|------|----------|-------|
| **TRIG - Page View (SPA)** | Evento Personalizado | Event = `page_view` | 08 - Engajamento |
| **TRIG - Scroll Depth** | Evento Personalizado | Event = `scroll` | 08 - Engajamento |
| **TRIG - Tempo na Página** | Evento Personalizado | Event = `time_on_page` | 08 - Engajamento |
| **TRIG - Seção Visualizada** | Evento Personalizado | Event = `section_view` | 08 - Engajamento |
| **TRIG - Categoria Exame Selecionada** | Evento Personalizado | Event = `select_content` | 08 - Engajamento |
| **TRIG - Formulário Iniciado** | Evento Personalizado | Event = `form_start` | 08 - Engajamento |
| **TRIG - Clique Telefone** | Evento Personalizado | Event = `phone_click` | 08 - Engajamento |
| **TRIG - Clique WhatsApp** | Evento Personalizado | Event = `whatsapp_click` | 08 - Engajamento |
| **TRIG - Clique Navegação** | Evento Personalizado | Event = `nav_click` | 08 - Engajamento |
| **TRIG - Link Externo** | Evento Personalizado | Event = `external_link_click` | 08 - Engajamento |
| **TRIG - Resultados Online** | Evento Personalizado | Event = `results_online_click` | 08 - Engajamento |
| **TRIG - Interação Mapa** | Evento Personalizado | Event = `map_interaction` | 08 - Engajamento |

---

## 4. TAGS

### 4.1 Google Analytics 4 (GA4)

**Pré-requisito:** Crie uma propriedade GA4 em analytics.google.com e obtenha o Measurement ID (G-XXXXXXXXXX).

| Nome da Tag | Tipo | Acionador | Configuração | Pasta |
|-------------|------|-----------|--------------|-------|
| **GA4 - Configuração** | Google Analytics: Configuração do GA4 | All Pages (Todas as Páginas) | Measurement ID: `{{CONST - GA4 Measurement ID}}` | 01 - GA4 |
| **GA4 - Page View (SPA)** | Google Analytics: Evento do GA4 | TRIG - Page View (SPA) | Event: `page_view`, Params: page_name, content_group | 01 - GA4 |
| **GA4 - Generate Lead** | Google Analytics: Evento do GA4 | TRIG - Qualquer Lead | Event: `generate_lead`, Params: lead_source, exam_type, currency, value | 01 - GA4 |
| **GA4 - Scroll** | Google Analytics: Evento do GA4 | TRIG - Scroll Depth | Event: `scroll`, Params: percent_scrolled | 01 - GA4 |
| **GA4 - Time on Page** | Google Analytics: Evento do GA4 | TRIG - Tempo na Página | Event: `time_on_page`, Params: engagement_time_seconds | 01 - GA4 |
| **GA4 - Section View** | Google Analytics: Evento do GA4 | TRIG - Seção Visualizada | Event: `section_view`, Params: section_name | 01 - GA4 |
| **GA4 - Select Content** | Google Analytics: Evento do GA4 | TRIG - Categoria Exame | Event: `select_content`, Params: content_type, content_id | 01 - GA4 |
| **GA4 - Form Start** | Google Analytics: Evento do GA4 | TRIG - Formulário Iniciado | Event: `form_start`, Params: form_name | 01 - GA4 |
| **GA4 - Phone Click** | Google Analytics: Evento do GA4 | TRIG - Clique Telefone | Event: `phone_click`, Params: contact_method, click_source | 01 - GA4 |
| **GA4 - WhatsApp Click** | Google Analytics: Evento do GA4 | TRIG - Clique WhatsApp | Event: `whatsapp_click`, Params: contact_method, click_source | 01 - GA4 |
| **GA4 - Nav Click** | Google Analytics: Evento do GA4 | TRIG - Clique Navegação | Event: `nav_click`, Params: nav_item | 01 - GA4 |
| **GA4 - External Link** | Google Analytics: Evento do GA4 | TRIG - Link Externo | Event: `external_link_click`, Params: outbound_url, platform | 01 - GA4 |
| **GA4 - Results Click** | Google Analytics: Evento do GA4 | TRIG - Resultados Online | Event: `results_online_click` | 01 - GA4 |
| **GA4 - Map Interaction** | Google Analytics: Evento do GA4 | TRIG - Interação Mapa | Event: `map_interaction`, Params: map_action | 01 - GA4 |

### 4.2 Meta Pixel (Facebook/Instagram)

**Pré-requisito:** Crie um Pixel no Meta Business Suite (business.facebook.com > Gerenciador de Eventos).

| Nome da Tag | Tipo | Acionador | Código | Pasta |
|-------------|------|-----------|--------|-------|
| **Meta - Base Pixel** | HTML Personalizado | All Pages | Ver código abaixo | 02 - Meta Pixel |
| **Meta - Lead (Agendamento)** | HTML Personalizado | TRIG - Qualquer Lead | `fbq('track', 'Lead', {...})` | 02 - Meta Pixel |
| **Meta - ViewContent (Exame)** | HTML Personalizado | TRIG - Categoria Exame | `fbq('track', 'ViewContent', {...})` | 02 - Meta Pixel |
| **Meta - Contact (WhatsApp)** | HTML Personalizado | TRIG - Clique WhatsApp | `fbq('track', 'Contact', {...})` | 02 - Meta Pixel |
| **Meta - Contact (Telefone)** | HTML Personalizado | TRIG - Clique Telefone | `fbq('track', 'Contact', {...})` | 02 - Meta Pixel |

**Código da Tag "Meta - Base Pixel":**

```html
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '{{CONST - Meta Pixel ID}}');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id={{CONST - Meta Pixel ID}}&ev=PageView&noscript=1"
/></noscript>
```

**Código da Tag "Meta - Lead (Agendamento)":**

```html
<script>
fbq('track', 'Lead', {
  content_name: {{DLV - event_label}},
  content_category: {{DLV - exam_type}},
  value: {{DLV - value}},
  currency: 'BRL'
});
</script>
```

### 4.3 TikTok Pixel

**Pré-requisito:** Crie um Pixel no TikTok Ads Manager (ads.tiktok.com > Assets > Events).

| Nome da Tag | Tipo | Acionador | Código | Pasta |
|-------------|------|-----------|--------|-------|
| **TikTok - Base Pixel** | HTML Personalizado | All Pages | Ver código abaixo | 03 - TikTok Pixel |
| **TikTok - SubmitForm (Lead)** | HTML Personalizado | TRIG - Qualquer Lead | `ttq.track('SubmitForm', {...})` | 03 - TikTok Pixel |
| **TikTok - Contact (WhatsApp)** | HTML Personalizado | TRIG - Clique WhatsApp | `ttq.track('Contact', {...})` | 03 - TikTok Pixel |
| **TikTok - ViewContent (Exame)** | HTML Personalizado | TRIG - Categoria Exame | `ttq.track('ViewContent', {...})` | 03 - TikTok Pixel |

**Código da Tag "TikTok - Base Pixel":**

```html
<script>
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var i=document.createElement("script");i.type="text/javascript",i.async=!0,i.src=r+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(i,a)};
  ttq.load('{{CONST - TikTok Pixel ID}}');
  ttq.page();
}(window, document, 'ttq');
</script>
```

### 4.4 Google Ads (Conversão + Remarketing)

**Pré-requisito:** Configure conversões no Google Ads (ads.google.com > Ferramentas > Conversões).

| Nome da Tag | Tipo | Acionador | Configuração | Pasta |
|-------------|------|-----------|--------------|-------|
| **GAds - Remarketing** | Google Ads Remarketing | All Pages | Conversion ID: `{{CONST - Google Ads Conversion ID}}` | 04 - Google Ads |
| **GAds - Conversão Lead** | Google Ads Conversion Tracking | TRIG - Qualquer Lead | Conversion ID + Label (do Google Ads) | 04 - Google Ads |
| **GAds - Conversão WhatsApp** | Google Ads Conversion Tracking | TRIG - Clique WhatsApp | Conversion ID + Label (do Google Ads) | 04 - Google Ads |
| **GAds - Conversão Telefone** | Google Ads Conversion Tracking | TRIG - Clique Telefone | Conversion ID + Label (do Google Ads) | 04 - Google Ads |

### 4.5 LinkedIn Insight Tag

**Pré-requisito:** Obtenha o Partner ID no LinkedIn Campaign Manager.

| Nome da Tag | Tipo | Acionador | Código | Pasta |
|-------------|------|-----------|--------|-------|
| **LinkedIn - Insight Tag** | HTML Personalizado | All Pages | Ver código abaixo | 05 - LinkedIn |
| **LinkedIn - Conversão Lead** | HTML Personalizado | TRIG - Qualquer Lead | `window.lintrk('track', { conversion_id: XXXXX })` | 05 - LinkedIn |

**Código da Tag "LinkedIn - Insight Tag":**

```html
<script type="text/javascript">
_linkedin_partner_id = "{{CONST - LinkedIn Partner ID}}";
window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
window._linkedin_data_partner_ids.push(_linkedin_partner_id);
</script>
<script type="text/javascript">
(function(l) {
if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
window.lintrk.q=[]}
var s = document.getElementsByTagName("script")[0];
var b = document.createElement("script");
b.type = "text/javascript";b.async = true;
b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
s.parentNode.insertBefore(b, s);})(window.lintrk);
</script>
<noscript>
<img height="1" width="1" style="display:none;" alt=""
src="https://px.ads.linkedin.com/collect/?pid={{CONST - LinkedIn Partner ID}}&fmt=gif" />
</noscript>
```

---

## 5. CONFIGURAÇÃO DE CONVERSÕES NO GA4

Após publicar o GTM, acesse o GA4 e marque os seguintes eventos como **conversões**:

| Evento | Tipo | Prioridade |
|--------|------|------------|
| `generate_lead` | Conversão Principal | Alta |
| `phone_click` | Conversão Secundária | Média |
| `whatsapp_click` | Conversão Secundária | Média |
| `form_start` | Micro-conversão | Baixa |

---

## 6. AUDIÊNCIAS RECOMENDADAS NO GA4

Crie as seguintes audiências para remarketing e análise:

| Audiência | Condição | Uso |
|-----------|----------|-----|
| **Visitantes que agendaram** | generate_lead nos últimos 30 dias | Lookalike / Exclusão |
| **Visitantes de Check-Up** | page_path contém /checkup | Remarketing específico |
| **Visitantes de Bioimpedância** | page_path contém /bioimpedancia | Remarketing específico |
| **Engajados (scroll 75%+)** | scroll com percent_scrolled >= 75 | Remarketing quente |
| **Abandonaram formulário** | form_start SEM generate_lead em 7 dias | Remarketing de recuperação |
| **Clicaram WhatsApp** | whatsapp_click nos últimos 30 dias | Lookalike / Exclusão |
| **Visitantes recorrentes** | session_count >= 2 | Remarketing fidelização |

---

## 7. EVENTOS CUSTOMIZADOS NO META ADS

No Gerenciador de Eventos do Meta, configure as seguintes conversões customizadas:

| Nome da Conversão | Evento Padrão | Regra |
|--------------------|---------------|-------|
| **Agendamento de Exame** | Lead | URL contém totalquality |
| **Interesse Check-Up** | ViewContent | content_category = checkup |
| **Interesse Bioimpedância** | ViewContent | content_category = bioimpedancia |
| **Contato WhatsApp** | Contact | content_name = WhatsApp |

---

## 8. CHECKLIST DE IMPLEMENTAÇÃO

### Passo a Passo:

1. **Acesse o GTM** em tagmanager.google.com com o container GTM-WLR7JD57
2. **Crie as Pastas** conforme seção 1
3. **Ative as Variáveis Integradas** conforme seção 2.1
4. **Crie as Variáveis de Data Layer** conforme seção 2.2
5. **Crie as Variáveis de Constante** conforme seção 2.3 (preencha seus IDs)
6. **Crie os Acionadores** conforme seção 3
7. **Crie as Tags** conforme seção 4
8. **Use o Modo Preview** do GTM para testar todos os eventos
9. **Publique** o container após validar
10. **Configure conversões no GA4** conforme seção 5
11. **Crie audiências no GA4** conforme seção 6
12. **Configure conversões no Meta** conforme seção 7

### Teste com GTM Preview:

1. Clique em **Preview** no GTM
2. Navegue pelo site e verifique se os eventos aparecem no painel de debug:
   - `page_view` ao carregar a página
   - `scroll` ao rolar (25%, 50%, 75%, 90%)
   - `section_view` ao visualizar cada seção
   - `generate_lead` ao clicar em "Agendar Exame"
   - `whatsapp_click` ao clicar no WhatsApp
   - `phone_click` ao clicar no telefone
   - `select_content` ao trocar categoria de exame
   - `form_start` ao iniciar o formulário
   - `nav_click` ao clicar no menu

---

## 9. MAPA DE EVENTOS COMPLETO

| Evento dataLayer | Ação do Usuário | Plataformas |
|------------------|-----------------|-------------|
| `page_view` | Carregamento de página | GA4, Meta, TikTok |
| `scroll` | Scroll 25/50/75/90% | GA4 |
| `time_on_page` | 15s/30s/60s/120s/300s na página | GA4 |
| `section_view` | Seção entra no viewport | GA4 |
| `generate_lead` | Agendar exame / Formulário / Cartão | GA4, Meta, TikTok, GAds, LinkedIn |
| `select_content` | Trocar categoria de exame | GA4, Meta |
| `form_start` | Iniciar preenchimento do formulário | GA4, Meta |
| `phone_click` | Clicar no telefone | GA4, Meta, TikTok, GAds |
| `whatsapp_click` | Clicar no WhatsApp | GA4, Meta, TikTok, GAds |
| `nav_click` | Clicar em item do menu | GA4 |
| `external_link_click` | Clicar em link externo (Instagram) | GA4 |
| `results_online_click` | Clicar em "Resultados Online" | GA4 |
| `map_interaction` | Interagir com o mapa | GA4 |

---

## 10. DICAS DE PERFORMANCE COMPETITIVA

1. **Bidding por conversão:** No Google Ads, use a conversão `generate_lead` como meta de otimização para maximizar agendamentos
2. **Lookalike no Meta:** Crie públicos semelhantes baseados na audiência "Visitantes que agendaram" para encontrar novos pacientes
3. **Remarketing de recuperação:** Crie campanhas para quem iniciou o formulário mas não agendou (audiência "Abandonaram formulário")
4. **Análise de funil:** No GA4, crie um funil: page_view → section_view (exames) → form_start → generate_lead para identificar onde os visitantes desistem
5. **Relatório de canais:** Use o GA4 para comparar quais canais (orgânico, pago, social, direto) geram mais leads
6. **Horários de pico:** Analise os timestamps dos eventos para identificar os melhores horários para campanhas
7. **Exames mais procurados:** Use o evento `select_content` para saber quais categorias de exames têm mais interesse

---

*Documento gerado automaticamente. Atualize os IDs das plataformas (GA4, Meta, TikTok, Google Ads, LinkedIn) com seus valores reais antes de publicar.*

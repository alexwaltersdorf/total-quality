# gclid, conversões offline e o `utm_term` que grudava

## O problema medido

Em 22/09/2026 a conta `920-715-3288` reportou **509 conversões em 30 dias sobre
R$ 4.457,59** — CPA de R$ 8,76. A clínica não teve 509 agendamentos. A campanha
`Visite o Nosso Laboratório` (Smart) sozinha reportou 207,87 conversões em 776
cliques: **26,8% de taxa de conversão**.

As ações de conversão estão contando **cliques em WhatsApp**, não exames
agendados. O lance automático vem otimizando para isso.

O caminho para corrigir já existia no N8N e estava morto:

- **ADS-01** (`ads-whatsapp-click` → `ana_ads_clicks`): ativo desde 14/09 e com
  **zero execuções**, num N8N com 10.009 execuções acumuladas. O webhook estava
  de pé; nada nunca chamou.
- **ADS-02** (conversões → Data Manager API): desativado.

O que faltava era o lado do site. É isso que este documento descreve.

## O código TQ-XXXXX

Quando alguém sai do site para o WhatsApp, o `gclid` fica para trás. A conversa
chega sem nenhuma ligação com a campanha que pagou pelo clique.

O site passa a gerar um código curto, colocá-lo na mensagem pré-preenchida e
mandá-lo junto com o `gclid` para o ADS-01:

```
site → gera TQ-XXXXX
     → sendBeacon(codigo + gclid + ValueTrack) → ADS-01 → ana_ads_clicks
     → wa.me/...?text=<mensagem>%0A%0A[TQ-XXXXX]
paciente → manda a mensagem → Ana → trigger liga o codigo ao telefone
lead vira agendamento → ADS-02 → Data Manager API → Google Ads
```

### Alfabeto

`A-H`, `J-N`, `P-Z`, `2-9` — 32 símbolos. Ficam de fora **I, O, 0 e 1**, os
quatro que as pessoas trocam ao reescrever à mão, e o código viaja numa mensagem
que alguém pode reescrever. 256 é múltiplo de 32, então cada byte de
`crypto.getRandomValues` vira um símbolo sem viés de módulo.

O formato tem de continuar casando com a validação do ADS-01,
`/^TQ-[A-HJ-NP-Z2-9]{5}$/`. Há um teste que gera 2.000 códigos e confere contra
esse mesmo regex.

### Uma variável liga e desliga tudo

`VITE_ADS_CLICK_WEBHOOK_URL`. **Sem valor padrão, de propósito.**

O endereço do N8N não entra no repositório: acabaria no histórico público do git,
e o webhook aceita POST de qualquer origem. Há uma trava que quebra o build se
alguém embutir um host de n8n ou um caminho `/webhook/` no código do site.

Enquanto a variável não existir, `registrarCliqueWhatsApp` devolve `false` e **o
código não é acrescentado à mensagem** — o paciente vê exatamente o que vê hoje.
Nada de sigla misteriosa na frente de quem quer marcar exame por um pipeline que
não está no ar.

> ⚠️ **Confirmar antes de ligar:** o formato `[TQ-XXXXX]` no fim da mensagem
> precisa ser conferido contra o trigger de `ana_mensagens` que extrai o código.
> Não consegui ler esse trigger. Se ele fizer busca por regex, o colchete não
> atrapalha; se esperar o código isolado, o formato aqui muda.

## O `utm_term` que grudava

Separado do acima, e o motivo pelo qual `pesquisa-pediatra-cardiologista`
aparecia em lead de ultrassom, mamografia, raio-x, check-up e toxicológico na
planilha.

`captureUTMParams()` devolvia o que estava no `sessionStorage` **antes de olhar a
URL**:

```ts
const stored = sessionStorage.getItem(UTM_STORAGE_KEY);
if (stored) return JSON.parse(stored);   // ← nunca chegava a ler a URL
```

Efeito: o `utm_term` da primeira página da sessão grudava em tudo o que viesse
depois. E pior que a contaminação do termo — quem chegava pelo orgânico e depois
clicava num anúncio tinha o **clique pago atribuído ao orgânico**.

A correção: vale a **última chegada com parâmetro de campanha**, que é como o
Google Ads e o GA4 atribuem. Navegação dentro do site não traz esses parâmetros e
portanto não sobrescreve nada — o dado da campanha sobrevive até o fim da sessão,
que era a única coisa que o comportamento antigo acertava.

Contam como chegada nova: `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`,
`utm_content`, `gclid`, `gbraid`, `wbraid`. Os identificadores de clique estão na
lista porque um anúncio pode mandar `gclid` sem mandar UTM nenhum.

## O gclid não entra no lead

`getAdClickIds()` é separado de `getUTMForAPI()` de propósito.

O schema de `lead.create` no servidor não aceita `gclid`. Mandar o campo faria o
tRPC devolver **HTTP 400 e o lead se perderia** — medição quebrada derrubando
atendimento. Há uma trava que falha se alguém acrescentar um identificador de
clique ao payload do lead.

Pôr o `gclid` na planilha também não é o caminho: acrescentar coluna reabre
exatamente o problema de alinhamento de 21/09 enquanto a gravação por nome de
cabeçalho (PR #51) não estiver instalada.

## O que falta, e não é código

1. **Configurar `VITE_ADS_CLICK_WEBHOOK_URL`** no build da Hostinger.
2. **Conferir o formato da mensagem** contra o trigger de `ana_mensagens`.
3. **Criar a ação de conversão "Exame agendado (WhatsApp)"** no Google Ads e
   gravar o `ads_conversion_action_id` em `ana_config`. *Não existe ação do
   Windsor para isto — é painel.*
4. **Credencial Google OAuth2 com escopo `datamanager`.**
5. **Ligar o ADS-02.**
6. **Tornar "Exame agendado" a única conversão Primária**, rebaixando clique de
   WhatsApp para Secundária. *Só depois que 1–5 estiverem produzindo dado:* uma
   ação primária sem histórico deixa o Smart Bidding sem o que otimizar.
7. **Modelo de acompanhamento** com `{gclid}`, `{keyword}`, `{adgroupid}` e
   `{campaignid}`. *Também é painel — o Windsor não expõe essa ação.*

Sem o item 7, `getAdClickIds()` devolve `gclid` mas não devolve palavra-chave nem
grupo de anúncios: o Google só manda ValueTrack se o modelo pedir.

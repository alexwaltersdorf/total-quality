# Campanha Check-up Outubro Rosa — `/outubro-rosa`

Documento interno. Não aparece no site.

## O que está no ar

| | |
|---|---|
| Rota | `/outubro-rosa` |
| Oferta | ultrassonografia das mamas + ultrassonografia transvaginal + preventivo (Papanicolau) |
| Preço | de R$ 500,00 por **R$ 399,90**, pelo conjunto dos três |
| Conversão | conversa no WhatsApp. **Clique não é agendamento**: quem confirma é a equipe |

## Pendências antes de publicar

A página está completa e navegável, mas **sete itens dependem de confirmação do
responsável**. Nenhum deles aparece como texto provisório para o público — onde
não havia confirmação, a página remete à equipe em vez de inventar.

| # | Pendência | Onde isso aparece hoje |
|---|---|---|
| 1 | **Aprovação do preço de referência de R$ 500,00.** É o valor que vincula a clínica (CDC art. 30) | riscado no bloco de preço e na chamada final |
| 2 | **Período de vigência da campanha** | o FAQ remete à equipe; não há data no site |
| 3 | **Condições de pagamento** | o FAQ remete à equipe; a página não cita parcelamento nem desconto |
| 4 | **Escopo do Papanicolau** — coleta e análise inclusas no valor? | a descrição não afirma nem nega |
| 5 | **Documentação e preparo** por exame | o FAQ remete à equipe |
| 6 | **Identificação regulatória** — ver abaixo | rodapé institucional, herdado do site |
| 7 | **Os três no mesmo dia** é operacionalmente possível? | o FAQ diz que depende da disponibilidade |

### Sobre a identificação regulatória (item 6)

O rodapé do site traz hoje:

```
Total Quality Medicina Diagnóstica — Registro 970616
Responsável Técnico: Alex Waltersdorf - 267.339
```

A página reusa esse rodapé, não escreve registro próprio. **O que precisa ser
confirmado antes de publicar:** o art. 5º da Resolução CFM 2.336/2023 pede o
**diretor técnico-médico** com o CRM. Se o registro 267.339 for de outro
conselho que não o CRM, a peça está identificando a pessoa errada para a norma,
e isso vale para o site inteiro — não só para esta campanha.

Não inventei nada aqui e não converti registro de uma profissão em outra: a
página herda o que o site já declara.

## Direção visual — o que é institucional e o que é da campanha

| Elemento | Origem |
|---|---|
| Fontes (Bebas Neue + DM Sans) | institucional, auto-hospedadas |
| `brand` `oklch(0.42 0.14 18)` | institucional |
| Container, `.btn-pill`, `.heading-display`, `.section-label` | institucionais |
| Navbar, Footer, logotipo | componentes reais, sem cópia nem redesenho |
| **Rosa `oklch(0.72 0.14 18)` e fundo `oklch(0.97 0.018 18)`** | **adaptação da campanha** |

O rosa sai do **mesmo matiz da marca** (hue 18), só com mais claridade — por
isso lê como parente do vinho institucional, não como cor estrangeira. Ele vive
em classe utilitária dentro de `OutubroRosa.tsx`: **nenhuma linha de CSS global
foi tocada**, então nada vaza para o resto do site.

O rosa nunca carrega texto pequeno (contraste ~3:1 sobre branco não passa em
corpo de texto). Ele preenche fundo, borda e o laço; quem carrega contraste é o
`brand` e o `text`.

## Imagem

| Arquivo | Origem | O que mostra |
|---|---|---|
| `outubro-rosa-900.webp` | Unsplash `photo-1578079345783-36087b998e2a` | mulher sorrindo, roupa clara, fundo neutro |
| `outubro-rosa-og.webp` | mesmo original, recorte 1200×630 | imagem de compartilhamento |

Licença Unsplash: uso comercial livre. Registrado aqui porque a Resolução CFM
2.336/2023 pede que peça com banco de imagens cite a origem.

**É foto de banco: ilustra a campanha, não retrata paciente, médica nem
integrante da equipe.** O texto alternativo diz exatamente isso. Não há
depoimento associado à imagem.

## Decisões que contrariam o briefing, e por quê

**1. Os contatos passam pelo formulário de qualificação.** O briefing pedia
WhatsApp direto, "sem formulário obrigatório". A regra de 21/09/2026 — que tem
guard-rail — manda o contrário, e existe porque metade dos pedidos de contato
ficava invisível sem ela. É também o formulário que alimenta as boas-vindas
(BV-01) e o follow-up da Ana. A mensagem exigida pelo briefing continua
pré-preenchida e chega ao WhatsApp no fim do fluxo.

Para fazer como o briefing pedia: trocar `useWhatsAppRedirect()` e
`useTelefoneRedirect()` por um `window.open` direto em `OutubroRosa.tsx` — e
aceitar que o lead da campanha não entra na fila.

**2. Sem dados estruturados de `Offer`.** Seriam tecnicamente possíveis (preço e
moeda estão na página), mas `Offer` sem `priceValidUntil` fica no índice depois
que a campanha acabar, e a vigência é a pendência nº 2. Entra quando a data for
confirmada. A página tem `FAQPage`, que não tem esse problema.

## Como tirar do ar quando a campanha acabar

Três remoções, nesta ordem, num PR só:

1. `server/_core/routes-metadata.ts` — apagar a entrada `"/outubro-rosa"`. Sai do sitemap.
2. `server/_core/seo-content.ts` — apagar `outubroRosaHtml` e a linha do roteador.
3. `client/src/App.tsx` — apagar a rota e o `lazy`.

Depois: apagar `client/src/pages/OutubroRosa.tsx`, as duas imagens, o bloco
`GUARD-RAIL: campanha Outubro Rosa` em `server/seo-content.test.ts` e este
documento.

A rota some de verdade: o catch-all `/:slug` devolve 404 real para caminho de
primeiro nível desconhecido. **Não deixar a oferta vencida no ar** — preço
anunciado fora de vigência é o mesmo problema do CDC art. 30, ao contrário.

## Travas

Quatro, em `server/seo-content.test.ts`, todas verificadas quebrando:

| O que impede | Trava |
|---|---|
| preço contraditório, em qualquer das duas versões | `nenhum preco alem dos dois` |
| oferta diferente entre pré-render e página React | `mesma oferta do pre-render` |
| ressalva da mamografia sumir de um dos dois pontos | `ressalva da mamografia aparece nos dois pontos` |
| promessa, urgência fabricada, brinde ou parcelamento | `promessa, urgencia ou brinde` |

A trava de preço e a da ressalva **passaram sabotadas na primeira versão**: a de
preço só exigia que a string existisse em algum lugar e sobrevivia no FAQ; a da
ressalva não percebia que o texto aparece duas vezes. Reescritas para cobrar o
conjunto de preços citados e as duas ocorrências.

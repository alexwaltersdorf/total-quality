# Blog de SEO local — região sul de Caraguatatuba

Briefing de 09/10/2026. Palavra-chave semente: **laboratório**. Quatro pilares,
derivados do comportamento real de busca, aplicados à metade sul da cidade.

## Por que o sul, e por que agora

A região sul é a parte de Caraguatatuba que mais cresce, puxada pelas obras da
Rodovia dos Tamoios, e concentra equipamentos públicos de peso — o Hospital
Regional do Litoral Norte está no eixo do Jardim Britânia, junto do Shopping
Serramar (proximidade descrita em anúncios da região; a distância exata ainda
não foi confirmada em fonte oficial). A estrutura privada de diagnóstico, porém,
continua no Centro.

Isso cria uma cauda longa que **nenhuma página do site disputava**: quem mora no
Perequê-Mirim não busca "laboratório em Caraguatatuba", busca pelo bairro, pela
distância ou pela coleta em casa.

## Quais bairros formam a região sul

Fonte: área de referência do **CRAS Sul** da Prefeitura de Caraguatatuba. É a
delimitação pública mais confiável — anúncio imobiliário e lista de CEP não
definem região.

| Grupo | Bairros |
|---|---|
| Eixo Perequê-Mirim | Perequê-Mirim, Travessão, Pegorelli, Morro do Algodão |
| Orla sul | Porto Novo, Praia das Palmeiras, Pontal Santa Marina |
| Jardins | Jardim Britânia, Jardim Tarumã, Jardim do Sol, Jardim do Sindicato |
| Barranco Alto | Barranco Alto, Golfinho, Fazenda Serramar, Vapapesca |
| Rural/interior | Rio Claro, Poço das Antas, Pirassununga, Jaraguá |
| Extremo sul (CRAS próprio) | Jetuba, Alto do Jetuba, Jardim Santa Rosa, Morro do Chocolate |

**Correção importante:** o **Indaiá é região central**, não sul (CRAS Centro), e
o **Martim de Sá é norte** (CRAS Norte). Peças anteriores trataram os três como
um bloco só.

## Divisão de termos — para não repetir a canibalização

| Página | Termo que ela possui |
|---|---|
| `/` (home) | marca + "medicina diagnóstica" |
| `/laboratorio-caraguatatuba` | "laboratório em Caraguatatuba" |
| `/blog/laboratorio-regiao-sul-caraguatatuba` | "laboratório na região sul", bairro por bairro |

Há um guard-rail em `server/seo-content.test.ts` que quebra o build se um título
de artigo voltar a usar "laboratório em Caraguatatuba".

## Os quatro pilares

### Pilar 1 — Localização e intenção local
Bairro, distância, deslocamento no jejum, coleta domiciliar, uma visita em vez
de três. É o pilar que justifica o projeto.

### Pilar 2 — Benchmark e autoridade
O briefing pedia artigos comparando a clínica com Oswaldo Cruz, Sabin,
Mastellini, a+, Lavoisier, Confiance e Anchieta, nominalmente.

**Não foi escrito assim, de propósito.** A Resolução CFM nº 2.336/2023 veda
publicidade que estabeleça comparação ou concorrência entre estabelecimentos de
saúde, e página feita para capturar marca de terceiro é tratada pelo Google como
conteúdo de baixa qualidade — além de ser um pedido de reclamação do
concorrente, que remove a página e ainda rende um aviso no perfil.

A tradução que entrega o mesmo tráfego de descoberta sem o risco: **critério
técnico verificável**. Quem busca "qual o melhor laboratório" quer saber como
decidir. Esse é o artigo. Um guard-rail impede que nome de concorrente volte a
qualquer peça pública.

### Pilar 3 — Transacional / resultados
Acesso ao resultado online, prazo, quem pode receber, LGPD art. 11 e sigilo.
Tráfego de intenção altíssima: quem busca "resultado de exames" já é paciente.

### Pilar 4 — Guias de exames
O que o exame avalia, preparo, erros que fazem repetir. Cada guia linka para a
página do exame correspondente em `/exames/...`.

## Publicado agora (4 artigos)

| Pilar | URL | Título |
|---|---|---|
| 1 | `/blog/laboratorio-regiao-sul-caraguatatuba` | Laboratório na Região Sul de Caraguatatuba: Como Escolher e o Que Conferir |
| 2 | `/blog/como-escolher-laboratorio-analises-clinicas` | Como Escolher um Laboratório de Análises Clínicas: 8 Critérios Técnicos |
| 3 | `/blog/resultado-de-exames-online-seguranca` | Resultado de Exames Online: Como Acessar com Segurança |
| 4 | `/blog/exame-de-urina-eas-como-coletar` | Exame de Urina (EAS): Para Que Serve e Como Coletar Corretamente |

## Calendário editorial — próximas 12 semanas

Um artigo por semana, girando os pilares. Slugs propostos; nenhum deles colide
com os 19 artigos que já existiam.

| Semana | Pilar | Slug proposto | Ângulo |
|---|---|---|---|
| 1 | 1 | `coleta-domiciliar-exames-caraguatatuba` | Como funciona, para quem compensa, o que entra e o que não entra |
| 2 | 4 | `glicemia-de-jejum-o-que-significa` | Jejum, valores de referência, pré-diabetes |
| 3 | 3 | `prazo-de-resultado-por-tipo-de-exame` | Tabela de prazos reais; captura "quanto tempo demora" |
| 4 | 1 | `exames-para-quem-mora-longe-do-centro` | Planejar o pedido médico em uma visita só |
| 5 | 2 | `o-que-e-controle-externo-de-qualidade` | PNCQ e ControlLab explicados ao paciente |
| 6 | 4 | `tsh-e-t4-livre-exame-de-tireoide` | Quando se pede, o que muda o resultado |
| 7 | 1 | `laboratorio-perto-do-hospital-regional` | Quem sai do Hospital Regional com pedido na mão |
| 8 | 4 | `perfil-lipidico-colesterol-e-triglicerides` | Jejum, frações, o que o médico olha |
| 9 | 3 | `posso-pedir-resultado-para-outra-pessoa` | Representação legal e sigilo, em linguagem simples |
| 10 | 2 | `pedido-medico-validade-e-o-que-conferir` | Validade, exame ilegível, convênio |
| 11 | 4 | `exames-admissionais-o-que-a-empresa-pede` | Liga com `/exames/exame-admissional` |
| 12 | 1 | `exames-no-verao-caraguatatuba` | Sazonalidade: a população dobra na temporada |

### Regras de produção (valem para todo artigo novo)

1. **Formato:** JSON em `client/src/content/blog/<slug>.json` + entrada em
   `index.json` + entrada em `blogMetadata` de `server/_core/routes-metadata.ts`.
   Sem a terceira, a rota dá 404 e o guard-rail de links internos quebra.
2. **Meta title ≤ 60 caracteres, meta description ≤ 155.**
3. **Parágrafo de até 3 linhas**, `##`/`###`, listas e tabela markdown — o
   renderizador suporta todos, no cliente e no pré-render.
4. **Seção "## Perguntas frequentes"** com `###` por pergunta: ela alimenta o
   `FAQPage` automaticamente (`extractFaqs`).
5. **Fecho YMYL obrigatório:** "não substitui consulta médica".
6. **Autoria honesta.** Usar `Equipe Total Quality` / `Total Quality Medicina
   Diagnóstica`. Ver a pendência de autoria abaixo.
7. **Nunca** nomear concorrente, nunca prometer resultado, nunca usar
   superlativo de superioridade (CFM 2.336/2023), nunca citar exame que a
   clínica não realiza.
8. **Horário sempre "7h30 às 18h"**, sábado e domingo fechado. O guard-rail de
   horário varre `client/src/**`, inclusive estes JSON.

## Auditoria de conformidade (CFM 2.336/2023)

Rodada antes da publicação, como último passo. Resultado: **reprovado na
primeira passada**, aprovado depois de três correções.

| Etapa | Achado | Correção |
|---|---|---|
| Art. 5º — identificação | **Nenhuma das 44 rotas** do site trazia o registro do estabelecimento nem o responsável técnico. O rodapé renderizado também não. Reprovação automática. | Identificação entrou no bloco de NAP do pré-render e no `Footer.tsx`. Cobre 44 de 44 rotas |
| Art. 11, XVI — concorrência desleal | Três trechos descreviam a falha do outro laboratório ("laboratório que manda laudo em grupo de mensagens…") em vez da regra | Reescritos para enunciar a regra, sem falar do déficit alheio |
| Etapa 5 — verificação factual | "o programa da ControlLab, ligado à SBPC/ML" era impreciso | Trocado pelo nome correto: PELM, da SBPC/ML, operado pela ControlLab |
| Etapa 2 — pilar de benchmark | O briefing pedia comparação nominal com sete redes | Reescrito por critério técnico. Nenhum nome de concorrente em peça pública, com guard-rail |
| Etapa 3 — sensacionalismo | Nenhum achado. Sem gancho de medo, sem "previna o câncer", achados laboratoriais sempre com a ressalva de que não fecham diagnóstico | — |
| Etapa 4 — imagem e prova social | Nenhum achado. Sem imagem de paciente, sem depoimento, sem laudo | — |

**Decisão humana pendente:** a aprovação final de peça com afirmação clínica é
do responsável técnico.

## Pendências que não são deste PR

1. **Autoria fabricada nos artigos antigos.** Sete dos dezenove artigos
   anteriores são assinados por "Dr. Alexandre Ribeiro — Diretor Clínico",
   "Dra. Mariana Costa", "Dr. Carlos Mendes" e "Dra. Fernanda Lima". O
   responsável técnico identificado da clínica é outro. Se essas pessoas não
   existem, é autoria falsa em conteúdo de saúde: problema de E-E-A-T e de
   identificação profissional. Decisão do Alex: confirmar os nomes ou
   substituir por `Equipe Total Quality`.
2. **NAP divergente: qual é o nome da rua?** O site escreve "Rua Padre
   Anchieta, 1010". Os fluxos de WhatsApp (ANA-02, BV-01) e a skill de
   compliance escrevem "Av. Anchieta, 1010". **Existem as duas vias em
   Caraguatatuba** — há registro de estabelecimento na Avenida Anchieta com
   outro número —, então um dos dois está errado, e não é possível decidir
   daqui. Endereço inconsistente é sinal negativo de ranking local e aparece
   no Google Business Profile. Precisa de confirmação do Alex; depois a
   correção é de uma linha em cada lugar. O guard-rail novo trava o site em
   uma única forma para que a divergência não entre por aqui.
3. **Search Console desconectado.** Sem ele não há como medir impressão por
   bairro, que é a única prova de que este projeto funcionou.

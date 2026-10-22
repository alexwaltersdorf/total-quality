# Blog — 5 artigos para os exames prioritários (22/10/2026)

Pedido do Alex: melhorar o desempenho orgânico de **exames laboratoriais, ultrassom, tomografia
computadorizada, check-up cardiológico (ECG, MAPA, Holter, com gancho de infarto e prevenção) e
exame toxicológico**, com fontes de alta confiança e o que mais funcionar para o SEO.

Os cinco nascem **rascunho** (`draft: true`, `reviewStatus: "revisao_medica_pendente"`). Abrem pela
URL com `noindex` para a revisão do Alex e ficam fora do sitemap e da listagem até a aprovação.

## Ultrassom ou ultrassonografia?

Search Console da clínica, 90 dias (22/07 a 14/10/2026, `monitoramento/dados/gsc_consultas_diario.csv`
no repo de SEO):

| Termo (com variações) | Impressões | Cliques |
|---|---|---|
| ultrassom / ultrasom / usg | **1.394** | 17 |
| ultrassonografia | 750 | 6 |

"Ultrassom" tem quase o dobro de procura. O artigo usa **ultrassom** como termo principal e
"ultrassonografia" como sinônimo. A URL da página de serviço (`/exames/ultrassonografia`) fica como
está: trocar URL que já ranqueia custa mais do que rende.

O Google Trends não foi consultado: o teste grátis do Supermetrics venceu em 05/08/2026.

## Por que artigo de cauda longa, e não "exames laboratoriais em Caraguatatuba"

Pela regra do blog de 21/10, **uma URL por intenção**: a busca com o nome da cidade pertence à página
`/exames/...` ou à home. Artigo que disputa essa intenção canibaliza a página de serviço, e foi isso
que levou às seis consolidações por 301 de 22/10.

Cada artigo pega uma dúvida informativa que **ainda não tinha página no site**, ligada ao exame e
confirmada no autocompletar do Google. Cada um leva pelo menos três links para a página do exame,
reforçando a página que de fato disputa a busca local.

| Exame pedido | Artigo | Palavra-chave principal | Página reforçada |
|---|---|---|---|
| Exames laboratoriais | `siglas-exames-laboratoriais` | siglas de exames laboratoriais | `/exames/exames-de-sangue`, `/exames/hemograma` |
| Ultrassom | `ultrassom-abdome-total-preparo` | ultrassom de abdome total | `/exames/ultrassonografia` |
| Tomografia | `tomografia-com-contraste` | tomografia com contraste | `/exames/tomografia-computadorizada` |
| Check-up cardiológico | `check-up-cardiologico-prevencao-infarto` | check-up cardiológico | `/exames/eletrocardiograma`, `/exames/mapa`, `/exames/holter` |
| Toxicológico | `exame-toxicologico-clt-motorista` | exame toxicológico CLT | `/exames/exame-toxicologico`, `/exames/exame-admissional` |

O que já tinha artigo ficou de fora, para não repetir: tomografia em geral, Doppler, toxicológico da
CNH, check-up geral, diagnóstico de infarto e guia de exames laboratoriais.

## Fontes citadas (todas abertas e conferidas)

- **Siglas:**
  - MedlinePlus/NIH: hemograma, jejum, HbA1c, colesterol, fígado, PSA.
  - INCA: PSA.
- **Ultrassom:**
  - RadiologyInfo (ACR/RSNA), duas páginas.
  - MedlinePlus.
  - Protocolos de ultrassonografia do CBR.
  - POP de ultrassonografia do HUAB-UFRN/Ebserh (gov.br).
- **Tomografia com contraste:**
  - Diretrizes do CBR para meios de contraste intravenosos.
  - Manual de Meios de Contraste do ACR.
  - RadiologyInfo.
  - MedlinePlus.
- **Check-up cardiológico:**
  - OPAS/OMS: doenças cardiovasculares.
  - Ministério da Saúde: infarto e hipertensão.
  - Atualização da Diretriz de Prevenção Cardiovascular da SBC (2019).
  - MedlinePlus.
- **Toxicológico CLT:**
  - CLT: arts. 168, 235-A e 235-B.
  - Lei 13.103/2015.
  - CTB: art. 148-A.
  - Portaria MTP 672/2021 compilada e Portaria MTE 612/2024.
  - Resolução Contran 923/2022.

## Pontos para a revisão do Alex, antes de publicar

### Siglas
- A tabela de jejum precisa ser conferida com o protocolo do laboratório. A página
  `/exames/exames-de-sangue` diz "8 a 12 horas" para o lipidograma; o artigo não cita horas.
- O artigo cita coagulograma, anti-TPO, T3, ácido fólico e urocultura com antibiograma. Confirmar
  se a clínica faz todos.

### Ultrassom
- O jejum de 6 a 8 horas vem da página da clínica.
- Definir o padrão de **bexiga cheia** no abdome total. O texto diz "em alguns serviços, sim" e
  manda confirmar pelo WhatsApp.

### Tomografia com contraste
- Confirmar que a clínica aplica contraste venoso e se usa contraste oral.
- Mostrar as taxas de reação do CBR e do ACR, ou não.
- A menção da diretriz à tireoide do bebê, em gestante, fica ou sai?
- O manual do ACR considera o jejum dispensável com os contrastes atuais. O texto mantém as 4 horas
  da clínica.

### Check-up cardiológico
- A diretriz citada é a de 2019. Trocar se houver versão mais nova.
- O sintoma atípico em mulheres tem como fonte a MedlinePlus em espanhol.

### Toxicológico CLT
- A página `/exames/exame-toxicologico` diz "90 a 180 dias" de janela e "5 a 10 dias úteis" de
  resultado. Nenhuma norma traz os 180 dias, e o prazo de laudo contraria a regra "resultados em
  curto prazo". **Corrigir a página** (pendência fora deste PR).
- Pela Portaria 672/2021, o toxicológico **não entra no ASO**. Vale para a página
  `/exames/exame-admissional` e para a conversa comercial com as empresas.

### Para publicar cada artigo
`draft: false`, `reviewStatus: "aprovado"` e `lastReviewed`, conforme o teste. Depois, pedir a
indexação da URL no Search Console e incluir um link para o artigo na página do exame (enquanto é
rascunho, página publicada não pode linkar para ele).

## Rodapé dos artigos no modelo de fechamento do Alex

Junto com os artigos, o rodapé de **todos** os artigos do blog passa a seguir o modelo de 22/10:

- aviso literal: "Este conteúdo é informativo e não substitui a consulta médica. A interpretação
  dos resultados deve ser feita pelo seu médico.";
- identificação em três linhas, com clínica e registro, responsável técnico, endereço e telefone.

Os testes passaram a exigir o texto novo.

## Backlinks: o que dá para fazer, e o que não fazer

**Link externo citado no artigo não é backlink.** As fontes acima são links *de saída*: dão
credibilidade ao texto (E-E-A-T), mas não transferem autoridade para o site. **Backlink** é outro
site linkando para o totalquality.med.br. Ele não se cria de dentro do site, e comprar ou fabricar
links fere as diretrizes do Google. O lote de 17/10/2026, com 60 links pagos sem `rel="sponsored"`,
já é um risco a administrar e não deve crescer.

Backlinks legítimos, em ordem de esforço × retorno (ações do Alex):

1. **Convênios:** pedir que a página de rede credenciada do Cartão de Todos, da Solumedi e da Leader
   liste a clínica com link para o site.
2. **Laboratório credenciado do toxicológico:** o localizador de postos de coleta deve listar a
   unidade com link para `/exames/exame-toxicologico`.
3. **Empresas atendidas em saúde ocupacional:** página de fornecedores ou parceiros com link para
   `/exames/exame-admissional`.
4. **Associação Comercial de Caraguatatuba e guias de serviço da cidade:** cadastro com o NAP
   idêntico ao do perfil do Google.
5. **Imprensa local:** pauta de utilidade pública com fonte oficial, por exemplo o alerta da Anvisa
   sobre o lote falsificado de Mounjaro ou a coleta sem agendamento. Matéria com link para o artigo
   é o backlink de maior peso que uma clínica local consegue.
6. **Médicos que encaminham pacientes:** link do site do consultório para a página do exame.

## A alavanca maior, além dos 5 artigos

Search Console, 90 dias por página:

| Página | Impressões | CTR | Posição |
|---|---|---|---|
| `/blog/eletrocardiograma-o-que-e-como-e-feito` | 29.475 | 0,1% | 8,9 |
| `/blog/hemograma-completo-o-que-avalia` | 19.518 | 0,1% | 8,8 |
| `/exames/hemograma` | 14.606 | 0,1% | 8,6 |

São mais de 63 mil impressões no fim da primeira página, com quase nenhum clique. Levar essas três
URLs para o top 3 rende mais tráfego que qualquer artigo novo. O caminho é aprofundar o conteúdo e
reescrever title e description para a intenção real ("ecg o que é": 3.200 impressões). É a próxima
frente sugerida.

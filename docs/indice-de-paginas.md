# Índice de páginas e arquivos HTML

Relação de **todo documento HTML que este repositório produz ou contém**.

| | |
|---|---|
| Gerado em | 19/10/2026 |
| Commit de referência | `246edd6` |
| Páginas no sitemap | **47** |
| Páginas servidas fora do sitemap | 4 |
| Arquivos `.html` versionados | 4 |

## Antes de usar esta lista: o site não tem "arquivos .html"

É um SPA em React servido por Node. As páginas **não existem como arquivos no
disco** — cada rota é montada na hora e entregue como documento HTML, com o
conteúdo pré-renderizado no servidor (`server/_core/seo-content.ts`) para que
o Google leia a página antes de o React montar.

Por isso esta lista tem duas partes que não se misturam:

1. **Páginas** (as 51 rotas abaixo) — é o que existe como documento HTML para
   quem acessa o site. É quase certamente o que você procura.
2. **Arquivos `.html`** (4, no fim) — arquivos literais no repositório. Três
   deles não são páginas do site.

A fonte desta lista é `server/_core/routes-metadata.ts`, o mesmo módulo que
gera o `sitemap.xml`. Lista escrita à mão envelhece; esta pode ser regenerada.

---

## 1. Home

| Caminho | Link | Título | Prioridade |
|---|---|---|---|
| `/` | [abrir](https://totalquality.med.br/) | Laboratório em Caraguatatuba \| Total Quality \| Ligue Agora | 1 |

## 2. Institucionais e de conversão

| Caminho | Link | Título | Prioridade |
|---|---|---|---|
| `/bioimpedancia` | [abrir](https://totalquality.med.br/bioimpedancia) | Bioimpedância em Caraguatatuba \| Total Quality | 0.8 |
| `/blog` | [abrir](https://totalquality.med.br/blog) | Blog Total Quality \| Artigos sobre Saúde e Diagnóstico | 0.8 |
| `/cartao` | [abrir](https://totalquality.med.br/cartao) | Cartão Total Quality Care \| Benefícios e Cashback | 0.8 |
| `/checkup` | [abrir](https://totalquality.med.br/checkup) | Check-up Preventivo: Planos e Preços \| Total Quality | 0.9 |
| `/convenios` | [abrir](https://totalquality.med.br/convenios) | Convênios Aceitos \| Laboratório Total Quality Caraguatatuba | 0.7 |
| `/exames` | [abrir](https://totalquality.med.br/exames) | Exames Laboratoriais e de Imagem \| Total Quality | 0.9 |
| `/laboratorio-caraguatatuba` | [abrir](https://totalquality.med.br/laboratorio-caraguatatuba) | Laboratório de Análises Clínicas \| Total Quality | 0.8 |
| `/outubro-rosa` | [abrir](https://totalquality.med.br/outubro-rosa) | Check-up Outubro Rosa em Caraguatatuba \| Total Quality | 0.7 |
| `/privacidade` | [abrir](https://totalquality.med.br/privacidade) | Política de Privacidade \| Total Quality Medicina Diagnóstica | 0.3 |

## 3. Páginas de exame

| Caminho | Link | Título | Prioridade |
|---|---|---|---|
| `/exames/eletrocardiograma` | [abrir](https://totalquality.med.br/exames/eletrocardiograma) | Eletrocardiograma (ECG) em Caraguatatuba \| Total Quality | 0.8 |
| `/exames/eletroencefalograma` | [abrir](https://totalquality.med.br/exames/eletroencefalograma) | Eletroencefalograma (EEG) em Caraguatatuba \| Total Quality | 0.8 |
| `/exames/espirometria` | [abrir](https://totalquality.med.br/exames/espirometria) | Espirometria em Caraguatatuba \| Teste de Função Pulmonar | 0.8 |
| `/exames/exame-admissional` | [abrir](https://totalquality.med.br/exames/exame-admissional) | Exame Admissional e ASO em Caraguatatuba \| Total Quality | 0.9 |
| `/exames/exame-toxicologico` | [abrir](https://totalquality.med.br/exames/exame-toxicologico) | Exame Toxicológico em Caraguatatuba \| Total Quality | 0.8 |
| `/exames/exames-de-sangue` | [abrir](https://totalquality.med.br/exames/exames-de-sangue) | Exames de Sangue em Caraguatatuba \| Total Quality | 0.9 |
| `/exames/hemograma` | [abrir](https://totalquality.med.br/exames/hemograma) | Hemograma Completo em Caraguatatuba \| Total Quality | 0.9 |
| `/exames/holter` | [abrir](https://totalquality.med.br/exames/holter) | Holter 24h em Caraguatatuba \| Total Quality | 0.8 |
| `/exames/mamografia` | [abrir](https://totalquality.med.br/exames/mamografia) | Mamografia Digital em Caraguatatuba \| Total Quality | 0.9 |
| `/exames/mapa` | [abrir](https://totalquality.med.br/exames/mapa) | MAPA 24h em Caraguatatuba \| Total Quality | 0.8 |
| `/exames/raio-x` | [abrir](https://totalquality.med.br/exames/raio-x) | Raio-X em Caraguatatuba \| Clínica Total Quality | 0.9 |
| `/exames/tomografia-computadorizada` | [abrir](https://totalquality.med.br/exames/tomografia-computadorizada) | Tomografia Computadorizada em Caraguatatuba \| Total Quality | 0.9 |
| `/exames/ultrassonografia` | [abrir](https://totalquality.med.br/exames/ultrassonografia) | Ultrassonografia em Caraguatatuba \| Total Quality | 0.9 |

## 4. Artigos do blog

| Caminho | Link | Título | Prioridade |
|---|---|---|---|
| `/blog/alimentacao-e-exames-laboratoriais` | [abrir](https://totalquality.med.br/blog/alimentacao-e-exames-laboratoriais) | Como a Alimentação Influencia Seus Exames \| Total Quality | 0.7 |
| `/blog/aso-exames-ocupacionais` | [abrir](https://totalquality.med.br/blog/aso-exames-ocupacionais) | ASO: O Que É e Quando Deve Ser Emitido \| Total Quality | 0.6 |
| `/blog/check-up-medico-quais-exames-fazer` | [abrir](https://totalquality.med.br/blog/check-up-medico-quais-exames-fazer) | Check-up Médico: Quais Exames Fazer? \| Total Quality | 0.7 |
| `/blog/check-up-preventivo-quando-fazer` | [abrir](https://totalquality.med.br/blog/check-up-preventivo-quando-fazer) | Check-up Preventivo: Quando Fazer \| Total Quality | 0.7 |
| `/blog/como-escolher-laboratorio-analises-clinicas` | [abrir](https://totalquality.med.br/blog/como-escolher-laboratorio-analises-clinicas) | Como Escolher um Laboratório: 8 Critérios Técnicos | 0.7 |
| `/blog/convenios-laboratorio-caraguatatuba` | [abrir](https://totalquality.med.br/blog/convenios-laboratorio-caraguatatuba) | Convênios Aceitos em Caraguatatuba \| Total Quality | 0.7 |
| `/blog/diferenca-raio-x-tomografia` | [abrir](https://totalquality.med.br/blog/diferenca-raio-x-tomografia) | Raio-X e Tomografia: Qual a Diferença? \| Total Quality | 0.7 |
| `/blog/diferenca-ultrassom-comum-doppler` | [abrir](https://totalquality.med.br/blog/diferenca-ultrassom-comum-doppler) | Ultrassom Comum e com Doppler: Diferença \| Total Quality | 0.7 |
| `/blog/eletrocardiograma-o-que-e-como-e-feito` | [abrir](https://totalquality.med.br/blog/eletrocardiograma-o-que-e-como-e-feito) | Eletrocardiograma (ECG): O Que É \| Total Quality | 0.7 |
| `/blog/exame-de-urina-eas-como-coletar` | [abrir](https://totalquality.med.br/blog/exame-de-urina-eas-como-coletar) | Exame de Urina (EAS): Como Coletar Corretamente | 0.7 |
| `/blog/exame-toxicologico-cnh` | [abrir](https://totalquality.med.br/blog/exame-toxicologico-cnh) | Exame Toxicológico para CNH: Quem Precisa? \| Total Quality | 0.6 |
| `/blog/exames-de-sangue-guia-completo` | [abrir](https://totalquality.med.br/blog/exames-de-sangue-guia-completo) | Exames de Sangue: Guia de Resultados \| Total Quality | 0.7 |
| `/blog/hemograma-caraguatatuba` | [abrir](https://totalquality.med.br/blog/hemograma-caraguatatuba) | Hemograma em Caraguatatuba \| Total Quality | 0.7 |
| `/blog/hemograma-completo-o-que-avalia` | [abrir](https://totalquality.med.br/blog/hemograma-completo-o-que-avalia) | Hemograma Completo: O Que o Exame Avalia? \| Total Quality | 0.7 |
| `/blog/hipoglicemia-sintomas-e-exames` | [abrir](https://totalquality.med.br/blog/hipoglicemia-sintomas-e-exames) | Hipoglicemia: Sintomas, Causas e Quais Exames Fazer | 0.7 |
| `/blog/laboratorio-regiao-sul-caraguatatuba` | [abrir](https://totalquality.med.br/blog/laboratorio-regiao-sul-caraguatatuba) | Laboratório na Região Sul de Caraguatatuba \| Total Quality | 0.8 |
| `/blog/mamografia-ultrassom-mamas-diferencas` | [abrir](https://totalquality.med.br/blog/mamografia-ultrassom-mamas-diferencas) | Mamografia e Ultrassom das Mamas: Diferenças \| Total Quality | 0.7 |
| `/blog/mapa-ou-holter-diferenca` | [abrir](https://totalquality.med.br/blog/mapa-ou-holter-diferenca) | MAPA ou Holter: Qual a Diferença? \| Total Quality | 0.7 |
| `/blog/resultado-de-exames-online-seguranca` | [abrir](https://totalquality.med.br/blog/resultado-de-exames-online-seguranca) | Resultado de Exames Online: Acesso Seguro e LGPD | 0.7 |
| `/blog/saude-do-coracao-prevencao` | [abrir](https://totalquality.med.br/blog/saude-do-coracao-prevencao) | Saúde do Coração: 7 Hábitos Essenciais \| Total Quality | 0.7 |
| `/blog/tomografia-caraguatatuba` | [abrir](https://totalquality.med.br/blog/tomografia-caraguatatuba) | Tomografia em Caraguatatuba: O que Saber \| Total Quality | 0.7 |
| `/blog/tomografia-computadorizada-como-funciona` | [abrir](https://totalquality.med.br/blog/tomografia-computadorizada-como-funciona) | Tomografia Computadorizada: Como Funciona? \| Total Quality | 0.7 |
| `/blog/ultrassonografia-caraguatatuba` | [abrir](https://totalquality.med.br/blog/ultrassonografia-caraguatatuba) | Guia de Ultrassonografia em Caraguatatuba \| Total Quality | 0.7 |
| `/blog/vitamina-d-importancia-saude` | [abrir](https://totalquality.med.br/blog/vitamina-d-importancia-saude) | Vitamina D: Deficiência é Comum? \| Total Quality | 0.7 |

---

## 5. Páginas servidas, mas fora do sitemap

Respondem 200 e são documentos HTML como os outros. Ficam fora do sitemap de
propósito: são etapas de fluxo ou utilitários, não conteúdo para buscador.

| Caminho | Link | Para que serve |
|---|---|---|
| `/ligar` | [abrir](https://totalquality.med.br/ligar) | redireciona para a chamada telefônica |
| `/obrigado-chamada` | [abrir](https://totalquality.med.br/obrigado-chamada) | confirmação após o clique de ligar |
| `/formulario-sucesso` | [abrir](https://totalquality.med.br/formulario-sucesso) | confirmação após envio do formulário |
| `/404` | [abrir](https://totalquality.med.br/404) | página de erro |

## 6. Artigos dinâmicos (AutoSEO)

Além das rotas acima, o roteador tem um catch-all `/:slug` que serve artigos
**vindos do banco de dados, não do repositório**. Eles são documentos HTML
reais e respondem 200, mas **não dá para enumerá-los a partir do código** — a
lista existe só em tempo de execução.

Para levantá-los, consulte a fonte do AutoSEO ou o `sitemap.xml` publicado.

---

## 7. Arquivos `.html` versionados no repositório

Quatro, e só um deles tem a ver com as páginas do site.

| Arquivo | O que é |
|---|---|
| `client/index.html` | **Molde**, não página. É o HTML base onde o servidor injeta o conteúdo pré-renderizado de cada rota. Não tem URL própria. |
| `automacao/ana-agenda/auditoria-ana.html` | Relatório interno de auditoria da Ana. Não é publicado. |
| `automacao/ana-agenda/painel-jornada-artefato.html` | Artefato do painel da jornada. Não é publicado. |
| `client/public/painel/3vlGKBrUwBfsNPbbOtH2HAxx9HDOCAVQrQlzv_knvSM.html` | Painel operacional. **É publicado** — ver o aviso abaixo. |

### Aviso sobre o painel operacional

Esse arquivo fica em `client/public/`, então **vai ao ar** em
`https://totalquality.med.br/painel/<nome-do-arquivo>.html`.

O nome embaralhado é a única barreira para a maior parte dele. Verificado em
19/10/2026:

- A seção **"Pacientes e conversas" está protegida de verdade**: a senha é
  conferida no servidor (cabeçalho `x-senha`, 401 quando não bate) e o HTML
  não carrega segredo nenhum. Quem tem só o link não abre essa parte. Isso
  está correto.
- As outras cinco seções — onde as pessoas somem, tempo de resposta da Ana,
  demanda por exame que a clínica não faz, follow-ups disparados e o que está
  travado — **abrem para qualquer um que tenha o link**. São dados
  operacionais do negócio, não dados de paciente.
- **Este repositório é público.** O nome do arquivo está no histórico do Git
  desde que foi commitado, então ele não é secreto — nem antes, nem depois
  desta lista.

Não é vazamento de dado de paciente. É exposição de dado operacional, e o
nome embaralhado não resolve. Se isso incomodar, a correção é pedir a mesma
senha de servidor para o painel inteiro, não trocar o nome do arquivo.

---

## Como regenerar

Pelo sitemap publicado, que é a forma mais direta:

```bash
curl -s https://totalquality.med.br/sitemap.xml | grep -oE '<loc>[^<]+' | cut -c6-
```

Pelo código, que inclui também as rotas fora do sitemap:

```bash
grep -oE 'canonical: "[^"]+"' server/_core/routes-metadata.ts | cut -d'"' -f2
```

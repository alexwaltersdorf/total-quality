# Créditos das imagens do blog

A Resolução CFM nº 2.336/2023 pede que peça publicitária que use banco de
imagens **cite a origem**. Este arquivo é esse registro.

Regra para artigo novo: a imagem entra em `client/public/images/blog/<slug>.webp`
e **a linha correspondente entra nesta tabela**. Há um guard-rail em
`server/seo-content.test.ts` que quebra o build se um artigo ficar sem imagem
própria ou se duas imagens se repetirem.

## Fotos da própria clínica

Preferidas sempre que servirem ao assunto: são a Total Quality de verdade, e
isso vale mais para SEO local e para E-E-A-T do que qualquer banco de imagens.

| Artigo | Arquivo | O que mostra |
|---|---|---|
| `convenios-laboratorio-caraguatatuba` | `recepcao-1024.webp` | recepção real da clínica |
| `laboratorio-regiao-sul-caraguatatuba` | `fachada-1024.webp` | prédio real da clínica |
| `como-escolher-laboratorio-analises-clinicas` | `laboratorio-1024.webp` | bancada de laboratório |
| `tomografia-caraguatatuba` | `tomografia-1024.webp` | leitura de cortes de tomografia |
| `diferenca-ultrassom-comum-doppler` | `cardiologia-1024.webp` | ultrassom com Doppler colorido |

> O nome `cardiologia-*.webp` engana: a foto é de **ultrassom com Doppler**, não
> de cardiologia. Foi por causa desse nome que ela foi parar, em set/2026, nos
> artigos de eletrocardiograma, MAPA e Holter.

## Banco de imagens — Unsplash

Licença Unsplash: uso comercial livre, sem necessidade de permissão. O
identificador é o da URL em `images.unsplash.com`, que permite rastrear a foto
original.

| Artigo | Identificador | O que mostra |
|---|---|---|
| `exames-de-sangue-guia-completo` | `photo-1606206591513-adbfbdd7a177` | estante com tubos de coleta de tampas coloridas |
| `hemograma-caraguatatuba` | `photo-1614935151651-0bea6508db6b` | profissional pipetando amostra em microtubos |
| `hemograma-completo-o-que-avalia` | `photo-1758656803198-eeea35110219` | hemácias e leucócitos ao microscópio |
| `alimentacao-e-exames-laboratoriais` | `photo-1767972159709-52936afffdbf` | despertador sobre prato vazio com talheres |
| `vitamina-d-importancia-saude` | `photo-1664956618021-73c47736845e` | cápsulas de suplemento saindo do frasco |
| `exame-de-urina-eas-como-coletar` | `photo-1612278247769-af223a6e7d7f` | mãos enluvadas com estante de amostras |
| `exame-toxicologico-cnh` | `photo-1777907156647-4f5a2949d528` | rodovia com caminhão |
| `saude-do-coracao-prevencao` | `photo-1700832082200-af7deeb63d9b` | estetoscópio e manômetro de pressão |
| `ultrassonografia-caraguatatuba` | `photo-1691935071222-c008a4ccc2ca` | console de ultrassom com transdutores |
| `mamografia-ultrassom-mamas-diferencas` | `photo-1579154341140-5aa3a445d43b` | paciente posicionada no mamógrafo |
| `tomografia-computadorizada-como-funciona` | `photo-1666214282459-c7dff167ecc0` | sala de tomografia com o gantry aberto |
| `diferenca-raio-x-tomografia` | `photo-1616012480717-fd9867059ca0` | radiografia de tórax |
| `resultado-de-exames-online-seguranca` | `photo-1654588831193-0285dab84d5a` | cadeado sobre teclado |
| `check-up-preventivo-quando-fazer` | `photo-1758691461935-202e2ef6b69f` | médico conversando com paciente |
| `check-up-medico-quais-exames-fazer` | `photo-1758691461990-03b49d969495` | médico escrevendo em prancheta |
| `eletrocardiograma-o-que-e-como-e-feito` | `photo-1724395261682-c8b152dc5b9b` | traçado de eletrocardiograma em papel |
| `mapa-ou-holter-diferenca` | `photo-1631815584191-0ed1723f0ead` | aferição de pressão arterial no braço |
| `aso-exames-ocupacionais` | `photo-1700727448686-b314cb5f9948` | linha de produção com trabalhadores |

## O que foi descartado, e por quê

Não é purismo: cada uma destas foi baixada, aberta e recusada por um motivo
concreto. Fica registrado para ninguém repetir a escolha.

| Candidata | Motivo da recusa |
|---|---|
| Laranja e limão com cápsulas (vitamina D) | citrus é vitamina **C**; a associação está errada num artigo de saúde |
| Motorista de caminhão sorrindo na cabine | pessoa identificável associada a um artigo sobre exame toxicológico |
| Cadeado em luz neon vermelha e verde | estética de invasão de sistema, não de sigilo de dado de paciente |
| Médica conversando com paciente | jaleco com crachá legível de **outra instituição** (National Cancer Institute) |
| Ilustração de Holter do NIH | rótulos em inglês ("Electrodes attached to chest") num site em português |
| Técnico em uniforme camuflado na tomografia | uniforme militar destoa de clínica privada |
| Celular com app de mensagem e planilha | marca de produto visível e nada a ver com resultado de exame |
| Cartela Pantone sobre provas de impressão | assunto completamente alheio |

## Limite conhecido

Estas são fotos de banco de imagens: **ilustram o assunto, não retratam a Total
Quality**. Por isso nenhum `alt` delas afirma que a cena aconteceu na clínica.

Seis assuntos ficariam melhores com foto própria — eletrocardiograma, MAPA e
Holter, mamografia, raio-x, coleta de sangue e bioimpedância. Quando essas
fotos existirem, é trocar o arquivo em `client/public/images/blog/` e atualizar
a linha desta tabela.

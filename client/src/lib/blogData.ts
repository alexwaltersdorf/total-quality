/*
 * Blog Data — Total Quality Medicina Diagnóstica
 * Artigos sobre saúde, bem-estar e medicina preventiva
 * SEO-optimized content for Caraguatatuba and Litoral Norte
 */

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  category: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  image: string;
  tags: string[];
  content: string[];
}

export const blogCategories = [
  "Todos",
  "Medicina Preventiva",
  "Exames Laboratoriais",
  "Saúde do Coração",
  "Nutrição",
  "Bem-Estar",
];

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    slug: "check-up-preventivo-quando-fazer",
    title: "Check-Up Preventivo: Quando Fazer e Por Que É Tão Importante",
    subtitle: "Descubra a frequência ideal e os exames essenciais para cada faixa etária",
    excerpt: "O check-up preventivo é a principal ferramenta para detectar doenças em estágio inicial, quando o tratamento é mais eficaz. Saiba quando fazer e quais exames são recomendados para cada idade.",
    category: "Medicina Preventiva",
    author: "Equipe Total Quality",
    authorRole: "Revisão: Responsável Técnico Alex Waltersdorf — CRM 267.339",
    date: "10 Abr 2026",
    readTime: "8 min",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029159398/JL54VveRaBTccEphCgT7vi/blog-checkup-preventivo-H3wYYGRF5gsNjaJi3J89XG.webp",
    tags: ["check-up", "medicina preventiva", "exames", "saúde", "Caraguatatuba"],
    content: [
      "A medicina preventiva evoluiu significativamente nas últimas décadas, e o check-up periódico se consolidou como uma das estratégias mais eficazes para a manutenção da saúde. Diferente do que muitos pensam, o check-up não é apenas uma bateria de exames — é uma avaliação completa que considera o histórico familiar, estilo de vida, fatores de risco e sintomas do paciente.",
      "Para adultos jovens entre 20 e 35 anos, recomenda-se realizar um check-up a cada dois anos. Nessa faixa etária, os exames básicos incluem hemograma completo, glicemia de jejum, perfil lipídico (colesterol total, HDL, LDL e triglicerídeos), função hepática (TGO e TGP), função renal (ureia e creatinina) e exame de urina. Para mulheres, adiciona-se o papanicolau e, a partir dos 25 anos, a mamografia pode ser indicada em casos de histórico familiar.",
      "A partir dos 40 anos, a frequência deve aumentar para anualmente. Além dos exames básicos, é importante incluir marcadores tumorais como PSA (para homens), CA-125 (para mulheres), dosagem de vitamina D, vitamina B12, TSH e T4 livre para avaliação da tireoide, hemoglobina glicada para rastreamento de diabetes, e ácido úrico. Exames de imagem como ultrassonografia abdominal e ecocardiograma também passam a ser recomendados.",
      "Após os 50 anos, exames mais específicos entram no protocolo: colonoscopia, densitometria óssea (especialmente para mulheres na pós-menopausa), eletrocardiograma de esforço, e avaliação oftalmológica completa. O rastreamento de câncer de cólon, próstata e mama se torna prioritário nessa faixa etária.",
      "Na Total Quality Medicina Diagnóstica em Caraguatatuba, oferecemos pacotes de check-up personalizados para cada faixa etária — Básico, Completo e Premium — com resultados rápidos e atendimento humanizado. Nosso laboratório conta com equipamentos de última geração e uma equipe médica especializada para orientar cada paciente sobre os exames mais adequados ao seu perfil.",
      "Não espere sentir sintomas para cuidar da sua saúde. A detecção precoce de condições como diabetes, hipertensão, dislipidemia e até câncer pode fazer toda a diferença no prognóstico e na qualidade de vida. Agende seu check-up preventivo e invista no seu bem-estar."
    ],
  },
  {
    id: "2",
    slug: "exames-de-sangue-guia-completo",
    title: "Exames de Sangue: Guia Completo Para Entender Seus Resultados",
    subtitle: "Hemograma, glicemia, colesterol e mais — o que cada exame revela sobre sua saúde",
    excerpt: "Entender os resultados dos exames de sangue pode parecer complicado, mas é fundamental para acompanhar sua saúde. Conheça os principais exames e o que cada valor significa.",
    category: "Exames Laboratoriais",
    author: "Equipe Total Quality",
    authorRole: "Revisão: Responsável Técnico Alex Waltersdorf — CRM 267.339",
    date: "05 Abr 2026",
    readTime: "10 min",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029159398/JL54VveRaBTccEphCgT7vi/blog-exames-sangue-HkT8nSoKCKwts66yzgDEsc.webp",
    tags: ["exames de sangue", "hemograma", "glicemia", "colesterol", "laboratório", "Caraguatatuba"],
    content: [
      "Os exames de sangue são a ferramenta diagnóstica mais solicitada na medicina moderna. Uma simples coleta pode revelar informações valiosas sobre o funcionamento de praticamente todos os órgãos e sistemas do corpo humano. Na Total Quality, realizamos mais de 200 tipos diferentes de exames laboratoriais, e neste artigo vamos explicar os mais comuns.",
      "O hemograma completo é o exame mais básico e informativo. Ele avalia três componentes principais: glóbulos vermelhos (hemácias), que transportam oxigênio; glóbulos brancos (leucócitos), que combatem infecções; e plaquetas, responsáveis pela coagulação. Valores de hemoglobina abaixo de 12 g/dL em mulheres ou 13 g/dL em homens indicam anemia. Leucócitos acima de 11.000/mm³ podem sugerir infecção ou inflamação.",
      "A glicemia de jejum mede o nível de açúcar no sangue após 8 a 12 horas sem comer. Valores normais ficam entre 70 e 99 mg/dL. Entre 100 e 125 mg/dL indica pré-diabetes, e acima de 126 mg/dL em duas medições confirma diabetes. A hemoglobina glicada (HbA1c) complementa esse exame, mostrando a média da glicemia nos últimos 2 a 3 meses — valores abaixo de 5,7% são considerados normais.",
      "O perfil lipídico avalia o colesterol total, HDL (bom colesterol), LDL (mau colesterol) e triglicerídeos. O colesterol total ideal deve ficar abaixo de 200 mg/dL, o HDL acima de 40 mg/dL para homens e 50 mg/dL para mulheres, o LDL abaixo de 130 mg/dL, e os triglicerídeos abaixo de 150 mg/dL. Alterações nesses valores aumentam o risco de doenças cardiovasculares.",
      "Exames de função tireoidiana (TSH e T4 livre) são essenciais para detectar hipo ou hipertireoidismo, condições que afetam o metabolismo, peso, humor e energia. O TSH normal varia entre 0,4 e 4,0 mUI/L. Já a vitamina D, cuja deficiência atinge cerca de 60% da população brasileira, deve estar acima de 30 ng/mL para ser considerada adequada.",
      "Na Total Quality em Caraguatatuba, oferecemos coleta de sangue com horário agendado, ambiente confortável e resultados disponíveis em até 24 horas para a maioria dos exames. Nossa equipe de biomédicos e patologistas segue rigoroso controle de qualidade em cada resultado. Consulte seu médico regularmente e mantenha seus exames em dia."
    ],
  },
  {
    id: "3",
    slug: "saude-do-coracao-prevencao",
    title: "Saúde do Coração: 7 Hábitos Que Podem Salvar Sua Vida",
    subtitle: "Doenças cardiovasculares são a principal causa de morte no Brasil — saiba como se proteger",
    excerpt: "As doenças cardiovasculares são responsáveis por mais de 400 mil mortes por ano no Brasil. Conheça os 7 hábitos comprovados pela ciência que protegem seu coração.",
    category: "Saúde do Coração",
    author: "Equipe Total Quality",
    authorRole: "Revisão: Responsável Técnico Alex Waltersdorf — CRM 267.339",
    date: "28 Mar 2026",
    readTime: "7 min",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029159398/JL54VveRaBTccEphCgT7vi/blog-saude-coracao-PmoS9mrNUzxRHbNwgJahDt.webp",
    tags: ["cardiologia", "saúde do coração", "prevenção", "teste ergométrico", "eletrocardiograma"],
    content: [
      "As doenças cardiovasculares continuam sendo a principal causa de morte no Brasil e no mundo. Segundo dados da Sociedade Brasileira de Cardiologia, mais de 400 mil brasileiros morrem por ano em decorrência de problemas cardíacos — um número que poderia ser significativamente reduzido com prevenção adequada e exames regulares.",
      "O primeiro hábito essencial é a prática regular de exercícios físicos. A Organização Mundial da Saúde recomenda pelo menos 150 minutos de atividade moderada por semana — o equivalente a 30 minutos, cinco vezes por semana. Caminhada, natação, ciclismo e dança são excelentes opções. O exercício fortalece o músculo cardíaco, melhora a circulação e ajuda a controlar pressão arterial, colesterol e glicemia.",
      "O segundo hábito é manter uma alimentação equilibrada, rica em frutas, verduras, legumes, grãos integrais e gorduras saudáveis (como azeite de oliva e peixes ricos em ômega-3). Reduzir o consumo de sal, açúcar refinado, gorduras trans e alimentos ultraprocessados é fundamental para a saúde cardiovascular.",
      "O terceiro hábito é controlar o estresse. O estresse crônico eleva os níveis de cortisol e adrenalina, aumentando a pressão arterial e a frequência cardíaca. Técnicas como meditação, yoga, respiração profunda e momentos de lazer são aliados importantes. O quarto hábito é não fumar — o tabagismo é um dos maiores fatores de risco para infarto e AVC.",
      "O quinto hábito é manter o peso adequado. A obesidade sobrecarrega o coração e está associada a hipertensão, diabetes e dislipidemia. O sexto hábito é dormir bem — adultos devem dormir entre 7 e 9 horas por noite. A privação de sono aumenta o risco de hipertensão e arritmias cardíacas.",
      "O sétimo e talvez mais importante hábito é realizar exames cardiológicos regulares. Na Total Quality, oferecemos eletrocardiograma, teste ergométrico, MAPA (Monitorização Ambulatorial da Pressão Arterial) e Holter 24h. Esses exames permitem avaliar a estrutura e o funcionamento do coração, detectando alterações antes que se tornem emergências. Cuide do seu coração — agende sua avaliação cardiológica."
    ],
  },
  {
    id: "4",
    slug: "alimentacao-e-exames-laboratoriais",
    title: "Como a Alimentação Influencia Seus Exames Laboratoriais",
    subtitle: "Entenda a relação entre dieta, jejum e a precisão dos resultados dos seus exames",
    excerpt: "Sua alimentação pode alterar significativamente os resultados dos exames de sangue. Saiba como se preparar corretamente e quais alimentos podem interferir nos seus resultados.",
    category: "Nutrição",
    author: "Equipe Total Quality",
    authorRole: "Revisão: Responsável Técnico Alex Waltersdorf — CRM 267.339",
    date: "20 Mar 2026",
    readTime: "6 min",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029159398/JL54VveRaBTccEphCgT7vi/blog-alimentacao-saudavel-LKmxx5h7vWHPTY72QyqR9j.webp",
    tags: ["alimentação", "exames laboratoriais", "jejum", "nutrição", "preparo para exames"],
    content: [
      "A relação entre alimentação e exames laboratoriais é mais estreita do que a maioria das pessoas imagina. O que você come nas horas e dias que antecedem a coleta de sangue pode influenciar diretamente os resultados, levando a interpretações equivocadas e até a diagnósticos incorretos. Entender essa relação é fundamental para garantir a precisão dos seus exames.",
      "O jejum é o preparo mais conhecido e importante. Para a glicemia de jejum, recomenda-se um período de 8 a 12 horas sem ingestão de alimentos. Para o perfil lipídico (colesterol e triglicerídeos), o jejum de 12 horas é o ideal, embora estudos recentes mostrem que o jejum de 8 horas já é suficiente para a maioria dos casos. Durante o jejum, é permitido e recomendado beber água.",
      "Alguns alimentos podem alterar resultados específicos. O consumo excessivo de gorduras nas 24 horas antes da coleta pode elevar artificialmente os triglicerídeos. Alimentos ricos em vitamina C podem interferir na dosagem de glicose. O consumo de álcool nas 72 horas anteriores pode alterar enzimas hepáticas (TGO e TGP) e triglicerídeos.",
      "A cafeína também merece atenção. O café, mesmo sem açúcar, pode elevar os níveis de cortisol e catecolaminas, interferindo em exames hormonais. Para dosagens de cortisol, prolactina e catecolaminas, recomenda-se evitar cafeína nas 24 horas anteriores. Já para exames de urina, o consumo de beterraba pode alterar a cor, gerando falsos alarmes.",
      "Suplementos alimentares e vitaminas também podem interferir. A biotina (vitamina B7), presente em muitos suplementos para cabelo e unhas, pode causar resultados falsos em exames de tireoide e marcadores cardíacos. Informe sempre ao laboratório sobre qualquer suplemento que esteja tomando.",
      "Na Total Quality, nossa equipe de atendimento orienta cada paciente sobre o preparo adequado para cada tipo de exame. Oferecemos um guia de preparo personalizado no momento do agendamento, para que seus resultados sejam os mais precisos possíveis. Em caso de dúvidas, entre em contato pelo WhatsApp (12) 3887-3535."
    ],
  },
  {
    id: "5",
    slug: "vitamina-d-importancia-saude",
    title: "Vitamina D: Por Que Você Provavelmente Está Com Deficiência",
    subtitle: "Mesmo no Brasil tropical, a deficiência de vitamina D atinge milhões de pessoas",
    excerpt: "Estima-se que 60% dos brasileiros tenham níveis insuficientes de vitamina D. Entenda por que isso acontece, os riscos para a saúde e como manter seus níveis adequados.",
    category: "Bem-Estar",
    author: "Equipe Total Quality",
    authorRole: "Revisão: Responsável Técnico Alex Waltersdorf — CRM 267.339",
    date: "12 Mar 2026",
    readTime: "7 min",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029159398/JL54VveRaBTccEphCgT7vi/blog-vitamina-d-cJBkB8Puhn89YqZcbsyR2g.webp",
    tags: ["vitamina D", "bem-estar", "exames de sangue", "saúde óssea", "imunidade"],
    content: [
      "A vitamina D, também conhecida como a 'vitamina do sol', desempenha um papel crucial em diversas funções do organismo. Apesar de vivermos em um país tropical com abundância de luz solar, estima-se que cerca de 60% da população brasileira apresente níveis insuficientes ou deficientes dessa vitamina essencial. Esse paradoxo se explica por mudanças no estilo de vida moderno.",
      "A principal fonte de vitamina D é a síntese cutânea estimulada pela radiação ultravioleta B (UVB). Porém, o uso crescente de protetor solar (necessário para prevenir câncer de pele), o trabalho em ambientes fechados, o uso de roupas que cobrem grande parte do corpo e a redução das atividades ao ar livre fazem com que a exposição solar seja insuficiente para a maioria das pessoas.",
      "A deficiência de vitamina D vai muito além da saúde óssea. Níveis adequados são essenciais para o funcionamento do sistema imunológico, a saúde cardiovascular, a regulação do humor (níveis baixos estão associados à depressão), a prevenção de doenças autoimunes e até a proteção contra certos tipos de câncer. Estudos recentes também associam a deficiência de vitamina D a maior susceptibilidade a infecções respiratórias.",
      "Os valores de referência para a vitamina D sérica (25-hidroxivitamina D) são: abaixo de 20 ng/mL é considerado deficiente; entre 20 e 29 ng/mL, insuficiente; entre 30 e 60 ng/mL, adequado; e acima de 100 ng/mL, potencialmente tóxico. O ideal é manter os níveis entre 40 e 60 ng/mL para obter todos os benefícios dessa vitamina.",
      "Para manter níveis adequados, recomenda-se exposição solar de 15 a 20 minutos diários (braços e pernas, sem protetor solar, preferencialmente entre 10h e 15h), consumo de alimentos ricos em vitamina D (peixes gordurosos como salmão e sardinha, gema de ovo, fígado) e, quando necessário, suplementação orientada por um médico.",
      "Na Total Quality em Caraguatatuba, a dosagem de vitamina D é um dos exames mais solicitados. O resultado fica pronto em até 24 horas, permitindo que seu médico avalie rapidamente se há necessidade de suplementação. Inclua a dosagem de vitamina D no seu próximo check-up — sua saúde agradece."
    ],
  },
  {
    id: "6",
    slug: "exame-de-sangue-caraguatatuba",
    title: "Onde Fazer Exame de Sangue em Caraguatatuba — Guia Completo 2026",
    subtitle: "Tudo o que você precisa saber sobre exames de sangue no litoral norte paulista",
    excerpt: "Descubra onde fazer exame de sangue em Caraguatatuba - SP com qualidade, rapidez e preços acessíveis. Guia completo com tipos de exames, preparo, preços e como agendar.",
    category: "Exames Laboratoriais",
    author: "Equipe Total Quality",
    authorRole: "Revisão: Responsável Técnico Alex Waltersdorf — CRM 267.339",
    date: "23 Abr 2026",
    readTime: "12 min",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029159398/JL54VveRaBTccEphCgT7vi/blog-checkup-preventivo-H3wYYGRF5gsNjaJi3J89XG.webp",
    tags: ["exame de sangue", "laboratório Caraguatatuba", "hemograma", "análises clínicas", "Caraguatatuba"],
    content: [
      "Fazer exame de sangue em Caraguatatuba é mais simples do que você imagina. O litoral norte paulista conta com laboratórios de análises clínicas equipados com tecnologia de ponta, capazes de realizar desde os exames mais básicos até análises especializadas. Neste guia completo, vamos explicar tudo o que você precisa saber para realizar seus exames de sangue em Caraguatatuba com segurança, qualidade e praticidade.",
      "A Total Quality Medicina Diagnóstica é laboratório de análises clínicas em Caraguatatuba - SP, realizando mais de 3.000 tipos de exames laboratoriais. Localizada no centro da cidade, na R. Padre Anchieta, 1010, a clínica oferece coleta de sangue de segunda a sexta-feira, das 06h30 às 16h, e aos sábados das 06h30 às 11h. Os resultados ficam disponíveis online em até 24 horas para a maioria dos exames.",
      "Entre os exames de sangue mais solicitados em Caraguatatuba estão: hemograma completo (avalia células do sangue, detecta anemias e infecções), glicemia em jejum (rastreamento de diabetes), colesterol total e frações (HDL, LDL e VLDL), triglicerídeos, TSH e T4 livre (função da tireoide), PSA total e livre (rastreamento de câncer de próstata), vitamina D, hemoglobina glicada (controle do diabetes), ureia e creatinina (função renal), TGO e TGP (função hepática) e ácido úrico.",
      "O preparo para exames de sangue em Caraguatatuba varia conforme o tipo de exame. Para a maioria dos exames de rotina, recomenda-se jejum de 8 a 12 horas. A glicemia em jejum exige no mínimo 8 horas sem alimentação. O perfil lipídico (colesterol e triglicerídeos) requer 12 horas de jejum. Já o hemograma pode ser realizado sem jejum. É importante manter a hidratação com água durante o período de jejum e informar ao laboratório sobre medicamentos em uso.",
      "Além dos exames de sangue tradicionais, o laboratório em Caraguatatuba realiza exames especializados como dosagem de hormônios (estradiol, progesterona, testosterona, LH, FSH, prolactina), marcadores tumorais (CEA, CA 19-9, CA 125, AFP), sorologias (HIV, hepatites B e C, sífilis, toxoplasmose, rubela), coagulograma, exame de urina tipo I, urocultura, parasitológico de fezes e exame toxicológico.",
      "Para agendar seu exame de sangue em Caraguatatuba, basta entrar em contato pelo WhatsApp ou telefone (12) 3887-3535. O agendamento também pode ser feito pelo site totalquality.med.br. A Total Quality aceita diversos convênios de saúde e oferece atendimento particular com preços acessíveis. Não deixe de realizar seus exames de rotina — a prevenção é sempre o melhor caminho para a saúde.",
      "Dica importante: ao escolher um laboratório para fazer exame de sangue em Caraguatatuba, verifique se o estabelecimento possui equipamentos automatizados de última geração, profissionais qualificados para a coleta, sistema de resultados online e certificações de qualidade. A Total Quality atende a todos esses critérios, sendo referência em análises clínicas no litoral norte paulista há mais de 20 anos."
    ],
  },
  {
    id: "7",
    slug: "convenios-laboratorio-caraguatatuba",
    title: "Convênios Aceitos no Laboratório em Caraguatatuba",
    subtitle: "Confira a lista de convênios e planos de saúde aceitos na Total Quality",
    excerpt: "Saiba quais convênios e planos de saúde são aceitos no laboratório Total Quality em Caraguatatuba - SP. Unimed, Bradesco Saúde, SulAmérica e outros.",
    category: "Exames Laboratoriais",
    author: "Equipe Total Quality",
    authorRole: "Atendimento — Total Quality",
    date: "23 Abr 2026",
    readTime: "6 min",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029159398/JL54VveRaBTccEphCgT7vi/blog-colesterol-ZqFqJRDmAMnHzb5FNBCcFn.webp",
    tags: ["convênios", "planos de saúde", "laboratório Caraguatatuba", "Unimed", "Caraguatatuba"],
    content: [
      "Escolher um laboratório que aceita o seu convênio é fundamental para realizar exames com praticidade e economia. Em Caraguatatuba, a Total Quality Medicina Diagnóstica aceita diversos convênios e planos de saúde, facilitando o acesso a mais de 3.000 tipos de exames laboratoriais e de imagem. Neste artigo, apresentamos a lista completa de convênios aceitos e como utilizar seu plano de saúde no nosso laboratório.",
      "A Total Quality em Caraguatatuba trabalha com os principais convênios e operadoras de saúde do Brasil, incluindo Unimed, Bradesco Saúde, SulAmérica, Amil, Porto Seguro Saúde, NotreDame Intermédica, Hapvida, Cassi, Geap, Postal Saúde, Economus, Funasa e diversos outros planos regionais e nacionais. A lista de convênios é atualizada periodicamente, por isso recomendamos sempre confirmar a aceitação do seu plano antes de agendar.",
      "Para utilizar seu convênio no laboratório em Caraguatatuba, você precisa apresentar a carteirinha do plano de saúde atualizada, um documento de identidade com foto e o pedido médico original. Alguns convênios exigem autorização prévia para determinados exames, especialmente os de maior complexidade como tomografia, ressonância e exames genéticos. Nossa equipe de atendimento pode orientar sobre a necessidade de autorização para o seu caso específico.",
      "Além dos convênios, a Total Quality oferece atendimento particular com preços competitivos para quem não possui plano de saúde. Aceitamos pagamento em dinheiro, cartão de crédito, cartão de débito e PIX. Para pacientes particulares, oferecemos tabelas especiais para check-ups e pacotes de exames, tornando a medicina diagnóstica acessível a todos os moradores de Caraguatatuba e região.",
      "Uma dúvida frequente dos pacientes é sobre a cobertura de exames pelo convênio. De acordo com a ANS (Agência Nacional de Saúde Suplementar), os planos de saúde são obrigados a cobrir todos os exames listados no Rol de Procedimentos. Isso inclui a grande maioria dos exames laboratoriais de rotina, como hemograma, glicemia, colesterol, hormônios e marcadores tumorais, além de exames de imagem como tomografia, ultrassonografia e mamografia.",
      "Para agendar seus exames pelo convênio no laboratório em Caraguatatuba, entre em contato pelo WhatsApp ou telefone (12) 3887-3535. Nossa equipe verificará a cobertura do seu plano e agendará seus exames no melhor horário disponível. A Total Quality está localizada na R. Padre Anchieta, 1010, Centro, Caraguatatuba - SP, com fácil acesso e estacionamento próximo."
    ],
  },
  {
    id: "8",
    slug: "hemograma-caraguatatuba",
    title: "Hemograma em Caraguatatuba: Como Agendar, Preparo e Resultados",
    subtitle: "Tudo sobre o exame de sangue mais solicitado no laboratório",
    excerpt: "Saiba como agendar seu hemograma em Caraguatatuba, qual o preparo necessário, o que o exame avalia e como interpretar os resultados.",
    category: "Exames Laboratoriais",
    author: "Equipe Total Quality",
    authorRole: "Revisão: Responsável Técnico Alex Waltersdorf — CRM 267.339",
    date: "23 Abr 2026",
    readTime: "10 min",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029159398/JL54VveRaBTccEphCgT7vi/blog-checkup-preventivo-H3wYYGRF5gsNjaJi3J89XG.webp",
    tags: ["hemograma", "exame de sangue", "laboratório Caraguatatuba", "análises clínicas", "Caraguatatuba"],
    content: [
      "O hemograma é o exame de sangue mais solicitado em laboratórios de análises clínicas em todo o Brasil, e em Caraguatatuba não é diferente. Esse exame fundamental avalia as células do sangue — glóbulos vermelhos (hemácias), glóbulos brancos (leucócitos) e plaquetas — fornecendo informações essenciais sobre o estado geral de saúde do paciente. Na Total Quality em Caraguatatuba, o hemograma é realizado com equipamentos automatizados de última geração e rigoroso controle de qualidade.",
      "O hemograma completo é composto por três partes principais: o eritrograma (avaliação dos glóbulos vermelhos), o leucograma (avaliação dos glóbulos brancos) e a contagem de plaquetas. O eritrograma mede a quantidade de hemácias, hemoglobina, hematócrito e índices hematimétricos (VCM, HCM e CHCM), sendo fundamental para diagnosticar anemias. O leucograma analisa os diferentes tipos de leucócitos (neutrófilos, linfócitos, monócitos, eosinófilos e basófilos), identificando infecções, inflamações e alterações imunológicas.",
      "Para fazer hemograma em Caraguatatuba, o preparo é simples: não é necessário jejum para o hemograma isolado. Porém, como o hemograma geralmente é solicitado junto com outros exames que exigem jejum (como glicemia e colesterol), recomenda-se seguir o jejum de 8 a 12 horas quando houver múltiplos exames. É importante informar ao laboratório sobre medicamentos em uso, pois alguns podem alterar os resultados, como anti-inflamatórios, antibióticos e corticoides.",
      "Os valores de referência do hemograma variam conforme sexo e idade. Para adultos, os valores normais de hemoglobina são de 13,5 a 17,5 g/dL para homens e 12,0 a 16,0 g/dL para mulheres. A contagem de leucócitos normal fica entre 4.000 e 11.000/mm³. Plaquetas normais variam de 150.000 a 400.000/mm³. Alterações nesses valores podem indicar diversas condições, desde anemias simples até doenças mais complexas que necessitam investigação adicional.",
      "O hemograma é indicado em diversas situações: check-up de rotina, investigação de fadiga e cansaço, acompanhamento de tratamentos, pré-operatório, investigação de infecções, monitoramento de doenças crônicas e avaliação pré-natal. Na Total Quality, o resultado do hemograma fica pronto em poucas horas, permitindo que seu médico avalie rapidamente sua condição de saúde.",
      "Para agendar seu hemograma em Caraguatatuba, entre em contato com a Total Quality pelo WhatsApp ou telefone (12) 3887-3535. A coleta é rápida, realizada por profissionais experientes, e os resultados ficam disponíveis online. Estamos na R. Padre Anchieta, 1010, Centro, Caraguatatuba - SP, com atendimento de segunda a sexta das 06h30 às 16h e sábados das 06h30 às 11h."
    ],
  },
  {
    id: "9",
    slug: "ultrassonografia-caraguatatuba",
    title: "Ultrassonografia em Caraguatatuba — Agende Sem Fila",
    subtitle: "Exame de imagem seguro, indolor e sem radiação no litoral norte",
    excerpt: "Saiba tudo sobre ultrassonografia em Caraguatatuba: tipos de exame, preparo, como agendar e onde realizar com equipamentos de última geração.",
    category: "Medicina Preventiva",
    author: "Equipe Total Quality",
    authorRole: "Revisão: Responsável Técnico Alex Waltersdorf — CRM 267.339",
    date: "23 Abr 2026",
    readTime: "8 min",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029159398/JL54VveRaBTccEphCgT7vi/blog-colesterol-ZqFqJRDmAMnHzb5FNBCcFn.webp",
    tags: ["ultrassonografia", "ultrassom", "diagnóstico por imagem", "Caraguatatuba", "exame de imagem"],
    content: [
      "A ultrassonografia é um dos exames de imagem mais versáteis e seguros da medicina moderna. Utilizando ondas sonoras de alta frequência, o exame produz imagens em tempo real dos órgãos internos sem utilizar radiação ionizante, tornando-o seguro para gestantes, crianças e adultos. Em Caraguatatuba, a Total Quality oferece ultrassonografia com equipamentos de última geração e médicos especialistas em diagnóstico por imagem.",
      "Os tipos de ultrassonografia disponíveis no laboratório em Caraguatatuba incluem: ultrassonografia abdominal total (avalia fígado, vesícula biliar, pâncreas, baço e rins), ultrassonografia pélvica (avalia útero, ovários e bexiga), ultrassonografia obstétrica (acompanhamento da gestação), ultrassonografia de tireoide, ultrassonografia de mamas, ultrassonografia de próstata, ultrassonografia Doppler vascular (avalia fluxo sanguíneo em artérias e veias) e ultrassonografia musculoesquelética.",
      "O preparo para ultrassonografia em Caraguatatuba varia conforme o tipo de exame. Para a ultrassonografia abdominal, é necessário jejum de 6 a 8 horas e evitar alimentos que produzem gases nas 24 horas anteriores (feijão, refrigerante, leite). Para a ultrassonografia pélvica e obstétrica, é necessário bexiga cheia — beba de 4 a 6 copos de água uma hora antes do exame. Para ultrassonografia de tireoide e mamas, não há preparo especial.",
      "A ultrassonografia Doppler merece destaque especial. Esse exame avalia o fluxo sanguíneo em artérias e veias, sendo fundamental para o diagnóstico de varizes, trombose venosa profunda, estenose carotídea e outras doenças vasculares. Na Total Quality em Caraguatatuba, o Doppler é realizado por médicos especialistas com ampla experiência em diagnóstico vascular.",
      "O exame de ultrassonografia é rápido, durando em média 20 a 30 minutos, e completamente indolor. O paciente fica deitado em uma maca enquanto o médico aplica um gel condutor sobre a pele e desliza o transdutor pela região a ser examinada. As imagens são visualizadas em tempo real no monitor, permitindo uma avaliação detalhada dos órgãos e estruturas.",
      "Para agendar sua ultrassonografia em Caraguatatuba sem fila, entre em contato com a Total Quality pelo WhatsApp ou telefone (12) 3887-3535. Oferecemos horários flexíveis e atendimento rápido, com laudos entregues em até 48 horas. Estamos na R. Padre Anchieta, 1010, Centro, Caraguatatuba - SP."
    ],
  },
  {
    id: "10",
    slug: "tomografia-caraguatatuba",
    title: "Tomografia em Caraguatatuba — Quando Fazer e Como Se Preparar",
    subtitle: "Guia completo sobre tomografia computadorizada no litoral norte paulista",
    excerpt: "Saiba quando a tomografia é indicada, como se preparar para o exame e onde realizar em Caraguatatuba com equipamento multislice de última geração.",
    category: "Medicina Preventiva",
    author: "Equipe Total Quality",
    authorRole: "Revisão: Responsável Técnico Alex Waltersdorf — CRM 267.339",
    date: "23 Abr 2026",
    readTime: "8 min",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029159398/JL54VveRaBTccEphCgT7vi/blog-vitamina-d-cJBkB8Puhn89YqZcbsyR2g.webp",
    tags: ["tomografia", "tomografia computadorizada", "diagnóstico por imagem", "Caraguatatuba", "exame de imagem"],
    content: [
      "A tomografia computadorizada (TC) é um dos exames de diagnóstico por imagem mais importantes da medicina moderna. Utilizando raios-X e processamento computadorizado avançado, a tomografia produz imagens detalhadas em cortes transversais do corpo, permitindo visualizar ossos, órgãos internos, vasos sanguíneos e tecidos moles com grande precisão. Em Caraguatatuba, a Total Quality conta com tomógrafo multislice de última geração, que produz imagens de alta resolução em poucos minutos.",
      "A tomografia em Caraguatatuba é indicada em diversas situações clínicas: investigação de dores de cabeça persistentes, avaliação de traumas e fraturas, diagnóstico de doenças pulmonares (incluindo pneumonia, embolia pulmonar e nódulos), investigação de dores abdominais, avaliação de coluna vertebral, estadiamento de tumores e planejamento cirúrgico. O médico solicitante indicará a tomografia quando exames mais simples não forem suficientes para o diagnóstico.",
      "O preparo para tomografia em Caraguatatuba depende da região a ser examinada e da necessidade de contraste. Para exames com contraste, é necessário jejum de 4 horas. É fundamental informar ao médico sobre alergias, especialmente a iodo ou contraste iodado, e sobre medicamentos em uso. Pacientes com problemas renais devem informar ao laboratório, pois o contraste é eliminado pelos rins. Gestantes devem evitar a tomografia, exceto em casos de emergência.",
      "O exame de tomografia é rápido e indolor. O paciente deita em uma mesa que desliza para dentro do aparelho em formato de anel. O tubo de raios-X gira ao redor do corpo, capturando múltiplas imagens que são processadas por computador para criar imagens tridimensionais detalhadas. O exame dura entre 10 e 30 minutos, dependendo da região examinada e da necessidade de contraste. Se for utilizado contraste, o paciente pode sentir um leve aquecimento e gosto metálico na boca, que desaparecem rapidamente.",
      "A tomografia multislice disponível na Total Quality em Caraguatatuba oferece vantagens significativas em relação aos tomógrafos convencionais: maior velocidade de aquisição (reduzindo o tempo de exame), melhor resolução espacial (imagens mais detalhadas), menor dose de radiação e capacidade de reconstruir imagens em múltiplos planos e em 3D. Isso permite diagnósticos mais precisos e rápidos.",
      "Para agendar sua tomografia em Caraguatatuba, entre em contato com a Total Quality pelo WhatsApp ou telefone (12) 3887-3535. Oferecemos agendamento rápido, com laudos elaborados por médicos radiologistas experientes. Estamos na R. Padre Anchieta, 1010, Centro, Caraguatatuba - SP, com atendimento de segunda a sexta das 08h às 18h. Traga seus exames anteriores para comparação e informe sobre alergias e medicamentos em uso."
    ],
  },
];

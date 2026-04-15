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
    author: "Dr. Alexandre Ribeiro",
    authorRole: "Diretor Clínico — Total Quality",
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
    author: "Dra. Mariana Costa",
    authorRole: "Patologista Clínica — Total Quality",
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
      "Na Total Quality em Caraguatatuba, oferecemos coleta de sangue com horário agendado, ambiente confortável e resultados disponíveis em até 24 horas para a maioria dos exames. Nossa equipe de biomédicos e patologistas garante a precisão e confiabilidade de cada resultado. Consulte seu médico regularmente e mantenha seus exames em dia."
    ],
  },
  {
    id: "3",
    slug: "saude-do-coracao-prevencao",
    title: "Saúde do Coração: 7 Hábitos Que Podem Salvar Sua Vida",
    subtitle: "Doenças cardiovasculares são a principal causa de morte no Brasil — saiba como se proteger",
    excerpt: "As doenças cardiovasculares são responsáveis por mais de 400 mil mortes por ano no Brasil. Conheça os 7 hábitos comprovados pela ciência que protegem seu coração.",
    category: "Saúde do Coração",
    author: "Dr. Carlos Mendes",
    authorRole: "Cardiologista — Total Quality",
    date: "28 Mar 2026",
    readTime: "7 min",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029159398/JL54VveRaBTccEphCgT7vi/blog-saude-coracao-PmoS9mrNUzxRHbNwgJahDt.webp",
    tags: ["cardiologia", "saúde do coração", "prevenção", "ecocardiograma", "eletrocardiograma"],
    content: [
      "As doenças cardiovasculares continuam sendo a principal causa de morte no Brasil e no mundo. Segundo dados da Sociedade Brasileira de Cardiologia, mais de 400 mil brasileiros morrem por ano em decorrência de problemas cardíacos — um número que poderia ser significativamente reduzido com prevenção adequada e exames regulares.",
      "O primeiro hábito essencial é a prática regular de exercícios físicos. A Organização Mundial da Saúde recomenda pelo menos 150 minutos de atividade moderada por semana — o equivalente a 30 minutos, cinco vezes por semana. Caminhada, natação, ciclismo e dança são excelentes opções. O exercício fortalece o músculo cardíaco, melhora a circulação e ajuda a controlar pressão arterial, colesterol e glicemia.",
      "O segundo hábito é manter uma alimentação equilibrada, rica em frutas, verduras, legumes, grãos integrais e gorduras saudáveis (como azeite de oliva e peixes ricos em ômega-3). Reduzir o consumo de sal, açúcar refinado, gorduras trans e alimentos ultraprocessados é fundamental para a saúde cardiovascular.",
      "O terceiro hábito é controlar o estresse. O estresse crônico eleva os níveis de cortisol e adrenalina, aumentando a pressão arterial e a frequência cardíaca. Técnicas como meditação, yoga, respiração profunda e momentos de lazer são aliados importantes. O quarto hábito é não fumar — o tabagismo é um dos maiores fatores de risco para infarto e AVC.",
      "O quinto hábito é manter o peso adequado. A obesidade sobrecarrega o coração e está associada a hipertensão, diabetes e dislipidemia. O sexto hábito é dormir bem — adultos devem dormir entre 7 e 9 horas por noite. A privação de sono aumenta o risco de hipertensão e arritmias cardíacas.",
      "O sétimo e talvez mais importante hábito é realizar exames cardiológicos regulares. Na Total Quality, oferecemos eletrocardiograma, ecocardiograma, teste ergométrico, MAPA (Monitorização Ambulatorial da Pressão Arterial) e Holter 24h. Esses exames permitem avaliar a estrutura e o funcionamento do coração, detectando alterações antes que se tornem emergências. Cuide do seu coração — agende sua avaliação cardiológica."
    ],
  },
  {
    id: "4",
    slug: "alimentacao-e-exames-laboratoriais",
    title: "Como a Alimentação Influencia Seus Exames Laboratoriais",
    subtitle: "Entenda a relação entre dieta, jejum e a precisão dos resultados dos seus exames",
    excerpt: "Sua alimentação pode alterar significativamente os resultados dos exames de sangue. Saiba como se preparar corretamente e quais alimentos podem interferir nos seus resultados.",
    category: "Nutrição",
    author: "Dra. Fernanda Lima",
    authorRole: "Nutróloga — Total Quality",
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
      "Na Total Quality, nossa equipe de atendimento orienta cada paciente sobre o preparo adequado para cada tipo de exame. Oferecemos um guia de preparo personalizado no momento do agendamento, garantindo que seus resultados sejam os mais precisos possíveis. Em caso de dúvidas, entre em contato pelo WhatsApp (12) 3887-3535."
    ],
  },
  {
    id: "5",
    slug: "vitamina-d-importancia-saude",
    title: "Vitamina D: Por Que Você Provavelmente Está Com Deficiência",
    subtitle: "Mesmo no Brasil tropical, a deficiência de vitamina D atinge milhões de pessoas",
    excerpt: "Estima-se que 60% dos brasileiros tenham níveis insuficientes de vitamina D. Entenda por que isso acontece, os riscos para a saúde e como manter seus níveis adequados.",
    category: "Bem-Estar",
    author: "Dr. Alexandre Ribeiro",
    authorRole: "Diretor Clínico — Total Quality",
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
];

import {
  Droplets, Heart, Scan, Radio, Activity, Timer, Wind, Zap, Brain, FlaskConical,
  Shield, Clock, CheckCircle, Stethoscope, Target, TrendingUp, Users, BarChart3,
  FileText, AlertTriangle, Thermometer, Eye, Bone, Scale
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ExamFAQ {
  q: string;
  a: string;
}

export interface ExamPrep {
  icon: LucideIcon;
  text: string;
}

export interface ExamData {
  slug: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  heroDescription: string;
  whatIs: string;
  howItWorks: string;
  indications: string[];
  preparations: ExamPrep[];
  faqs: ExamFAQ[];
  whatsappMessage: string;
  heroImage?: string;
  videoUrl?: string;
  backgroundImage?: string;
  category: "laboratorio" | "imagem" | "cardiologia" | "neurologia" | "outros";
  keywords: string[];
}

export const examesData: ExamData[] = [
  {
    slug: "exames-de-sangue",
    title: "EXAMES DE SANGUE",
    shortTitle: "Exames de Sangue",
    subtitle: "Laboratório de Análises Clínicas",
    description: "Mais de 3.000 tipos de exames laboratoriais com tecnologia de última geração.",
    metaTitle: "Exames de Sangue em Caraguatatuba - SP | Total Quality Medicina Diagnóstica",
    metaDescription: "Realize exames de sangue em Caraguatatuba - SP: hemograma, glicemia, colesterol, hormônios, vitamina D, PSA, TSH, T4 livre, ácido úrico e mais de 3.000 tipos. Resultados rápidos.",
    heroDescription: "Realizamos mais de 3.000 tipos de exames de sangue e análises clínicas com equipamentos de última geração e equipe especializada. Hemograma, glicemia, colesterol, hormônios, marcadores tumorais, sorologias e muito mais.",
    backgroundImage: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029159398/JL54VveRaBTccEphCgT7vi/researcher-working-laboratory_292dac6f.webp",
    whatIs: "Os exames de sangue são análises laboratoriais realizadas a partir de uma amostra de sangue coletada por punção venosa. São fundamentais para avaliar o funcionamento dos órgãos, detectar doenças, monitorar tratamentos e realizar check-ups preventivos. Na Total Quality, utilizamos equipamentos automatizados de alta precisão para garantir resultados confiáveis.",
    howItWorks: "A coleta é realizada por profissionais treinados em ambiente confortável e seguro. O sangue é processado em nosso laboratório com equipamentos automatizados que garantem precisão e rapidez. Os resultados ficam disponíveis online em até 24 horas para a maioria dos exames.",
    indications: [
      "Check-up preventivo anual",
      "Acompanhamento de doenças crônicas (diabetes, colesterol alto, tireoide)",
      "Investigação de sintomas como fadiga, tontura, perda de peso",
      "Monitoramento de tratamentos medicamentosos",
      "Avaliação pré-operatória",
      "Controle de gravidez (pré-natal)",
      "Detecção de infecções e doenças autoimunes",
    ],
    preparations: [
      { icon: Clock, text: "Jejum de 8 a 12 horas para exames de glicemia e perfil lipídico" },
      { icon: Droplets, text: "Beba água normalmente durante o período de jejum" },
      { icon: AlertTriangle, text: "Informe os medicamentos em uso ao laboratório" },
      { icon: FileText, text: "Traga o pedido médico e documento com foto" },
    ],
    faqs: [
      { q: "Preciso estar em jejum para todos os exames de sangue?", a: "Não. Apenas alguns exames como glicemia de jejum e perfil lipídico exigem jejum de 8 a 12 horas. Muitos exames como hemograma, hormônios e sorologias não necessitam de jejum." },
      { q: "Quanto tempo demora para sair o resultado?", a: "A maioria dos exames fica pronta em 24 horas. Alguns exames específicos podem levar até 7 dias úteis. Os resultados ficam disponíveis online." },
      { q: "Posso tomar água durante o jejum?", a: "Sim! A ingestão de água é permitida e até recomendada durante o período de jejum. Evite apenas sucos, café e outras bebidas." },
      { q: "Quais exames de sangue vocês realizam?", a: "Realizamos mais de 3.000 tipos, incluindo hemograma, glicemia, colesterol, triglicerídeos, TSH, T4 livre, PSA, vitamina D, ácido úrico, ureia, creatinina, TGO, TGP, hormônios, marcadores tumorais e muito mais." },
    ],
    whatsappMessage: "Olá! Gostaria de agendar exames de sangue.",
    category: "laboratorio",
    keywords: ["exames de sangue", "hemograma", "glicemia", "colesterol", "hormônios", "vitamina D", "PSA", "laboratório", "análises clínicas", "Caraguatatuba"],
  },
  {
    slug: "tomografia-computadorizada",
    title: "TOMOGRAFIA COMPUTADORIZADA",
    shortTitle: "Tomografia",
    subtitle: "Diagnóstico por Imagem",
    description: "Imagens detalhadas do corpo com tecnologia de tomografia multislice.",
    metaTitle: "Tomografia Computadorizada em Caraguatatuba - SP | Total Quality",
    metaDescription: "Tomografia computadorizada em Caraguatatuba - SP com equipamento multislice de última geração. Tomografia de crânio, tórax, abdômen, coluna e articulações. Resultados rápidos.",
    heroDescription: "A tomografia computadorizada é um dos exames de imagem mais completos e precisos da medicina moderna. Na Total Quality, contamos com equipamento multislice que produz imagens de alta resolução em poucos minutos.",
    backgroundImage: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029159398/JL54VveRaBTccEphCgT7vi/background-imagem-9mCCH6jfPEzq5u2ufWFQtc.webp",
    whatIs: "A Tomografia Computadorizada (TC) é um exame de diagnóstico por imagem que utiliza raios-X e processamento computadorizado para produzir imagens detalhadas em cortes transversais do corpo. Permite visualizar ossos, órgãos internos, vasos sanguíneos e tecidos moles com grande precisão.",
    howItWorks: "O paciente deita em uma mesa que desliza para dentro do aparelho em formato de anel. O tubo de raios-X gira ao redor do corpo, capturando múltiplas imagens que são processadas por computador para criar imagens tridimensionais detalhadas. O exame dura entre 10 e 30 minutos.",
    indications: [
      "Investigação de dores de cabeça persistentes",
      "Avaliação de traumas e fraturas",
      "Diagnóstico de doenças pulmonares",
      "Investigação de dores abdominais",
      "Avaliação de coluna vertebral",
      "Estadiamento de tumores",
      "Planejamento cirúrgico",
    ],
    preparations: [
      { icon: Clock, text: "Jejum de 4 horas para exames com contraste" },
      { icon: AlertTriangle, text: "Informe alergias, especialmente a iodo ou contraste" },
      { icon: FileText, text: "Traga exames anteriores para comparação" },
      { icon: Shield, text: "Informe se está grávida ou com suspeita de gravidez" },
    ],
    faqs: [
      { q: "A tomografia dói?", a: "Não. O exame é completamente indolor. Você ficará deitado na mesa enquanto o aparelho captura as imagens. Pode sentir um leve aquecimento se for usado contraste." },
      { q: "Quanto tempo dura o exame?", a: "O exame em si dura entre 10 e 30 minutos, dependendo da região examinada e da necessidade de contraste." },
      { q: "Preciso de contraste?", a: "Depende da indicação médica. O contraste é usado para melhorar a visualização de vasos sanguíneos e certos órgãos. Seu médico indicará se é necessário." },
      { q: "Posso fazer tomografia com prótese metálica?", a: "Sim. Diferente da ressonância magnética, a tomografia pode ser realizada em pacientes com próteses metálicas, marcapassos e implantes." },
    ],
    whatsappMessage: "Olá! Gostaria de agendar uma tomografia computadorizada.",
    heroImage: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029159398/JL54VveRaBTccEphCgT7vi/tomografia-computadorizada_c4982f52.png",
    videoUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029159398/JL54VveRaBTccEphCgT7vi/tomografia_5e4bcd8d.mp4",
    category: "imagem",
    keywords: ["tomografia computadorizada", "TC", "tomografia de crânio", "tomografia de tórax", "diagnóstico por imagem", "Caraguatatuba"],
  },
  {
    slug: "raio-x",
    title: "RAIO-X",
    shortTitle: "Raio-X",
    subtitle: "Diagnóstico por Imagem",
    description: "Radiografia digital com alta resolução para diagnóstico rápido e preciso.",
    metaTitle: "Raio-X Digital em Caraguatatuba - SP | Total Quality Medicina Diagnóstica",
    metaDescription: "Raio-X digital em Caraguatatuba - SP: tórax, coluna, membros, seios da face e articulações. Equipamento digital de alta resolução com resultados rápidos na Total Quality.",
    heroDescription: "O Raio-X é um dos exames de imagem mais utilizados na medicina, essencial para diagnóstico de fraturas, doenças pulmonares e diversas condições. Na Total Quality, utilizamos equipamento digital de última geração para imagens de alta resolução.",
    backgroundImage: "https://d2xsxph8kpxj0f.cloudfront.net/310419663029159398/JL54VveRaBTccEphCgT7vi/background-imagem-9mCCH6jfPEzq5u2ufWFQtc.webp",
    whatIs: "O Raio-X (radiografia) é um exame de diagnóstico por imagem que utiliza radiação ionizante em doses baixas para produzir imagens do interior do corpo. É especialmente eficaz para visualizar ossos, pulmões e certas condições dos tecidos moles. A tecnologia digital permite imagens de alta qualidade com menor exposição à radiação.",
    howItWorks: "O paciente é posicionado entre o emissor de raios-X e o detector digital. A radiação atravessa o corpo e é captada pelo detector, gerando uma imagem digital instantânea. O exame é rápido, durando apenas alguns segundos por incidência.",
    indications: [
      "Suspeita de fraturas e lesões ósseas",
      "Avaliação de doenças pulmonares (pneumonia, derrame pleural)",
      "Dores na coluna vertebral",
      "Sinusite e problemas nos seios da face",
      "Avaliação pré-operatória (Raio-X de tórax)",
      "Acompanhamento ortopédico",
      "Investigação de dores articulares",
    ],
    preparations: [
      { icon: CheckCircle, text: "Geralmente não necessita preparo especial" },
      { icon: Shield, text: "Informe se está grávida ou com suspeita de gravidez" },
      { icon: FileText, text: "Traga o pedido médico e documento com foto" },
      { icon: AlertTriangle, text: "Remova objetos metálicos da região a ser examinada" },
    ],
    faqs: [
      { q: "O Raio-X é perigoso?", a: "Não. A dose de radiação utilizada no Raio-X digital é muito baixa e segura. Nosso equipamento digital utiliza doses ainda menores que os aparelhos convencionais." },
      { q: "Preciso de algum preparo?", a: "Na maioria dos casos, não é necessário preparo especial. Apenas remova objetos metálicos (joias, piercings) da região a ser examinada." },
      { q: "Quanto tempo demora?", a: "O exame é muito rápido, levando apenas alguns minutos. Cada incidência leva poucos segundos." },
      { q: "Gestantes podem fazer Raio-X?", a: "Raio-X em gestantes deve ser evitado, especialmente no primeiro trimestre. Em casos de urgência, pode ser realizado com proteção abdominal adequada, sempre sob orientação médica." },
    ],
    whatsappMessage: "Olá! Gostaria de agendar um exame de Raio-X.",
    category: "imagem",
    keywords: ["raio-x", "radiografia", "raio-x digital", "raio-x de tórax", "raio-x de coluna", "diagnóstico por imagem", "Caraguatatuba"],
  },
  {
    slug: "ultrassonografia",
    title: "ULTRASSONOGRAFIA",
    shortTitle: "Ultrassonografia",
    subtitle: "Diagnóstico por Imagem",
    description: "Exame de imagem por ultrassom para avaliação de órgãos e tecidos.",
    metaTitle: "Ultrassonografia em Caraguatatuba - SP | Total Quality Medicina Diagnóstica",
    metaDescription: "Ultrassonografia em Caraguatatuba - SP: abdominal, pélvica, obstétrica, tireoide, mama, próstata e vascular. Equipamento de alta resolução na Total Quality.",
    heroDescription: "A ultrassonografia é um exame seguro e indolor que utiliza ondas sonoras para produzir imagens em tempo real dos órgãos internos. Na Total Quality, contamos com equipamentos de última geração para diagnósticos precisos.",
    whatIs: "A Ultrassonografia (ecografia) é um exame de diagnóstico por imagem que utiliza ondas sonoras de alta frequência para criar imagens dos órgãos e estruturas internas do corpo. É um método seguro, indolor, não invasivo e que não utiliza radiação ionizante, sendo seguro inclusive para gestantes.",
    howItWorks: "Um transdutor (sonda) é colocado sobre a pele com gel condutor. O transdutor emite ondas sonoras que penetram no corpo e retornam ao encontrar diferentes tecidos, criando imagens em tempo real no monitor. O médico analisa as imagens durante o exame.",
    indications: [
      "Avaliação de órgãos abdominais (fígado, vesícula, rins, pâncreas)",
      "Acompanhamento de gravidez (ultrassom obstétrico)",
      "Avaliação de tireoide e nódulos",
      "Investigação de dores pélvicas",
      "Avaliação de mama",
      "Ultrassom de próstata",
      "Avaliação vascular (Doppler)",
    ],
    preparations: [
      { icon: Droplets, text: "Ultrassom pélvico: bexiga cheia (beber 4 copos de água 1h antes)" },
      { icon: Clock, text: "Ultrassom abdominal: jejum de 6 a 8 horas" },
      { icon: CheckCircle, text: "Ultrassom de tireoide e mama: sem preparo especial" },
      { icon: FileText, text: "Traga exames anteriores para comparação" },
    ],
    faqs: [
      { q: "A ultrassonografia dói?", a: "Não. O exame é completamente indolor. Você sentirá apenas a pressão leve do transdutor sobre a pele com gel." },
      { q: "É seguro para gestantes?", a: "Sim! A ultrassonografia não utiliza radiação e é o principal exame para acompanhamento da gravidez, sendo totalmente seguro para mãe e bebê." },
      { q: "Preciso de preparo?", a: "Depende do tipo de ultrassom. Abdominal requer jejum de 6-8h. Pélvico requer bexiga cheia. Tireoide e mama não necessitam preparo." },
      { q: "Quanto tempo dura o exame?", a: "Em média, 20 a 30 minutos, dependendo da região examinada e da complexidade do caso." },
    ],
    whatsappMessage: "Olá! Gostaria de agendar uma ultrassonografia.",
    category: "imagem",
    keywords: ["ultrassonografia", "ecografia", "ultrassom", "ultrassom abdominal", "ultrassom obstétrico", "diagnóstico por imagem", "Caraguatatuba"],
  },
  {
    slug: "mapa",
    title: "MAPA",
    shortTitle: "MAPA",
    subtitle: "Monitorização Ambulatorial da Pressão Arterial",
    description: "Monitoramento contínuo da pressão arterial por 24 horas.",
    metaTitle: "MAPA - Monitorização da Pressão Arterial 24h em Caraguatatuba - SP | Total Quality",
    metaDescription: "MAPA (Monitorização Ambulatorial da Pressão Arterial) em Caraguatatuba - SP. Monitoramento contínuo por 24 horas para diagnóstico preciso de hipertensão na Total Quality.",
    heroDescription: "O MAPA é um exame que monitora a pressão arterial continuamente durante 24 horas, registrando medições automáticas durante as atividades do dia a dia e durante o sono. É o exame mais preciso para diagnóstico e acompanhamento da hipertensão arterial.",
    whatIs: "O MAPA (Monitorização Ambulatorial da Pressão Arterial) é um exame que registra a pressão arterial automaticamente a cada 15-20 minutos durante o dia e a cada 30 minutos durante a noite, ao longo de 24 horas. Permite avaliar o comportamento da pressão arterial em condições reais do cotidiano do paciente.",
    howItWorks: "Um aparelho portátil com manguito é instalado no braço do paciente. O equipamento realiza medições automáticas programadas ao longo de 24 horas. O paciente mantém suas atividades normais e registra em um diário os horários de sono, refeições e atividades. Após 24 horas, o aparelho é retirado e os dados são analisados por software especializado.",
    indications: [
      "Diagnóstico de hipertensão arterial",
      "Hipertensão do jaleco branco (pressão alta só no consultório)",
      "Hipertensão mascarada (pressão normal no consultório, alta fora)",
      "Avaliação da eficácia de medicamentos anti-hipertensivos",
      "Hipertensão resistente ao tratamento",
      "Avaliação da pressão durante o sono",
      "Acompanhamento de gestantes com pré-eclâmpsia",
    ],
    preparations: [
      { icon: CheckCircle, text: "Use roupas confortáveis com manga larga" },
      { icon: AlertTriangle, text: "Mantenha o braço relaxado durante as medições" },
      { icon: FileText, text: "Preencha o diário de atividades fornecido" },
      { icon: Clock, text: "Retorne após 24 horas para retirar o aparelho" },
    ],
    faqs: [
      { q: "Posso dormir com o aparelho?", a: "Sim. O aparelho é projetado para ser usado durante o sono. As medições noturnas são muito importantes para a avaliação. O manguito infla automaticamente, o que pode causar leve desconforto, mas a maioria dos pacientes se adapta." },
      { q: "Posso tomar banho com o aparelho?", a: "Não. O aparelho não pode ser molhado. Evite banho de chuveiro durante as 24 horas. Você pode fazer higiene parcial sem molhar o equipamento." },
      { q: "Preciso manter minhas atividades normais?", a: "Sim! O objetivo é avaliar a pressão durante suas atividades habituais. Mantenha sua rotina normal, incluindo trabalho e atividades do dia a dia." },
      { q: "O que é o diário de atividades?", a: "É um formulário onde você anota horários de sono, refeições, medicamentos, atividades físicas e sintomas. Essas informações ajudam o médico a correlacionar as medições com suas atividades." },
    ],
    whatsappMessage: "Olá! Gostaria de agendar um exame MAPA (Monitorização da Pressão Arterial 24h).",
    category: "cardiologia",
    keywords: ["MAPA", "monitorização ambulatorial da pressão arterial", "pressão arterial 24h", "hipertensão", "cardiologia", "Caraguatatuba"],
  },
  {
    slug: "holter",
    title: "HOLTER",
    shortTitle: "Holter",
    subtitle: "Monitorização Cardíaca 24 Horas",
    description: "Monitoramento contínuo do ritmo cardíaco por 24 horas.",
    metaTitle: "Holter 24h - Monitorização Cardíaca em Caraguatatuba - SP | Total Quality",
    metaDescription: "Holter 24 horas em Caraguatatuba - SP. Monitoramento contínuo do eletrocardiograma para diagnóstico de arritmias e doenças cardíacas na Total Quality.",
    heroDescription: "O Holter é um exame que registra continuamente a atividade elétrica do coração durante 24 horas, permitindo detectar arritmias e alterações que podem não aparecer em um eletrocardiograma convencional.",
    whatIs: "O Holter é um exame de monitorização eletrocardiográfica contínua por 24 horas. Um pequeno gravador portátil registra todos os batimentos cardíacos durante as atividades diárias e o sono, permitindo identificar arritmias, isquemias e outras alterações do ritmo cardíaco que podem ser intermitentes.",
    howItWorks: "Eletrodos adesivos são colocados no tórax do paciente e conectados a um pequeno gravador digital portátil. O aparelho registra continuamente o eletrocardiograma durante 24 horas. O paciente mantém suas atividades normais e registra sintomas em um diário. Após 24 horas, o aparelho é retirado e os dados são analisados.",
    indications: [
      "Palpitações ou sensação de batimentos irregulares",
      "Tonturas e desmaios (síncope)",
      "Dor no peito de origem a esclarecer",
      "Avaliação de arritmias cardíacas",
      "Controle de marcapasso",
      "Avaliação pós-infarto",
      "Monitoramento de medicamentos antiarrítmicos",
    ],
    preparations: [
      { icon: CheckCircle, text: "Use roupas confortáveis e folgadas" },
      { icon: Droplets, text: "Tome banho antes da instalação (não poderá durante o exame)" },
      { icon: FileText, text: "Preencha o diário de sintomas fornecido" },
      { icon: AlertTriangle, text: "Evite proximidade com ímãs e detectores de metal" },
    ],
    faqs: [
      { q: "Posso fazer exercícios com o Holter?", a: "Sim, mantenha suas atividades normais, incluindo exercícios leves. Evite apenas atividades que possam molhar ou deslocar os eletrodos." },
      { q: "O Holter é desconfortável?", a: "Os eletrodos podem causar leve coceira na pele, mas o aparelho é pequeno e leve, não interferindo significativamente nas atividades diárias." },
      { q: "Posso tomar banho?", a: "Não durante o exame. Tome banho antes da instalação. O aparelho e os eletrodos não podem ser molhados." },
      { q: "O que devo anotar no diário?", a: "Registre horários de sono, atividades físicas, refeições, medicamentos e principalmente qualquer sintoma como palpitação, tontura, dor no peito ou falta de ar." },
    ],
    whatsappMessage: "Olá! Gostaria de agendar um exame Holter 24h.",
    category: "cardiologia",
    keywords: ["holter", "holter 24h", "monitorização cardíaca", "arritmia", "eletrocardiograma contínuo", "cardiologia", "Caraguatatuba"],
  },
  {
    slug: "espirometria",
    title: "ESPIROMETRIA",
    shortTitle: "Espirometria",
    subtitle: "Prova de Função Pulmonar",
    description: "Avaliação completa da capacidade respiratória e função pulmonar.",
    metaTitle: "Espirometria - Prova de Função Pulmonar em Caraguatatuba - SP | Total Quality",
    metaDescription: "Espirometria (prova de função pulmonar) em Caraguatatuba - SP. Avaliação da capacidade respiratória para diagnóstico de asma, DPOC e doenças pulmonares na Total Quality.",
    heroDescription: "A espirometria é o exame padrão-ouro para avaliação da função pulmonar. Mede volumes e fluxos de ar nos pulmões, sendo essencial para diagnóstico e acompanhamento de doenças respiratórias como asma e DPOC.",
    whatIs: "A Espirometria (prova de função pulmonar) é um exame que mede a quantidade e a velocidade do ar que entra e sai dos pulmões. Avalia a capacidade pulmonar e detecta obstruções ou restrições nas vias aéreas. É fundamental para diagnóstico de asma, DPOC, fibrose pulmonar e outras doenças respiratórias.",
    howItWorks: "O paciente sopra com força máxima em um bocal conectado ao espirômetro. O aparelho mede o volume de ar expirado e a velocidade do fluxo. São realizadas várias manobras para garantir resultados confiáveis. O exame pode incluir teste com broncodilatador para avaliar a reversibilidade de obstruções.",
    indications: [
      "Diagnóstico de asma brônquica",
      "Diagnóstico e acompanhamento de DPOC",
      "Avaliação de falta de ar (dispneia)",
      "Avaliação pré-operatória de cirurgias torácicas",
      "Monitoramento de doenças pulmonares ocupacionais",
      "Avaliação de tabagistas",
      "Acompanhamento de tratamento respiratório",
    ],
    preparations: [
      { icon: AlertTriangle, text: "Não fumar por pelo menos 4 horas antes do exame" },
      { icon: Clock, text: "Evitar refeições pesadas 2 horas antes" },
      { icon: CheckCircle, text: "Use roupas confortáveis que não apertem o tórax" },
      { icon: Stethoscope, text: "Consulte seu médico sobre suspensão de broncodilatadores" },
    ],
    faqs: [
      { q: "A espirometria dói?", a: "Não. O exame é indolor, mas requer esforço respiratório máximo. Você precisará soprar com toda a força no aparelho, o que pode causar leve tontura temporária." },
      { q: "Quanto tempo dura?", a: "O exame dura aproximadamente 15 a 30 minutos, incluindo as repetições necessárias e o teste com broncodilatador, quando indicado." },
      { q: "Preciso suspender medicamentos?", a: "Depende do objetivo do exame. Seu médico orientará se deve suspender broncodilatadores antes do teste. Nunca suspenda medicamentos por conta própria." },
      { q: "Crianças podem fazer?", a: "Sim, geralmente a partir dos 6 anos de idade, quando a criança já consegue colaborar com as manobras respiratórias necessárias." },
    ],
    whatsappMessage: "Olá! Gostaria de agendar uma espirometria (prova de função pulmonar).",
    category: "outros",
    keywords: ["espirometria", "prova de função pulmonar", "asma", "DPOC", "capacidade respiratória", "Caraguatatuba"],
  },
  {
    slug: "eletrocardiograma",
    title: "ELETROCARDIOGRAMA",
    shortTitle: "Eletrocardiograma",
    subtitle: "ECG - Avaliação Cardíaca",
    description: "Registro da atividade elétrica do coração para diagnóstico cardíaco.",
    metaTitle: "Eletrocardiograma (ECG) em Caraguatatuba - SP | Total Quality Medicina Diagnóstica",
    metaDescription: "Eletrocardiograma (ECG) em Caraguatatuba - SP. Exame rápido e indolor para avaliação do ritmo cardíaco, arritmias e doenças do coração na Total Quality.",
    heroDescription: "O Eletrocardiograma (ECG) é um exame rápido, indolor e fundamental para avaliação da saúde do coração. Registra a atividade elétrica cardíaca e permite diagnosticar arritmias, isquemias e outras condições cardíacas.",
    whatIs: "O Eletrocardiograma (ECG) é um exame que registra a atividade elétrica do coração através de eletrodos colocados na pele. Produz um traçado gráfico que mostra o ritmo cardíaco, a frequência dos batimentos e possíveis alterações na condução elétrica do coração. É um dos exames mais realizados na cardiologia.",
    howItWorks: "Eletrodos adesivos são colocados no tórax, braços e pernas do paciente. Esses eletrodos captam os sinais elétricos do coração e os transmitem ao aparelho, que produz um traçado em papel ou digital. O exame é rápido, durando apenas 5 a 10 minutos, e é completamente indolor.",
    indications: [
      "Dor no peito ou desconforto torácico",
      "Palpitações e arritmias",
      "Falta de ar (dispneia)",
      "Avaliação pré-operatória",
      "Check-up cardiológico",
      "Acompanhamento de hipertensão",
      "Avaliação para prática esportiva",
    ],
    preparations: [
      { icon: CheckCircle, text: "Não necessita jejum ou preparo especial" },
      { icon: AlertTriangle, text: "Evite aplicar cremes ou loções no tórax" },
      { icon: Clock, text: "Chegue 10 minutos antes para relaxar" },
      { icon: FileText, text: "Traga o pedido médico e ECGs anteriores" },
    ],
    faqs: [
      { q: "O eletrocardiograma dói?", a: "Não. O exame é completamente indolor. Os eletrodos apenas captam sinais elétricos, não emitem nenhum tipo de corrente ou choque." },
      { q: "Quanto tempo dura?", a: "O exame é muito rápido, durando apenas 5 a 10 minutos. O resultado é imediato." },
      { q: "Preciso de algum preparo?", a: "Não é necessário jejum. Apenas evite aplicar cremes no tórax e tente chegar relaxado ao exame." },
      { q: "Com que frequência devo fazer?", a: "Depende da indicação médica. Para check-up, geralmente é anual. Pacientes cardíacos podem necessitar com maior frequência." },
    ],
    whatsappMessage: "Olá! Gostaria de agendar um eletrocardiograma.",
    category: "cardiologia",
    keywords: ["eletrocardiograma", "ECG", "exame do coração", "arritmia", "cardiologia", "Caraguatatuba"],
  },
  {
    slug: "eletroencefalograma",
    title: "ELETROENCEFALOGRAMA",
    shortTitle: "Eletroencefalograma",
    subtitle: "EEG - Avaliação Neurológica",
    description: "Registro da atividade elétrica cerebral para diagnóstico neurológico.",
    metaTitle: "Eletroencefalograma (EEG) em Caraguatatuba - SP | Total Quality Medicina Diagnóstica",
    metaDescription: "Eletroencefalograma (EEG) em Caraguatatuba - SP. Exame para diagnóstico de epilepsia, convulsões e distúrbios neurológicos na Total Quality.",
    heroDescription: "O Eletroencefalograma (EEG) é um exame que registra a atividade elétrica do cérebro, sendo fundamental para diagnóstico de epilepsia, convulsões e outros distúrbios neurológicos. Na Total Quality, realizamos o exame com equipamento digital de alta sensibilidade.",
    whatIs: "O Eletroencefalograma (EEG) é um exame neurofisiológico que registra a atividade elétrica do cérebro através de eletrodos colocados no couro cabeludo. Produz um traçado que mostra padrões de ondas cerebrais, permitindo identificar alterações associadas a epilepsia, distúrbios do sono, encefalopatias e outras condições neurológicas.",
    howItWorks: "Eletrodos são posicionados no couro cabeludo com pasta condutora. O paciente permanece deitado ou sentado confortavelmente enquanto o aparelho registra a atividade elétrica cerebral. Durante o exame, podem ser realizadas estimulações como hiperventilação e fotoestimulação para provocar respostas cerebrais específicas.",
    indications: [
      "Diagnóstico e acompanhamento de epilepsia",
      "Investigação de convulsões",
      "Avaliação de perda de consciência",
      "Distúrbios do sono",
      "Avaliação de encefalopatias",
      "Investigação de alterações comportamentais",
      "Avaliação pré-cirúrgica de epilepsia",
    ],
    preparations: [
      { icon: Droplets, text: "Lave os cabelos na véspera sem usar condicionador ou gel" },
      { icon: Clock, text: "Durma menos que o habitual na noite anterior (privação parcial de sono)" },
      { icon: AlertTriangle, text: "Não suspenda medicamentos sem orientação médica" },
      { icon: FileText, text: "Traga exames anteriores e lista de medicamentos em uso" },
    ],
    faqs: [
      { q: "O eletroencefalograma dói?", a: "Não. O exame é completamente indolor. Os eletrodos apenas captam sinais elétricos do cérebro, não emitem nenhum tipo de corrente." },
      { q: "Quanto tempo dura?", a: "O exame dura entre 20 e 40 minutos. Em alguns casos, pode ser solicitado EEG prolongado de várias horas." },
      { q: "Por que preciso dormir menos?", a: "A privação parcial de sono pode facilitar o aparecimento de alterações no EEG que ajudam no diagnóstico, especialmente em casos de epilepsia." },
      { q: "Posso usar condicionador?", a: "Não. Produtos como condicionador, gel e creme criam uma camada que dificulta a captação dos sinais elétricos pelos eletrodos." },
    ],
    whatsappMessage: "Olá! Gostaria de agendar um eletroencefalograma.",
    category: "neurologia",
    keywords: ["eletroencefalograma", "EEG", "epilepsia", "convulsão", "neurologia", "exame cerebral", "Caraguatatuba"],
  },
  {
    slug: "exame-toxicologico",
    title: "EXAME TOXICOLÓGICO",
    shortTitle: "Exame Toxicológico",
    subtitle: "Análise Toxicológica",
    description: "Exame toxicológico para detecção de substâncias com janela de até 180 dias.",
    metaTitle: "Exame Toxicológico em Caraguatatuba - SP | Total Quality Medicina Diagnóstica",
    metaDescription: "Exame toxicológico em Caraguatatuba - SP para CNH, admissional e demissional. Detecção de substâncias com janela de até 180 dias. Resultado rápido na Total Quality.",
    heroDescription: "O exame toxicológico é obrigatório para motoristas profissionais (categorias C, D e E) e pode ser solicitado em processos admissionais e demissionais. Na Total Quality, realizamos o exame com laboratório credenciado e resultados rápidos.",
    whatIs: "O Exame Toxicológico é uma análise laboratorial que detecta o uso de substâncias psicoativas (drogas) através de amostras de cabelo, pelo ou unha. Possui janela de detecção de até 90 a 180 dias, sendo muito mais abrangente que o exame de urina. É obrigatório por lei para motoristas profissionais das categorias C, D e E.",
    howItWorks: "Uma pequena amostra de cabelo (ou pelo corporal) é coletada e enviada ao laboratório credenciado. A análise identifica metabólitos de substâncias como maconha, cocaína, anfetaminas, metanfetaminas, opiáceos e outras drogas. O resultado é emitido em formato padronizado e aceito pelo DETRAN.",
    indications: [
      "Renovação ou obtenção de CNH categorias C, D e E",
      "Exame admissional para empresas de transporte",
      "Exame demissional de motoristas profissionais",
      "Exame periódico de motoristas profissionais",
      "Processos judiciais e trabalhistas",
      "Concursos públicos que exigem o exame",
      "Programas de prevenção corporativos",
    ],
    preparations: [
      { icon: CheckCircle, text: "Não é necessário jejum" },
      { icon: FileText, text: "Traga documento com foto (RG ou CNH)" },
      { icon: AlertTriangle, text: "Cabelo deve ter no mínimo 3cm de comprimento" },
      { icon: Shield, text: "Não raspe os cabelos ou pelos antes do exame" },
    ],
    faqs: [
      { q: "Qual a janela de detecção do exame?", a: "O exame toxicológico de cabelo detecta o uso de substâncias nos últimos 90 a 180 dias, dependendo do comprimento do cabelo ou pelo coletado." },
      { q: "É obrigatório para qual categoria de CNH?", a: "É obrigatório para motoristas das categorias C, D e E, tanto para obtenção quanto para renovação da CNH, conforme Lei 13.103/2015." },
      { q: "E se eu tiver cabelo muito curto?", a: "Se o cabelo da cabeça for muito curto, pode ser coletado pelo de outras regiões do corpo (braço, perna, tórax). O importante é ter no mínimo 3cm." },
      { q: "Quanto tempo demora o resultado?", a: "O resultado fica pronto em média 5 a 10 dias úteis. É emitido em formato padronizado aceito pelo DETRAN." },
    ],
    whatsappMessage: "Olá! Gostaria de agendar um exame toxicológico.",
    category: "outros",
    keywords: ["exame toxicológico", "toxicológico CNH", "exame de drogas", "toxicológico admissional", "DETRAN", "Caraguatatuba"],
  },
];

export function getExamBySlug(slug: string): ExamData | undefined {
  return examesData.find((e) => e.slug === slug);
}

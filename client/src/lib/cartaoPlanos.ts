import { Check, Zap, Heart, Pill, Smartphone, Dumbbell } from "lucide-react";

export interface Benefit {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface Plan {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  period: string;
  description: string;
  highlighted: boolean;
  benefits: string[];
  cta: string;
  exclusiveBenefits?: string[];
  familyBenefits?: string[];
}

export const cartaoPlanos: Plan[] = [
  {
    id: "quality-plus",
    name: "Quality Plus",
    subtitle: "Proteção Essencial",
    price: "R$ 49,90",
    period: "/mês",
    description: "Ideal para quem busca telemedicina e descontos básicos",
    highlighted: false,
    benefits: [
      "5 Teleconsultas com Clínico Geral/mês",
      "1 Teleconsulta com Especialista/mês",
      "APP com Cashback em PIX",
      "Milhares de marcas parceiras",
      "Descontos em exames laboratoriais",
      "Descontos em exames de imagem",
    ],
    exclusiveBenefits: [
      "5 Teleconsultas com o Clínico Geral por mês incluso no plano",
      "1 Teleconsulta com o Médico Especialista por mês incluso no plano (Mais de 30 especialidades médicas)",
      "APP Total Quality Care com Cashback em PIX",
      "Milhares de marcas parceiras: Magalu, Americanas, Extra, Boticário, Natura, Avon, Casas Bahia, Centauro, Renner, Netshoes, FastShop, Drogaria SP e muitos outros",
    ],
    familyBenefits: [
      "Descontos de até 20% em exames laboratoriais",
      "Descontos de até 10% em exames de imagem",
    ],
    cta: "Escolher Plano",
  },
  {
    id: "quality-select",
    name: "Quality Select",
    subtitle: "Proteção Completa",
    price: "R$ 89,90",
    period: "/mês",
    description: "Para famílias que querem mais benefícios e descontos",
    highlighted: true,
    benefits: [
      "5 Teleconsultas com Clínico Geral/mês",
      "Uber Voucher R$ 15/mês",
      "APP com Cashback em PIX",
      "1 Check-up anual gratuito*",
      "Descontos até 30% em exames",
      "Descontos até 10% em imagem",
    ],
    exclusiveBenefits: [
      "Telemedicina Integral: 5 teleconsultas mensais com clínico geral",
      "Uber Voucher no valor de R$ 15,00 todos os meses",
      "Cashback em PIX por meio do aplicativo Total Quality Care",
      "Acesso ao aplicativo Total Quality Care com cashback em PIX e benefícios em milhares de marcas parceiras",
    ],
    familyBenefits: [
      "1 check-up anual no valor de R$ 499,00, gratuito para os 100 primeiros adquirentes",
      "Descontos de até 30% em exames laboratoriais",
      "Descontos de até 10% em exames de imagem",
    ],
    cta: "Escolher Plano",
  },
  {
    id: "quality-premium",
    name: "Premium",
    subtitle: "Proteção Premium",
    price: "R$ 149,90",
    period: "/mês",
    description: "Máxima proteção com benefícios ampliados para toda família",
    highlighted: false,
    benefits: [
      "5 Teleconsultas com Clínico Geral/mês",
      "1 Teleconsulta com Especialista/mês",
      "Uber Voucher R$ 25/mês",
      "Acesso LecuponFit (academias)",
      "1 Check-up anual gratuito*",
      "Descontos até 70% em exames",
    ],
    exclusiveBenefits: [
      "Telemedicina Integral Plus: 5 teleconsultas mensais com clínico geral e 1 Teleconsulta com o Médico Especialista por mês",
      "Uber Voucher no valor de R$ 25,00 todos os meses",
      "LecuponFit - Acesso a diversas academias espalhadas por Caraguatatuba e pelo Brasil (Acesso Exclusivo)",
      "Cashback em PIX por meio do aplicativo Total Quality Care",
      "Acesso ao aplicativo Total Quality Care com cashback em PIX e benefícios em milhares de marcas parceiras",
    ],
    familyBenefits: [
      "1 check-up anual no valor de R$ 499,00, gratuito para os 100 primeiros adquirentes",
      "Descontos de até 70% em exames laboratoriais",
      "Descontos de até 20% em exames de imagem",
    ],
    cta: "Escolher Plano",
  },
];

export const mainBenefitsData = [
  {
    icon: "zap",
    title: "Telemedicina 24/7",
    description: "Consultas com clínico geral e especialistas disponíveis a qualquer hora",
  },
  {
    icon: "smartphone",
    title: "Cashback em PIX",
    description: "Ganhe cashback em compras com milhares de marcas parceiras",
  },
  {
    icon: "heart",
    title: "Check-up Anual",
    description: "Avaliação completa da saúde (nos planos Select e Premium)",
  },
  {
    icon: "dumbbell",
    title: "Acesso a Academias",
    description: "LecuponFit com acesso a diversas academias (plano Premium)",
  },
  {
    icon: "pill",
    title: "Descontos em Exames",
    description: "Até 70% de desconto em exames laboratoriais e de imagem",
  },
  {
    icon: "heart",
    title: "Benefícios para Família",
    description: "Descontos extensivos para titular e dependentes",
  },
];

export const faqs = [
  {
    question: "Qual a diferença entre os planos?",
    answer:
      "O Quality Plus oferece telemedicina básica e descontos moderados. O Quality Select adiciona check-up anual e Uber Voucher. O Premium inclui acesso a academias e maiores descontos em exames.",
  },
  {
    question: "Posso incluir dependentes?",
    answer:
      "Sim! Todos os planos oferecem descontos para titular e dependentes em exames laboratoriais e de imagem. Consulte os detalhes de cada plano.",
  },
  {
    question: "Como funciona a telemedicina?",
    answer:
      "Você acessa o aplicativo Total Quality Care, agenda uma consulta com clínico geral ou especialista e realiza a consulta por vídeo chamada.",
  },
  {
    question: "O check-up anual é realmente gratuito?",
    answer:
      "Sim! Para os 100 primeiros adquirentes dos planos Select e Premium, o check-up anual de R$ 499,00 é gratuito.",
  },
  {
    question: "Como funciona o cashback em PIX?",
    answer:
      "Ao fazer compras nas marcas parceiras usando o aplicativo Total Quality Care, você acumula cashback que é devolvido em PIX para sua conta.",
  },
  {
    question: "Posso cancelar a qualquer momento?",
    answer:
      "Sim, você pode cancelar sua assinatura sem multas ou taxas adicionais. Consulte os termos e condições para mais detalhes.",
  },
];

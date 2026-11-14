/*
 * PorQueEscolherSection — SEO content section
 * "Por que escolher a Total Quality como seu laboratório em Caraguatatuba?"
 * +400 palavras com keywords geolocalizadas integradas naturalmente
 */
import { ArrowUpRight, CheckCircle, Award, Users, Microscope, MapPin, Clock } from "lucide-react";
import { Link } from "wouter";
import { trackScheduleExam } from "@/lib/tracking";
import { anosDeAtuacao, CONVENIOS_TEXTO } from "@shared/const";
import { useWhatsAppRedirect } from "@/contexts/ContatoLeadContext";

const diferenciais = [
  {
    icon: Microscope,
    title: "Laboratório Automatizado",
    text: "Nosso laboratório em Caraguatatuba conta com equipamentos automatizados para análises clínicas e equipamentos digitais para diagnóstico por imagem.",
  },
  {
    icon: Award,
    title: `Mais de ${anosDeAtuacao()} Anos de Experiência`,
    text: "Desde 2003 no Litoral Norte paulista, com parceria acadêmica com a UNITAU e laudos assinados por médicos.",
  },
  {
    icon: Users,
    title: "Mais de 30.000 Famílias Atendidas",
    text: "No Centro de Caraguatatuba - SP, reunimos em um só endereço mais de 3.000 tipos de exames laboratoriais e diagnósticos por imagem.",
  },
  {
    icon: Clock,
    title: "Resultados Online",
    text: "Os resultados ficam disponíveis online, com acesso seguro, de qualquer lugar. O prazo de cada exame é informado no momento da coleta.",
  },
];

export default function PorQueEscolherSection() {
  const openWhatsApp = useWhatsAppRedirect();
  const handleScheduleClick = () => {
    trackScheduleExam("porque_escolher_cta", "geral");
    openWhatsApp("porque_escolher_cta", "Olá! Gostaria de agendar um exame na Total Quality.");
  };

  return (
    <section id="porque-escolher" className="py-20 lg:py-28 bg-neutral-50" aria-label="Por que escolher a Total Quality">
      <div className="container">
        {/* Header */}
        <div className="grid lg:grid-cols-12 gap-12 mb-16">
          <div className="lg:col-span-5">
            <span className="section-label mb-4 block">Laboratório em Caraguatatuba</span>
            {/* Titulo curto: a Bebas so funciona em poucas palavras; o termo
                "laboratorio em Caraguatatuba" foi para a chamada acima. */}
            <h2 className="reveal heading-display text-4xl lg:text-5xl xl:text-6xl text-text">
              Por que a <span className="text-brand">Total Quality</span>
            </h2>
          </div>
          <div className="lg:col-span-7 flex items-end">
            <p className="reveal text-text-light text-lg leading-relaxed">
              A Total Quality é laboratório de análises clínicas e clínica de diagnóstico em Caraguatatuba - SP
              desde 2003. São mais de {anosDeAtuacao()} anos e mais de 30.000 famílias atendidas. No mesmo endereço,
              no Centro, o nosso laboratório em Caraguatatuba realiza mais de 3.000 tipos de exames laboratoriais
              e de imagem, com coleta sem agendamento e resultados disponíveis online.
            </p>
          </div>
        </div>

        {/* Diferenciais grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {diferenciais.map((item, i) => (
            <div
              key={item.title}
              className="reveal bg-white rounded-2xl p-8 border border-black/5 hover:shadow-lg transition-shadow duration-300"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <item.icon className="w-8 h-8 text-brand mb-4" />
              <h3 className="heading-display text-xl text-text mb-3">{item.title}</h3>
              <p className="text-text-light leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Expanded content — SEO-rich text with geolocalized keywords */}
        <div className="grid lg:grid-cols-12 gap-12 mb-16">
          <div className="lg:col-span-6">
            <h3 className="reveal heading-display text-2xl text-text mb-6">
              EXAMES LABORATORIAIS EM <span className="text-brand">CARAGUATATUBA</span>
            </h3>
            <p className="reveal text-text-light leading-relaxed mb-4">
              Nosso laboratório em Caraguatatuba oferece uma ampla variedade de exames de sangue, incluindo
              hemograma completo, glicemia em jejum, colesterol total e frações, triglicerídeos, TSH, T4 livre,
              PSA total e livre, vitamina D, hemoglobina glicada, ureia, creatinina, TGO, TGP, ácido úrico,
              hormônios e marcadores tumorais. Todos os exames laboratoriais em Caraguatatuba - SP são realizados
              com equipamentos automatizados.
            </p>
            <p className="reveal text-text-light leading-relaxed">
              Além dos exames de sangue, realizamos exames de urina, exames de fezes (parasitológico),
              coagulograma, exame toxicológico e diversas sorologias. A coleta é feita por profissionais
              treinados em ambiente confortável e seguro, no centro de Caraguatatuba, com fácil acesso
              e estacionamento próximo.
            </p>
          </div>
          <div className="lg:col-span-6">
            <h3 className="reveal heading-display text-2xl text-text mb-6">
              DIAGNÓSTICO POR IMAGEM EM <span className="text-brand">CARAGUATATUBA</span>
            </h3>
            <p className="reveal text-text-light leading-relaxed mb-4">
              A Total Quality reúne em Caraguatatuba{" "}
              <Link href="/exames/tomografia-computadorizada" className="text-brand hover:underline">
                tomografia computadorizada multislice
              </Link>
              ,{" "}
              <Link href="/exames/ultrassonografia" className="text-brand hover:underline">
                ultrassonografia geral e Doppler
              </Link>
              ,{" "}
              <Link href="/exames/raio-x" className="text-brand hover:underline">
                raio-X digital
              </Link>
              ,{" "}
              <Link href="/exames/holter" className="text-brand hover:underline">
                holter 24h
              </Link>
              ,{" "}
              <Link href="/exames/mapa" className="text-brand hover:underline">
                MAPA 24h
              </Link>
              ,{" "}
              <Link href="/exames/eletrocardiograma" className="text-brand hover:underline">
                eletrocardiograma
              </Link>
              ,{" "}
              <Link href="/exames/espirometria" className="text-brand hover:underline">
                espirometria
              </Link>
              ,{" "}
              <Link href="/exames/eletroencefalograma" className="text-brand hover:underline">
                eletroencefalograma
              </Link>{" "}
              e{" "}
              <Link href="/bioimpedancia" className="text-brand hover:underline">
                bioimpedância
              </Link>
              . Os equipamentos de diagnóstico por imagem são digitais e produzem imagens de alta resolução
              para o laudo médico.
            </p>
            <p className="reveal text-text-light leading-relaxed">
              Contamos com equipe médica especializada em radiologia, cardiologia e neurologia, que assina
              laudos detalhados. O check-up preventivo em Caraguatatuba inclui uma combinação
              personalizada de exames laboratoriais e de imagem, adaptada às necessidades de cada paciente.
            </p>
          </div>
        </div>

        {/* Location and convenience */}
        <div className="reveal bg-white rounded-2xl p-8 lg:p-12 border border-black/5">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8">
              <h3 className="heading-display text-2xl text-text mb-4">
                <MapPin className="w-6 h-6 text-brand inline-block mr-2 -mt-1" />
                LOCALIZAÇÃO E ACESSO
              </h3>
              <p className="text-text-light leading-relaxed mb-4">
                O laboratório Total Quality está localizado no centro de Caraguatatuba, na R. Padre Anchieta, 1010,
                com fácil acesso de carro, ônibus ou a pé. Funcionamos de segunda a sexta-feira, das 07h30 às 18h.
                Atendemos {CONVENIOS_TEXTO}; fora deles, o atendimento é particular, com tabela própria.
              </p>
              <div className="flex flex-wrap gap-3">
                {["Estacionamento próximo", "Acessibilidade", "Aceita cartão e PIX", "Convênios aceitos"].map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5 text-sm text-text-light bg-neutral-100 px-3 py-1.5 rounded-full">
                    <CheckCircle className="w-3.5 h-3.5 text-brand" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="lg:col-span-4 flex justify-center lg:justify-end">
              <button
                onClick={handleScheduleClick}
                className="btn-pill-brand btn-pill"
                aria-label="Agendar exame na Total Quality via WhatsApp"
              >
                Agendar Exame
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

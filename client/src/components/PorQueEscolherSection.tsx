/*
 * PorQueEscolherSection — SEO content section
 * "Por que escolher a Total Quality como seu laboratório em Caraguatatuba?"
 * +400 palavras com keywords geolocalizadas integradas naturalmente
 */
import { ArrowUpRight, CheckCircle, Award, Users, Microscope, MapPin, Clock } from "lucide-react";
import { trackScheduleExam } from "@/lib/tracking";

const diferenciais = [
  {
    icon: Microscope,
    title: "Tecnologia de Última Geração",
    text: "Nosso laboratório em Caraguatatuba conta com equipamentos automatizados de alta precisão para análises clínicas e diagnósticos por imagem, com rigoroso controle de qualidade para resultados confiáveis e rápidos.",
  },
  {
    icon: Award,
    title: "Mais de 20 Anos de Experiência",
    text: "Desde 2003, a Total Quality é referência em medicina diagnóstica no litoral norte paulista, com parceria acadêmica com a UNITAU e equipe médica altamente qualificada.",
  },
  {
    icon: Users,
    title: "Mais de 30.000 Famílias Atendidas",
    text: "Somos um laboratório de análises clínicas em Caraguatatuba - SP com mais de 3.000 tipos de exames laboratoriais e diagnósticos por imagem disponíveis.",
  },
  {
    icon: Clock,
    title: "Resultados Rápidos e Online",
    text: "Os resultados dos exames laboratoriais ficam disponíveis online em até 24 horas para a maioria dos exames de sangue. Acesse de qualquer lugar, a qualquer hora.",
  },
];

export default function PorQueEscolherSection() {
  const handleScheduleClick = () => {
    trackScheduleExam("porque_escolher_cta", "geral");
    window.open("https://wa.me/551238873535?text=Olá! Gostaria de agendar um exame na Total Quality.", "_blank");
  };

  return (
    <section id="porque-escolher" className="py-20 lg:py-28 bg-neutral-50" aria-label="Por que escolher a Total Quality">
      <div className="container">
        {/* Header */}
        <div className="grid lg:grid-cols-12 gap-12 mb-16">
          <div className="lg:col-span-5">
            <span className="section-label mb-4 block">Laboratório Caraguatatuba</span>
            <h2 className="reveal heading-display text-3xl lg:text-4xl xl:text-5xl text-text">
              POR QUE ESCOLHER A TOTAL QUALITY COMO SEU{" "}
              <span className="text-brand">LABORATÓRIO EM CARAGUATATUBA?</span>
            </h2>
          </div>
          <div className="lg:col-span-7 flex items-end">
            <p className="reveal text-text-light text-lg leading-relaxed">
              A Total Quality é referência em laboratório de análises clínicas em Caraguatatuba - SP desde 2003.
              Com mais de 20 anos de experiência e mais de 30.000 famílias atendidas, oferecemos a maior
              estrutura de medicina diagnóstica do litoral norte paulista. Nosso laboratório em Caraguatatuba
              realiza mais de 3.000 tipos de exames laboratoriais e diagnósticos por imagem, com resultados
              precisos, rápidos e disponíveis online.
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
              com equipamentos automatizados e rigoroso controle de qualidade em todas as etapas da análise.
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
              A Total Quality reúne em um só lugar os principais exames de imagem de Caraguatatuba:
              tomografia computadorizada multislice, ultrassom geral e Doppler, mamografia digital,
              raio-X digital, holter 24h, MAPA 24h, eletrocardiograma, teste ergométrico, espirometria,
              eletroencefalograma e bioimpedância. Nossos equipamentos de diagnóstico por imagem em
              Caraguatatuba são de última geração, proporcionando imagens de alta resolução para diagnósticos
              mais precisos.
            </p>
            <p className="reveal text-text-light leading-relaxed">
              Contamos com equipe médica especializada em radiologia, cardiologia e neurologia, responsável
              por laudos detalhados e confiáveis. O check-up preventivo em Caraguatatuba inclui uma combinação
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
                com fácil acesso de carro, ônibus ou a pé. Funcionamos de segunda a sexta-feira, das 08h às 18h.
                Aceitamos diversos convênios de saúde e oferecemos atendimento particular com preços acessíveis.
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

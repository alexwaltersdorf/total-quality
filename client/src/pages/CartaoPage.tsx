import { useState } from "react";
import { ChevronDown, Zap, Smartphone, Heart, Dumbbell, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import CartaoPricingCard from "@/components/CartaoPricingCard";
import { cartaoPlanos, mainBenefitsData, faqs } from "@/lib/cartaoPlanos";

export default function CartaoPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    // Redirecionar para WhatsApp ou página de checkout
    const message = `Olá! Gostaria de contratar o plano ${cartaoPlanos.find(p => p.id === planId)?.name}.`;
    window.location.href = `https://wa.me/5512988735350?text=${encodeURIComponent(message)}`;
  };

  const getIconComponent = (iconName: string) => {
    const iconClass = "w-8 h-8 text-red-700";
    switch (iconName) {
      case "zap":
        return <Zap className={iconClass} />;
      case "smartphone":
        return <Smartphone className={iconClass} />;
      case "heart":
        return <Heart className={iconClass} />;
      case "dumbbell":
        return <Dumbbell className={iconClass} />;
      case "pill":
        return <Pill className={iconClass} />;
      default:
        return <Heart className={iconClass} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-red-700 to-red-800 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 font-bebas-neue tracking-wide">
            TOTAL QUALITY CARE
          </h1>
          <p className="text-xl sm:text-2xl mb-4 font-light">
            Proteção Completa para Sua Saúde e Bem-estar
          </p>
          <p className="text-lg text-red-100 mb-8 max-w-2xl mx-auto">
            Acesso a telemedicina, descontos em exames, cashback em PIX e muito mais.
            Escolha o plano perfeito para você e sua família.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-red-700 hover:bg-gray-100 px-8 py-6 text-lg font-bold">
              Começar Agora
            </Button>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-bold"
            >
              Saiba Mais
            </Button>
          </div>
        </div>
      </section>

      {/* Benefícios Principais */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-900">
            Por que escolher Total Quality Care?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mainBenefitsData.map((benefit, idx) => (
              <div key={idx} className="flex gap-4 p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex-shrink-0">
                  {getIconComponent(benefit.icon)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Planos */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">
              Escolha Seu Plano
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Todos os planos incluem acesso ao aplicativo Total Quality Care com cashback em PIX
              e benefícios em milhares de marcas parceiras.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {cartaoPlanos.map((plan) => (
              <CartaoPricingCard
                key={plan.id}
                plan={plan}
                onSelect={handleSelectPlan}
              />
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <p className="text-sm text-gray-600">
              * Check-up anual gratuito para os 100 primeiros adquirentes dos planos Select e Premium.
              Consulte os termos e condições.
            </p>
          </div>
        </div>
      </section>

      {/* Comparação Detalhada */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-900">
            Comparação Completa de Benefícios
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-sm">
              <thead>
                <tr className="border-b-2 border-red-700">
                  <th className="px-6 py-4 text-left font-bold text-gray-900">Benefício</th>
                  {cartaoPlanos.map((plan) => (
                    <th
                      key={plan.id}
                      className="px-6 py-4 text-center font-bold text-gray-900"
                    >
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    Teleconsultas Clínico Geral/mês
                  </td>
                  <td className="px-6 py-4 text-center">5</td>
                  <td className="px-6 py-4 text-center">5</td>
                  <td className="px-6 py-4 text-center">5</td>
                </tr>
                <tr className="border-b">
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    Teleconsultas Especialista/mês
                  </td>
                  <td className="px-6 py-4 text-center">1</td>
                  <td className="px-6 py-4 text-center">-</td>
                  <td className="px-6 py-4 text-center">1</td>
                </tr>
                <tr className="border-b">
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    Uber Voucher/mês
                  </td>
                  <td className="px-6 py-4 text-center">-</td>
                  <td className="px-6 py-4 text-center">R$ 15</td>
                  <td className="px-6 py-4 text-center">R$ 25</td>
                </tr>
                <tr className="border-b">
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    Check-up Anual
                  </td>
                  <td className="px-6 py-4 text-center">-</td>
                  <td className="px-6 py-4 text-center">Gratuito*</td>
                  <td className="px-6 py-4 text-center">Gratuito*</td>
                </tr>
                <tr className="border-b">
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    Acesso LecuponFit
                  </td>
                  <td className="px-6 py-4 text-center">-</td>
                  <td className="px-6 py-4 text-center">-</td>
                  <td className="px-6 py-4 text-center">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    Desconto Exames Laboratoriais
                  </td>
                  <td className="px-6 py-4 text-center">até 20%</td>
                  <td className="px-6 py-4 text-center">até 30%</td>
                  <td className="px-6 py-4 text-center">até 70%</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    Desconto Exames de Imagem
                  </td>
                  <td className="px-6 py-4 text-center">até 10%</td>
                  <td className="px-6 py-4 text-center">até 10%</td>
                  <td className="px-6 py-4 text-center">até 20%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-900">
            Perguntas Frequentes
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() =>
                    setExpandedFaq(expandedFaq === idx ? null : idx)
                  }
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-bold text-gray-900 text-left">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-600 transition-transform ${
                      expandedFaq === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedFaq === idx && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-gradient-to-r from-red-700 to-red-800 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Pronto para Proteger Sua Saúde?
          </h2>
          <p className="text-lg text-red-100 mb-8">
            Escolha seu plano agora e comece a aproveitar todos os benefícios do Total Quality Care.
          </p>
          <Button className="bg-white text-red-700 hover:bg-gray-100 px-12 py-6 text-lg font-bold">
            Contratar Agora
          </Button>
        </div>
      </section>
    </div>
  );
}

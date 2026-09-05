import { useState, useEffect } from "react";
import { ChevronDown, Zap, Smartphone, Heart, Dumbbell, Pill, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import CartaoPricingCard from "@/components/CartaoPricingCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFAB from "@/components/WhatsAppFAB";
import LeadsFormModal from "@/components/LeadsFormModal";
import { useTracking } from "@/hooks/useTracking";
import { cartaoPlanos, mainBenefitsData, faqs } from "@/lib/cartaoPlanos";

export default function CartaoPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const { trackCTAClick, trackPageView } = useTracking();

  // Rastrear visualização da página
  useEffect(() => {
    trackPageView('CartaoPage');
  }, [trackPageView]);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    trackCTAClick(`select_plan_${planId}`);
    const planMessages: Record<string, string> = {
      "quality-plus": "Quero Proteção Essencial, R$ 29,90",
      "quality-select": "Quero Proteção Completa, R$ 69,90",
      "quality-premium": "Quero Proteção Premium, R$ 99,90"
    };
    const message = planMessages[planId] || `Olá! Gostaria de contratar o plano ${cartaoPlanos.find(p => p.id === planId)?.name}.`;
    window.location.href = `https://wa.me/551238873535?text=${encodeURIComponent(message)}`;
  };

  const handleCTAClick = (ctaName: string) => {
    trackCTAClick(ctaName);
  };

  const handleOpenFormModal = () => {
    trackCTAClick('open_leads_form');
    setIsFormModalOpen(true);
  };

  const getIconComponent = (iconName: string) => {
    const iconClass = "w-8 h-8 text-brand";
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
      <Navbar />
      {/* Hero Section */}
      <section className="relative h-screen bg-cover bg-center flex items-center justify-center" style={{
        backgroundImage: 'url(https://d2xsxph8kpxj0f.cloudfront.net/310419663029159398/JL54VveRaBTccEphCgT7vi/familia-feliz-cartao-eU6gbFymHQy5EPdc6okx6r.webp)',
        backgroundAttachment: 'fixed'
      }}>
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40"></div>
        
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 font-bebas-neue tracking-wide text-white">
            TOTAL QUALITY CARE
          </h1>
          <p className="text-xl sm:text-2xl mb-4 font-light text-white">
            Proteção Completa para Sua Saúde e Bem-estar
          </p>
          <p className="text-lg text-gray-100 mb-8 max-w-2xl mx-auto">
            Acesso a telemedicina, descontos em exames, cashback em PIX e muito mais.
            Escolha o plano perfeito para você e sua família.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleOpenFormModal}
              className="bg-brand hover:bg-brand-dark text-white px-8 py-6 text-lg font-bold"
            >
              Começar Agora
            </Button>
            <Button
              onClick={() => handleCTAClick('hero_cta_learn_more')}
              variant="outline"
              className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg font-bold"
            >
              Saiba Mais
            </Button>
          </div>
        </div>
      </section>

      {/* Por que escolher Total Quality Care */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="text-sm font-semibold text-text-light uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand"></span>
              Proteção e Benefícios
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-5xl sm:text-6xl font-bebas-neue tracking-wide leading-tight mb-6">
                  <span className="text-text-light block">POR QUE</span>
                  <span className="text-brand block">ESCOLHER TOTAL</span>
                  <span className="text-brand block">QUALITY CARE?</span>
                </h2>
                <p className="text-lg text-text-light leading-relaxed">
                  Nossos planos em Medicina Diagnóstica e Telemedicina fazem toda a diferença no cuidado com sua saúde. Proteção completa para você e sua família com benefícios exclusivos.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {mainBenefitsData.slice(0, 4).map((benefit, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getIconComponent(benefit.icon)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-text-light mb-2">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-text-light">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Escolha Seu Plano */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-text-light uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand"></span>
              Planos de Proteção
            </p>
            <h2 className="text-5xl sm:text-6xl font-bebas-neue tracking-wide leading-tight mb-6">
              <span className="text-text-light block">ESCOLHA SEU</span>
              <span className="text-brand block">PLANO</span>
            </h2>
            <p className="text-lg text-text-light max-w-2xl mx-auto">
              Todos os planos incluem acesso ao aplicativo Total Quality Care com cashback em PIX e benefícios em milhares de marcas parceiras.
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
            <p className="text-sm text-text-light">
              * Check-up anual gratuito para os 100 primeiros adquirentes dos planos Select e Premium.
              Consulte os termos e condições.
            </p>
          </div>
        </div>
      </section>

      {/* Seção 2 - Identificação da Dor */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-text-light uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand"></span>
              Seus Desafios
            </p>
            <h2 className="text-5xl sm:text-6xl font-bebas-neue tracking-wide leading-tight">
              <span className="text-text-light block">VOCÊ ENFRENTA</span>
              <span className="text-brand block">ESSES PROBLEMAS?</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "💰",
                title: "Gastos Altos com Saúde",
                description: "Exames caros, consultas particulares e medicamentos consomem seu orçamento mensal"
              },
              {
                icon: "⏱️",
                title: "Fila de Espera",
                description: "Meses esperando por consultas e exames no sistema público de saúde"
              },
              {
                icon: "😟",
                title: "Falta de Acesso",
                description: "Dificuldade para encontrar bons médicos e especialistas na sua região"
              }
            ].map((problem, idx) => (
              <div key={idx} className="bg-white rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-5xl mb-4">{problem.icon}</div>
                <h3 className="text-2xl font-bold text-text-light mb-3">{problem.title}</h3>
                <p className="text-text-light">{problem.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção 3 - Apresentação da Solução */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm font-semibold text-text-light uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand"></span>
                A Solução
              </p>
              <h2 className="text-5xl sm:text-6xl font-bebas-neue tracking-wide leading-tight mb-6">
                <span className="text-text-light block">TOTAL QUALITY</span>
                <span className="text-brand block">CARE</span>
              </h2>
              <p className="text-lg text-text-light mb-6 leading-relaxed">
                Um cartão que oferece acesso completo a telemedicina, descontos em exames, cashback em PIX e benefícios exclusivos. Tudo em um único lugar, por uma mensalidade acessível.
              </p>
              <ul className="space-y-3">
                {[
                  "✓ Acesso imediato a telemedicina 24/7",
                  "✓ Descontos de até 70% em exames",
                  "✓ Cashback em PIX para suas compras",
                  "✓ Rede de parceiros em todo Brasil"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-text-light">
                    <span className="text-brand font-bold">{item.split(" ")[0]}</span>
                    <span>{item.substring(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-brand/10 to-brand/5 rounded-lg p-8 flex items-center justify-center h-96">
              <div className="text-center">
                <div className="text-6xl mb-4">💳</div>
                <p className="text-text-light font-semibold">Seu Cartão de Proteção</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção 4 - Como a Mensalidade Volta pro PIX */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-text-light uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand"></span>
              Cashback
            </p>
            <h2 className="text-5xl sm:text-6xl font-bebas-neue tracking-wide leading-tight">
              <span className="text-text-light block">SUA MENSALIDADE</span>
              <span className="text-brand block">VOLTA EM CASHBACK</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {[
                {
                  step: "1",
                  title: "Contrate seu plano",
                  desc: "Escolha entre Quality Plus (R$ 29,90), Select (R$ 69,90) ou Premium (R$ 99,90)"
                },
                {
                  step: "2",
                  title: "Use o app Total Quality",
                  desc: "Faça compras em milhares de estabelecimentos parceiros"
                },
                {
                  step: "3",
                  title: "Receba cashback",
                  desc: "Até 10% de volta em PIX nas suas compras do dia a dia"
                },
                {
                  step: "4",
                  title: "Sua mensalidade se paga",
                  desc: "Com apenas 3-4 compras por mês, você recupera o valor investido"
                }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center font-bold text-lg">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-text-light mb-1">{item.title}</h3>
                    <p className="text-text-light">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gradient-to-br from-brand/10 to-brand/5 rounded-lg p-8 flex items-center justify-center h-96">
              <div className="text-center">
                <div className="text-6xl mb-4">💸</div>
                <p className="text-text-light font-semibold">Cashback Automático</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção 5 - Simulador Interativo de Cashback */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-text-light uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand"></span>
              Simule Seu Ganho
            </p>
            <h2 className="text-5xl sm:text-6xl font-bebas-neue tracking-wide leading-tight">
              <span className="text-text-light block">QUANTO VOCÊ VAI</span>
              <span className="text-brand block">GANHAR EM CASHBACK?</span>
            </h2>
          </div>

          <div className="bg-gray-50 rounded-lg p-8 max-w-2xl mx-auto">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-text-light mb-2">
                  Gasto Médio Mensal em Compras (R$)
                </label>
                <input
                  type="number"
                  placeholder="Ex: 1000"
                  defaultValue="1000"
                  onChange={(e) => {
                    const valor = parseFloat(e.target.value) || 0;
                    const cashback = valor * 0.1;
                    const planoSelect = 69.9;
                    const lucro = cashback - planoSelect;
                    const resultEl = document.getElementById('cashback-result');
                    const lucroEl = document.getElementById('lucro-result');
                    if (resultEl) resultEl.textContent = `R$ ${cashback.toFixed(2)}`;
                    if (lucroEl) lucroEl.textContent = `R$ ${Math.max(0, lucro).toFixed(2)}`;
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm text-text-light mb-2">Cashback Médio (10%)</p>
                  <p id="cashback-result" className="text-3xl font-bold text-brand">R$ 100,00</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <p className="text-sm text-text-light mb-2">Lucro Líquido</p>
                  <p id="lucro-result" className="text-3xl font-bold text-green-600">R$ 30,10</p>
                </div>
              </div>

              <div className="bg-brand/10 p-4 rounded-lg">
                <p className="text-sm text-text-light">
                  🌟 Com apenas 3-4 compras por mês, sua mensalidade se paga!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção 6 - O que está incluso */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-text-light uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand"></span>
              Stack de Valor
            </p>
            <h2 className="text-5xl sm:text-6xl font-bebas-neue tracking-wide leading-tight">
              <span className="text-text-light block">O QUE ESTÁ</span>
              <span className="text-brand block">INCLUSO NO SEU PLANO</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "24/7", title: "Telemedicina 24/7", desc: "Acesso imediato a médicos especialistas" },
              { icon: "📊", title: "Descontos em Medicamentos", desc: "Até 40% em farmácias parceiras" },
              { icon: "🏥", title: "Descontos em Exames", desc: "Até 70% em laboratórios credenciados" },
              { icon: "💳", title: "Cashback em PIX", desc: "Até 10% de volta em compras" },
              { icon: "🏄", title: "Academia Inclusa", desc: "Acesso a rede LecuponFit (Premium)" },
              { icon: "✏️", title: "Descontos em Viagens", desc: "Passagens aéreas e hospedagem" }
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-bold text-text-light mb-2">{item.title}</h3>
                <p className="text-text-light text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção 7 - Por que Confiar */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-text-light uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand"></span>
              Autoridade Local
            </p>
            <h2 className="text-5xl sm:text-6xl font-bebas-neue tracking-wide leading-tight">
              <span className="text-text-light block">POR QUE CONFIAR</span>
              <span className="text-brand block">NA TOTAL QUALITY?</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { badge: "20+", label: "Anos de Experiência" },
              { badge: "30K+", label: "Clientes Ativos" },
              { badge: "3.000+", label: "Tipos de Exames" },
              { badge: "24h", label: "Resultados Online" }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="bg-brand/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-brand">{item.badge}</span>
                </div>
                <p className="font-bold text-text-light">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção 8 - Provas Sociais */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-text-light uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand"></span>
              Depoimentos
            </p>
            <h2 className="text-5xl sm:text-6xl font-bebas-neue tracking-wide leading-tight">
              <span className="text-text-light block">O QUE NOSSOS</span>
              <span className="text-brand block">CLIENTES DIZEM</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Maria Silva",
                role: "Empresária",
                text: "Economizei mais de R$ 500 por mês com os descontos em exames. Recomendo!",
                rating: 5
              },
              {
                name: "João Santos",
                role: "Executivo",
                text: "A telemedicina 24/7 é incrível. Nunca mais fiquei sem atendimento médico.",
                rating: 5
              },
              {
                name: "Ana Costa",
                role: "Mãe de 2 filhos",
                text: "O cashback em PIX é real! Minha mensalidade se paga com as compras do mês.",
                rating: 5
              }
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400">⭐</span>
                  ))}
                </div>
                <p className="text-text-light mb-4 italic">\"{testimonial.text}\"</p>
                <div>
                  <p className="font-bold text-text-light">{testimonial.name}</p>
                  <p className="text-sm text-text-light">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção 7 - Comparativo (Com vs Sem Cartão) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-text-light uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand"></span>
              Comparação
            </p>
            <h2 className="text-5xl sm:text-6xl font-bebas-neue tracking-wide leading-tight">
              <span className="text-text-light block">COM VS SEM</span>
              <span className="text-brand block">TOTAL QUALITY CARE</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sem Cartão */}
            <div className="bg-white rounded-lg p-8 border-2 border-gray-300">
              <h3 className="text-2xl font-bold text-text-light mb-6">SEM CARTÃO</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl">✗</span>
                  <div>
                    <p className="font-semibold text-text-light">Consultas Caras</p>
                    <p className="text-sm text-text-light">R$ 200-500 por consulta particular</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl">✗</span>
                  <div>
                    <p className="font-semibold text-text-light">Fila de Espera</p>
                    <p className="text-sm text-text-light">Meses esperando no SUS</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl">✗</span>
                  <div>
                    <p className="font-semibold text-text-light">Exames Caros</p>
                    <p className="text-sm text-text-light">Até R$ 2.000 por exame</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl">✗</span>
                  <div>
                    <p className="font-semibold text-text-light">Sem Benefícios</p>
                    <p className="text-sm text-text-light">Nenhum desconto ou cashback</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-gray-300">
                <p className="text-sm text-text-light"><strong>Gasto Médio/Mês:</strong> R$ 800+</p>
              </div>
            </div>

            {/* Com Cartão */}
            <div className="bg-white rounded-lg p-8 border-4 border-brand shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-brand">COM TOTAL QUALITY CARE</h3>
                <span className="bg-brand text-white px-3 py-1 rounded-full text-sm font-bold">MELHOR ESCOLHA</span>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <div>
                    <p className="font-semibold text-text-light">Telemedicina 24/7</p>
                    <p className="text-sm text-text-light">Consultas imediatas com especialistas</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <div>
                    <p className="font-semibold text-text-light">Acesso Imediato</p>
                    <p className="text-sm text-text-light">Sem fila, sem espera</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <div>
                    <p className="font-semibold text-text-light">Descontos em Exames</p>
                    <p className="text-sm text-text-light">Até 70% de desconto</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <div>
                    <p className="font-semibold text-text-light">Cashback em PIX</p>
                    <p className="text-sm text-text-light">Até 10% de volta em compras</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-brand">
                <p className="text-sm text-text-light"><strong>Gasto Médio/Mês:</strong> <span className="text-brand font-bold">R$ 29,90 - R$ 99,90</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparação Detalhada */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-text-light uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand"></span>
              Comparação
            </p>
            <h2 className="text-5xl sm:text-6xl font-bebas-neue tracking-wide leading-tight">
              <span className="text-text-light block">COMPARAÇÃO</span>
              <span className="text-brand block">COMPLETA</span>
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-sm">
              <thead>
                <tr className="border-b-2 border-brand">
                  <th className="px-6 py-4 text-left font-bold text-text-light">Benefício</th>
                  {cartaoPlanos.map((plan) => (
                    <th
                      key={plan.id}
                      className="px-6 py-4 text-center font-bold text-text-light"
                    >
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="px-6 py-4 font-semibold text-text-light">
                    Teleconsultas Clínico Geral/mês
                  </td>
                  <td className="px-6 py-4 text-center">5</td>
                  <td className="px-6 py-4 text-center">5</td>
                  <td className="px-6 py-4 text-center">5</td>
                </tr>
                <tr className="border-b">
                  <td className="px-6 py-4 font-semibold text-text-light">
                    Teleconsultas Especialista/mês
                  </td>
                  <td className="px-6 py-4 text-center">1</td>
                  <td className="px-6 py-4 text-center">-</td>
                  <td className="px-6 py-4 text-center">1</td>
                </tr>
                <tr className="border-b">
                  <td className="px-6 py-4 font-semibold text-text-light">
                    Uber Voucher/mês
                  </td>
                  <td className="px-6 py-4 text-center">-</td>
                  <td className="px-6 py-4 text-center">R$ 15</td>
                  <td className="px-6 py-4 text-center">R$ 25</td>
                </tr>
                <tr className="border-b">
                  <td className="px-6 py-4 font-semibold text-text-light">
                    Check-up Anual
                  </td>
                  <td className="px-6 py-4 text-center">-</td>
                  <td className="px-6 py-4 text-center">Gratuito*</td>
                  <td className="px-6 py-4 text-center">Gratuito*</td>
                </tr>
                <tr className="border-b">
                  <td className="px-6 py-4 font-semibold text-text-light">
                    Acesso LecuponFit
                  </td>
                  <td className="px-6 py-4 text-center">-</td>
                  <td className="px-6 py-4 text-center">-</td>
                  <td className="px-6 py-4 text-center">✓</td>
                </tr>
                <tr className="border-b">
                  <td className="px-6 py-4 font-semibold text-text-light">
                    Desconto Exames Laboratoriais
                  </td>
                  <td className="px-6 py-4 text-center">até 20%</td>
                  <td className="px-6 py-4 text-center">até 30%</td>
                  <td className="px-6 py-4 text-center">até 70%</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-semibold text-text-light">
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

      {/* Seção 10 - Garantias */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-text-light uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand"></span>
              Garantias
            </p>
            <h2 className="text-5xl sm:text-6xl font-bebas-neue tracking-wide leading-tight">
              <span className="text-text-light block">GARANTIAS E</span>
              <span className="text-brand block">CERTIFICADOS</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "📄", title: "Licenciado", desc: "Registro profissional validado" },
              { icon: "🔒", title: "Seguro", desc: "Dados criptografados e protegidos" },
              { icon: "💵", title: "Reembolso", desc: "Garantia de 30 dias ou dinheiro de volta" },
              { icon: "✅", title: "Aprovado", desc: "Certificado pela ANVISA" }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-bold text-text-light mb-2">{item.title}</h3>
                <p className="text-text-light text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-text-light uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand"></span>
              Dúvidas
            </p>
            <h2 className="text-5xl sm:text-6xl font-bebas-neue tracking-wide leading-tight">
              <span className="text-text-light block">PERGUNTAS</span>
              <span className="text-brand block">FREQUENTES</span>
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-gray-300 rounded-lg overflow-hidden bg-white">
                <button
                  onClick={() =>
                    setExpandedFaq(expandedFaq === idx ? null : idx)
                  }
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-bold text-text-light text-left">
                    {faq.question}
                  </h3>
                  <ChevronDown
                    className={`w-5 h-5 text-brand transition-transform flex-shrink-0 ${
                      expandedFaq === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedFaq === idx && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-text-light">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-gradient-to-r from-brand to-brand-dark text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bebas-neue tracking-wide mb-6">
            PRONTO PARA PROTEGER SUA SAÚDE?
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Escolha seu plano agora e comece a aproveitar todos os benefícios do Total Quality Care.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleOpenFormModal}
              className="bg-white text-brand hover:bg-gray-100 px-12 py-6 text-lg font-bold"
            >
              Contratar Agora
            </Button>
            <Button 
              onClick={() => handleCTAClick('cta_final_whatsapp')}
              variant="outline"
              className="border-white text-white hover:bg-white/10 px-12 py-6 text-lg font-bold"
            >
              Falar com Especialista
            </Button>
          </div>
        </div>
      </section>
      <Footer />
      <WhatsAppFAB />
      <LeadsFormModal 
        isOpen={isFormModalOpen} 
        onClose={() => setIsFormModalOpen(false)}
      />
    </div>
  );
}

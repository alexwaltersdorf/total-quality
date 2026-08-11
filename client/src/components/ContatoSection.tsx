/*
 * Style: Optik Editorial — Contact form with Google Maps
 * Theme: White background, dark gray #5A5A5A text, brand #9B212B
 * Integração: tRPC para persistir contatos no banco de dados
 */
import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  MapPin,
  Phone,
  Clock,
  MessageCircle,
  Send,
  Instagram,
  ArrowUpRight,
  Loader2,
  Mail,
} from "lucide-react";
// Import dinamico: o sonner (~64KB) so entra no bundle quando o usuario envia o
// formulario, em vez de pesar no chunk inicial de todas as paginas publicas.
const toast = {
  success: (msg: string) => import("sonner").then((m) => m.toast.success(msg)),
  info: (msg: string) => import("sonner").then((m) => m.toast.info(msg)),
  error: (msg: string) => import("sonner").then((m) => m.toast.error(msg)),
};
import { trpc } from "@/lib/trpc";
import { trackFormStart, trackFormSubmit, trackPhoneClick, trackWhatsAppClick, trackExternalLink, trackMapInteraction } from "@/lib/tracking";
import { trackLeadDirect } from "@/hooks/useAnalyticsTracker";
import { storeLeadHandoff } from "@/lib/leadHandoff";

export default function ContatoSection() {
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    email: "",
    tipoExame: "",
    mensagem: "",
  });
  const [formStarted, setFormStarted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocation] = useLocation();

  const contactMutation = trpc.contact.create.useMutation({
    onSuccess: () => {
      toast.success("Mensagem enviada com sucesso!");
      // O lead vai por sessionStorage, nunca pela URL: em query string ele
      // acabaria dentro do page_location do GA4 (ver lib/leadHandoff.ts).
      storeLeadHandoff(formData);
      setLocation("/formulario-sucesso");
      setFormData({ nome: "", telefone: "", email: "", tipoExame: "", mensagem: "" });
      setFormStarted(false);
    },
    onError: () => {
      toast.info("Redirecionando para confirmação...");
      storeLeadHandoff(formData);
      setLocation("/formulario-sucesso");
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    trackFormSubmit({ name: formData.nome, subject: formData.tipoExame });

    // Persistir contato no banco de dados
    contactMutation.mutate({
      name: formData.nome,
      email: formData.email,
      phone: formData.telefone || undefined,
      subject: formData.tipoExame || undefined,
      message: formData.mensagem,
    });

    // Rastrear como lead com UTM params
    trackLeadDirect("form_contato", {
      name: formData.nome,
      phone: formData.telefone || undefined,
      email: formData.email,
    });
  };

  const handleFormFocus = () => {
    if (!formStarted) {
      setFormStarted(true);
      trackFormStart();
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <section id="contato" className="py-24 lg:py-32 bg-surface-dark" aria-label="Contato e agendamento de exames de sangue e laboratoriais na Total Quality Caraguatatuba">
      <div className="container">
        {/* Section header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-16">
          <div>
            <span className="reveal section-label mb-4 block">Agende seu exame de sangue ou diagnóstico em Caraguatatuba</span>
            <h2 className="reveal heading-display text-5xl sm:text-6xl lg:text-7xl text-text" style={{ transitionDelay: "100ms" }}>
              ENTRE EM{" "}
              <br />
              <span className="text-brand">CONTATO</span>
            </h2>
          </div>
          <p className="reveal text-text-light max-w-md text-lg leading-relaxed" style={{ transitionDelay: "200ms" }}>
            Agende seu{" "}
            <Link href="/exames/exames-de-sangue" className="text-brand hover:underline">
              exame de sangue
            </Link>
            ,{" "}
            <Link href="/exames/hemograma" className="text-brand hover:underline">
              hemograma
            </Link>
            , glicemia, colesterol, hormônios,{" "}
            <Link href="/exames/tomografia-computadorizada" className="text-brand hover:underline">
              tomografia
            </Link>
            ,{" "}
            <Link href="/exames/ultrassonografia" className="text-brand hover:underline">
              ultrassonografia
            </Link>
            ,{" "}
            <Link href="/exames/mamografia" className="text-brand hover:underline">
              mamografia
            </Link>{" "}
            ou{" "}
            <Link href="/checkup" className="text-brand hover:underline">
              check-up
            </Link>{" "}
            na Total Quality em Caraguatatuba - SP. Atendemos de segunda a sexta, das 07h30 às 18h.
          </p>
        </div>

        <div className="divider-line mb-16" />

        {/* Mapa: iframe estatico com lazy loading.
            Substitui a Google Maps JS API, que carregava por um proxy de
            terceiros (forge.butterfly-effect.dev) fora do ar — o mapa estava
            quebrado em producao com ERR_FAILED/CORS. O iframe nao executa
            JavaScript nosso, so carrega quando entra no viewport e nao pesa
            no TBT. */}
        <div className="reveal mb-16">
          <iframe
            title="Localização da Total Quality Medicina Diagnóstica em Caraguatatuba - SP"
            src="https://www.google.com/maps?q=R.+Padre+Anchieta,+1010+-+Centro,+Caraguatatuba+-+SP,+11660-010&z=16&output=embed"
            className="w-full h-[350px] lg:h-[450px] border-0"
            width={1200}
            height={450}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Contact info */}
          <div className="lg:col-span-4 space-y-8">
            <div className="reveal">
              <div className="space-y-8">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <MapPin className="w-4 h-4 text-brand" />
                    <span className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted">Endereço</span>
                  </div>
                  <p className="text-text font-medium">R. Padre Anchieta, 1010</p>
                  <p className="text-text-light">Centro, Caraguatatuba - SP</p>
                  <p className="text-text-muted text-sm">CEP 11660-010</p>
                </div>

                <div className="border-t border-black/10 pt-8">
                  <div className="flex items-center gap-3 mb-3">
                    <Phone className="w-4 h-4 text-brand" />
                    <span className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted">Telefones</span>
                  </div>
                  <div className="space-y-3">
                    <a href="tel:+551238873535" className="flex items-center justify-center px-6 py-3 bg-[#4A4A4A] text-white rounded-full hover:bg-[#3A3A3A] transition-colors font-semibold text-center" onClick={() => trackPhoneClick("contato_section")}>
                      LIGAR: (12) 3887-3535
                    </a>
                    <a href="https://wa.me/551238873535?text=Olá! Gostaria de informações." className="flex items-center justify-center px-6 py-3 bg-[#25D366] text-white rounded-full hover:bg-[#1da851] transition-colors font-semibold text-center" onClick={() => trackWhatsAppClick("contato_section")}>
                      WHATSAPP: (12) 3887-3535
                    </a>
                  </div>
                </div>

                <div className="border-t border-black/10 pt-8">
                  <div className="flex items-center gap-3 mb-3">
                    <Mail className="w-4 h-4 text-brand" />
                    <span className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted">E-mail</span>
                  </div>
                  <a href="mailto:contato@totalquality.med.br" className="block text-text font-medium hover:text-brand transition-colors">contato@totalquality.med.br</a>
                </div>

                <div className="border-t border-black/10 pt-8">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="w-4 h-4 text-brand" />
                    <span className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted">Horário</span>
                  </div>
                  <p className="text-text font-medium">Segunda a Sexta</p>
                  <p className="text-text-light">07h30 às 18h</p>
                </div>
              </div>

              {/* Quick actions */}
              <div className="mt-10 space-y-3">
                <button
                  onClick={() => { trackWhatsAppClick("contato_quick_action"); window.open("https://wa.me/551238873535?text=Olá! Gostaria de informações.", "_blank"); }}
                  className="btn-pill w-full justify-center !bg-[#25D366] hover:!bg-[#1da851] !text-white"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </button>
              </div>

              {/* Social */}
              <div className="mt-8 pt-8 border-t border-black/10">
                <a
                  href="https://www.instagram.com/totalqualitymedicina"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 text-sm text-text-muted hover:text-brand transition-colors"
                  onClick={() => trackExternalLink("instagram", "https://www.instagram.com/totalqualitymedicina")}
                >
                  <Instagram className="w-5 h-5" />
                  @totalqualitymedicina
                </a>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-8">
            <div className="reveal bg-white p-8 lg:p-12 shadow-sm border border-black/5" style={{ transitionDelay: "200ms" }}>
              <h3 className="heading-display text-3xl text-text mb-8">ENVIE UMA MENSAGEM</h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="nome" className="block text-xs font-semibold uppercase tracking-[0.15em] text-text-muted mb-2">
                      Nome *
                    </label>
                    <input
                      type="text"
                      id="nome"
                      required
                      value={formData.nome}
                      onChange={(e) => handleChange("nome", e.target.value)}
                      onFocus={handleFormFocus}
                      className="w-full px-0 py-3 bg-transparent border-0 border-b border-black/15 text-text focus:outline-none focus:border-brand transition-colors placeholder:text-text-muted/50"
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <div>
                    <label htmlFor="telefone" className="block text-xs font-semibold uppercase tracking-[0.15em] text-text-muted mb-2">
                      Telefone *
                    </label>
                    <input
                      type="tel"
                      id="telefone"
                      required
                      value={formData.telefone}
                      onChange={(e) => handleChange("telefone", e.target.value)}
                      className="w-full px-0 py-3 bg-transparent border-0 border-b border-black/15 text-text focus:outline-none focus:border-brand transition-colors placeholder:text-text-muted/50"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-[0.15em] text-text-muted mb-2">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="w-full px-0 py-3 bg-transparent border-0 border-b border-black/15 text-text focus:outline-none focus:border-brand transition-colors placeholder:text-text-muted/50"
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="tipoExame" className="block text-xs font-semibold uppercase tracking-[0.15em] text-text-muted mb-2">
                      Tipo de Exame
                    </label>
                    <input
                      type="text"
                      id="tipoExame"
                      value={formData.tipoExame}
                      onChange={(e) => handleChange("tipoExame", e.target.value)}
                      className="w-full px-0 py-3 bg-transparent border-0 border-b border-black/15 text-text focus:outline-none focus:border-brand transition-colors placeholder:text-text-muted/50"
                      placeholder="Ex: Tomografia, ECG..."
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="mensagem" className="block text-xs font-semibold uppercase tracking-[0.15em] text-text-muted mb-2">
                    Mensagem *
                  </label>
                  <textarea
                    id="mensagem"
                    required
                    rows={4}
                    value={formData.mensagem}
                    onChange={(e) => handleChange("mensagem", e.target.value)}
                    className="w-full px-0 py-3 bg-transparent border-0 border-b border-black/15 text-text focus:outline-none focus:border-brand transition-colors resize-none placeholder:text-text-muted/50"
                    placeholder="Como podemos ajudá-lo?"
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <p className="text-xs text-text-muted">
                    * Campos obrigatórios
                  </p>
                  <button type="submit" className="btn-pill-brand btn-pill" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Enviar
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

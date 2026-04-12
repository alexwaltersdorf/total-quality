/*
 * Style: Optik Editorial — Clean contact section with editorial form
 * Contato: Split layout with info + form, minimal styling
 */
import { useState } from "react";
import {
  MapPin,
  Phone,
  Clock,
  MessageCircle,
  Send,
  Instagram,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "sonner";

export default function ContatoSection() {
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    email: "",
    tipoExame: "",
    mensagem: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `Olá! Meu nome é ${formData.nome}.%0A` +
      `Telefone: ${formData.telefone}%0A` +
      `E-mail: ${formData.email}%0A` +
      (formData.tipoExame ? `Exame: ${formData.tipoExame}%0A` : "") +
      (formData.mensagem ? `Mensagem: ${formData.mensagem}` : "");
    window.open(`https://wa.me/5512997743535?text=${msg}`, "_blank");
    toast.success("Redirecionando para o WhatsApp...");
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <section id="contato" className="py-24 lg:py-32 bg-[#f7f7f5]">
      <div className="container">
        {/* Section header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-16">
          <div>
            <span className="reveal section-label mb-4 block">Fale Conosco</span>
            <h2 className="reveal heading-display text-5xl sm:text-6xl lg:text-7xl text-foreground" style={{ transitionDelay: "100ms" }}>
              ENTRE EM
              <br />
              <span className="text-brand">CONTATO</span>
            </h2>
          </div>
          <p className="reveal text-muted-foreground max-w-md text-lg leading-relaxed" style={{ transitionDelay: "200ms" }}>
            Estamos prontos para atendê-lo. Entre em contato e agende seu exame.
          </p>
        </div>

        <div className="divider-line mb-16" />

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Contact info */}
          <div className="lg:col-span-4 space-y-8">
            <div className="reveal">
              <div className="space-y-8">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <MapPin className="w-4 h-4 text-brand" />
                    <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Endereço</span>
                  </div>
                  <p className="text-foreground font-medium">Rua Padre Anchieta, 1010</p>
                  <p className="text-muted-foreground">Centro, Caraguatatuba-SP</p>
                  <p className="text-muted-foreground text-sm">CEP 11660-010</p>
                </div>

                <div className="border-t border-black/10 pt-8">
                  <div className="flex items-center gap-3 mb-3">
                    <Phone className="w-4 h-4 text-brand" />
                    <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Telefones</span>
                  </div>
                  <a href="tel:1238873535" className="block text-foreground font-medium hover:text-brand transition-colors">(12) 3887-3535</a>
                  <a href="https://wa.me/5512997743535" className="block text-foreground font-medium hover:text-brand transition-colors">(12) 99774-3535</a>
                </div>

                <div className="border-t border-black/10 pt-8">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="w-4 h-4 text-brand" />
                    <span className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">Horário</span>
                  </div>
                  <p className="text-foreground font-medium">Segunda a Sexta</p>
                  <p className="text-muted-foreground">08h às 18h</p>
                </div>
              </div>

              {/* Quick actions */}
              <div className="mt-10 space-y-3">
                <button
                  onClick={() => window.open("https://wa.me/5512997743535?text=Olá! Gostaria de informações.", "_blank")}
                  className="btn-pill w-full justify-center bg-[#25D366] hover:!bg-[#1da851]"
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
                  className="inline-flex items-center gap-3 text-sm text-muted-foreground hover:text-brand transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                  @totalqualitymedicina
                </a>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-8">
            <div className="reveal bg-white p-8 lg:p-12" style={{ transitionDelay: "200ms" }}>
              <h3 className="heading-display text-3xl text-foreground mb-8">ENVIE UMA MENSAGEM</h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="nome" className="block text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-2">
                      Nome *
                    </label>
                    <input
                      type="text"
                      id="nome"
                      required
                      value={formData.nome}
                      onChange={(e) => handleChange("nome", e.target.value)}
                      className="w-full px-0 py-3 bg-transparent border-0 border-b border-black/15 text-foreground focus:outline-none focus:border-brand transition-colors placeholder:text-muted-foreground/50"
                      placeholder="Seu nome completo"
                    />
                  </div>
                  <div>
                    <label htmlFor="telefone" className="block text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-2">
                      Telefone *
                    </label>
                    <input
                      type="tel"
                      id="telefone"
                      required
                      value={formData.telefone}
                      onChange={(e) => handleChange("telefone", e.target.value)}
                      className="w-full px-0 py-3 bg-transparent border-0 border-b border-black/15 text-foreground focus:outline-none focus:border-brand transition-colors placeholder:text-muted-foreground/50"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-2">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="w-full px-0 py-3 bg-transparent border-0 border-b border-black/15 text-foreground focus:outline-none focus:border-brand transition-colors placeholder:text-muted-foreground/50"
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="tipoExame" className="block text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-2">
                      Tipo de Exame
                    </label>
                    <input
                      type="text"
                      id="tipoExame"
                      value={formData.tipoExame}
                      onChange={(e) => handleChange("tipoExame", e.target.value)}
                      className="w-full px-0 py-3 bg-transparent border-0 border-b border-black/15 text-foreground focus:outline-none focus:border-brand transition-colors placeholder:text-muted-foreground/50"
                      placeholder="Ex: Tomografia, ECG..."
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="mensagem" className="block text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-2">
                    Mensagem *
                  </label>
                  <textarea
                    id="mensagem"
                    required
                    rows={4}
                    value={formData.mensagem}
                    onChange={(e) => handleChange("mensagem", e.target.value)}
                    className="w-full px-0 py-3 bg-transparent border-0 border-b border-black/15 text-foreground focus:outline-none focus:border-brand transition-colors resize-none placeholder:text-muted-foreground/50"
                    placeholder="Como podemos ajudá-lo?"
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <p className="text-xs text-muted-foreground">
                    * Campos obrigatórios
                  </p>
                  <button type="submit" className="btn-pill-brand btn-pill">
                    <Send className="w-3.5 h-3.5" />
                    Enviar
                    <ArrowUpRight className="w-3.5 h-3.5" />
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

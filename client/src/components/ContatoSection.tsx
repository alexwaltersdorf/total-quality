/*
 * Design: "Warm Clinical" — Humanized Material Design 3
 * Contato: Split layout with contact info + form with floating labels
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Phone,
  Clock,
  MessageCircle,
  Send,
  Instagram,
  Facebook,
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
    // Build WhatsApp message
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
    <section id="contato" className="py-20 lg:py-28 bg-secondary/50">
      <div className="container">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="reveal inline-block text-sm font-semibold text-teal-600 tracking-wider uppercase mb-3">
            Fale Conosco
          </span>
          <h2 className="reveal text-3xl sm:text-4xl font-bold text-foreground mb-4" style={{ transitionDelay: "100ms" }}>
            Entre em <span className="text-teal-600">Contato</span>
          </h2>
          <p className="reveal text-lg text-muted-foreground" style={{ transitionDelay: "200ms" }}>
            Estamos prontos para atendê-lo. Entre em contato conosco e agende seu exame
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="reveal bg-card rounded-[28px] p-8 border border-border/50">
              <h3 className="text-xl font-semibold text-foreground mb-6">Informações de Contato</h3>

              <div className="space-y-5">
                <div className="flex gap-4">
                  <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Endereço</p>
                    <p className="text-muted-foreground text-sm">Rua Padre Anchieta, 1010 - Centro</p>
                    <p className="text-muted-foreground text-sm">Caraguatatuba-SP, CEP 11660-010</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Telefones</p>
                    <a href="tel:1238873535" className="text-teal-600 hover:text-teal-700 text-sm block">(12) 3887-3535</a>
                    <a href="https://wa.me/5512997743535" className="text-teal-600 hover:text-teal-700 text-sm block">(12) 99774-3535</a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">Horário</p>
                    <p className="text-muted-foreground text-sm">Segunda a Sexta</p>
                    <p className="text-muted-foreground text-sm">08h às 18h</p>
                  </div>
                </div>
              </div>

              {/* Quick action buttons */}
              <div className="mt-6 space-y-3">
                <Button
                  className="w-full rounded-full bg-green-600 hover:bg-green-700 text-white ripple-effect"
                  onClick={() => window.open("https://wa.me/5512997743535?text=Olá! Gostaria de informações.", "_blank")}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-full border-teal-200 text-teal-700 hover:bg-teal-50"
                  onClick={() => window.open("tel:1238873535")}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Ligar
                </Button>
              </div>

              {/* Social */}
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm font-medium text-foreground mb-3">Siga-nos nas redes sociais</p>
                <div className="flex gap-3">
                  <a
                    href="https://www.instagram.com/totalqualitymedicina"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 hover:bg-teal-100 transition-colors"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a
                    href="#"
                    className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 hover:bg-teal-100 transition-colors"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                </div>
                <p className="text-sm text-muted-foreground mt-2">@totalqualitymedicina</p>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-3">
            <div className="reveal bg-card rounded-[28px] p-8 border border-border/50" style={{ transitionDelay: "200ms" }}>
              <h3 className="text-xl font-semibold text-foreground mb-6">Envie uma Mensagem</h3>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  {/* Nome */}
                  <div className="relative">
                    <input
                      type="text"
                      id="nome"
                      required
                      value={formData.nome}
                      onChange={(e) => handleChange("nome", e.target.value)}
                      className="peer w-full px-4 pt-6 pb-2 bg-muted/50 border border-border rounded-2xl text-foreground placeholder-transparent focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
                      placeholder="Nome"
                    />
                    <label
                      htmlFor="nome"
                      className="absolute left-4 top-2 text-xs font-medium text-muted-foreground transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-teal-600"
                    >
                      Nome *
                    </label>
                  </div>

                  {/* Telefone */}
                  <div className="relative">
                    <input
                      type="tel"
                      id="telefone"
                      required
                      value={formData.telefone}
                      onChange={(e) => handleChange("telefone", e.target.value)}
                      className="peer w-full px-4 pt-6 pb-2 bg-muted/50 border border-border rounded-2xl text-foreground placeholder-transparent focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
                      placeholder="Telefone"
                    />
                    <label
                      htmlFor="telefone"
                      className="absolute left-4 top-2 text-xs font-medium text-muted-foreground transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-teal-600"
                    >
                      Telefone *
                    </label>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  {/* Email */}
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="peer w-full px-4 pt-6 pb-2 bg-muted/50 border border-border rounded-2xl text-foreground placeholder-transparent focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
                      placeholder="E-mail"
                    />
                    <label
                      htmlFor="email"
                      className="absolute left-4 top-2 text-xs font-medium text-muted-foreground transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-teal-600"
                    >
                      E-mail *
                    </label>
                  </div>

                  {/* Tipo de Exame */}
                  <div className="relative">
                    <input
                      type="text"
                      id="tipoExame"
                      value={formData.tipoExame}
                      onChange={(e) => handleChange("tipoExame", e.target.value)}
                      className="peer w-full px-4 pt-6 pb-2 bg-muted/50 border border-border rounded-2xl text-foreground placeholder-transparent focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
                      placeholder="Tipo de Exame"
                    />
                    <label
                      htmlFor="tipoExame"
                      className="absolute left-4 top-2 text-xs font-medium text-muted-foreground transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-teal-600"
                    >
                      Tipo de Exame
                    </label>
                  </div>
                </div>

                {/* Mensagem */}
                <div className="relative">
                  <textarea
                    id="mensagem"
                    required
                    rows={4}
                    value={formData.mensagem}
                    onChange={(e) => handleChange("mensagem", e.target.value)}
                    className="peer w-full px-4 pt-6 pb-2 bg-muted/50 border border-border rounded-2xl text-foreground placeholder-transparent focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all resize-none"
                    placeholder="Mensagem"
                  />
                  <label
                    htmlFor="mensagem"
                    className="absolute left-4 top-2 text-xs font-medium text-muted-foreground transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs peer-focus:text-teal-600"
                  >
                    Mensagem *
                  </label>
                </div>

                <p className="text-xs text-muted-foreground">
                  * Campos obrigatórios. Seus dados estão protegidos.
                </p>

                <Button
                  type="submit"
                  className="w-full sm:w-auto rounded-full bg-teal-600 hover:bg-teal-700 text-white px-8 py-5 shadow-sm hover:shadow-md transition-all ripple-effect"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Mensagem
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

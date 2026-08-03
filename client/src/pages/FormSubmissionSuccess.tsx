/*
 * Style: Optik Editorial — Success page with countdown
 * Theme: White background, dark gray #5A5A5A text, brand #9B212B
 * Page: Página de sucesso após envio de formulário de contato
 */
import { useEffect, useState } from "react";
import { trackWhatsAppConversion } from "@/lib/tracking";
import { CheckCircle, ArrowUpRight, Phone } from "lucide-react";
import { useLocation } from "wouter";

export default function FormSubmissionSuccess() {
  const [location, setLocation] = useLocation();
  const [countdown, setCountdown] = useState(5);
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    email: "",
    tipoExame: "",
    mensagem: "",
  });

  useEffect(() => {
    // Extrair dados da URL
    const params = new URLSearchParams(window.location.search);
    setFormData({
      nome: params.get("nome") || "",
      telefone: params.get("telefone") || "",
      email: params.get("email") || "",
      tipoExame: params.get("tipoExame") || "",
      mensagem: params.get("mensagem") || "",
    });

    // Countdown de 5 segundos
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirecionar para WhatsApp após 5 segundos
          const msg = `Olá! Meu nome é ${params.get("nome") || "Cliente"}.%0A` +
            `Telefone: ${params.get("telefone") || "Não informado"}%0A` +
            `E-mail: ${params.get("email") || "Não informado"}%0A` +
            (params.get("tipoExame") ? `Exame: ${params.get("tipoExame")}%0A` : "") +
            (params.get("mensagem") ? `Mensagem: ${params.get("mensagem")}` : "");
          trackWhatsAppConversion("form_success_cta", "form_success");
    window.open(`https://wa.me/551238873535?text=${msg}`, "_blank");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleWhatsAppNow = () => {
    const msg = `Olá! Meu nome é ${formData.nome}.%0A` +
      `Telefone: ${formData.telefone}%0A` +
      `E-mail: ${formData.email}%0A` +
      (formData.tipoExame ? `Exame: ${formData.tipoExame}%0A` : "") +
      (formData.mensagem ? `Mensagem: ${formData.mensagem}` : "");
    trackWhatsAppConversion("form_success_cta", "form_success");
    window.open(`https://wa.me/551238873535?text=${msg}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <CheckCircle className="w-24 h-24 text-brand animate-bounce" />
            <div className="absolute inset-0 bg-brand/20 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <h1 className="heading-display text-4xl lg:text-5xl mb-4 text-text">
          MENSAGEM <span className="text-brand">ENVIADA!</span>
        </h1>

        {/* Description */}
        <p className="text-lg text-text-muted mb-8 leading-relaxed">
          Obrigado por entrar em contato com a Total Quality! Seus dados foram registrados com sucesso.
        </p>

        {/* Form Data Summary */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left space-y-3">
          {formData.nome && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted mb-1">Nome</p>
              <p className="text-text font-medium">{formData.nome}</p>
            </div>
          )}
          {formData.email && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted mb-1">E-mail</p>
              <p className="text-text font-medium">{formData.email}</p>
            </div>
          )}
          {formData.telefone && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted mb-1">Telefone</p>
              <p className="text-text font-medium">{formData.telefone}</p>
            </div>
          )}
          {formData.tipoExame && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted mb-1">Tipo de Exame</p>
              <p className="text-text font-medium">{formData.tipoExame}</p>
            </div>
          )}
        </div>

        {/* Countdown */}
        <div className="mb-8">
          <p className="text-text-muted mb-3">
            Redirecionando para WhatsApp em <span className="font-bold text-brand">{countdown}s</span>
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-brand h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(countdown / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleWhatsAppNow}
            className="btn-pill w-full justify-center !bg-[#25D366] hover:!bg-[#1da851] !text-white"
          >
            <Phone className="w-4 h-4" />
            Ir para WhatsApp Agora
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setLocation("/")}
            className="btn-pill w-full justify-center bg-transparent !text-text border border-black/20 hover:!bg-black/5"
          >
            Voltar para Home
          </button>
        </div>

        {/* Info Text */}
        <p className="text-xs text-text-muted mt-8">
          Seus dados foram salvos e serão utilizados para melhorar nosso atendimento. Você será redirecionado para o WhatsApp para continuar a conversa.
        </p>
      </div>
    </div>
  );
}

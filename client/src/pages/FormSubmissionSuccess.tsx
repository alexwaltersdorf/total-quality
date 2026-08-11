/*
 * Style: Optik Editorial — Success page with countdown
 * Theme: White background, dark gray #5A5A5A text, brand #9B212B
 * Page: Página de sucesso após envio de formulário de contato
 *
 * A URL desta rota e SEMPRE limpa. Os dados do lead chegam por sessionStorage
 * (lib/leadHandoff.ts) e sao consumidos uma unica vez; sem eles a pagina exibe
 * uma confirmacao neutra em vez de quebrar. Dado clinico (tipo de exame e
 * mensagem) nao e reexibido na tela — segue apenas na mensagem do WhatsApp,
 * que vai para o canal da propria clinica.
 */
import { useEffect, useRef, useState } from "react";
import { trackWhatsAppConversion } from "@/lib/tracking";
import { consumeLeadHandoff, type LeadHandoff } from "@/lib/leadHandoff";
import { CheckCircle, ArrowUpRight, Phone } from "lucide-react";
import { useLocation } from "wouter";

const WHATSAPP_NUMBER = "551238873535";

/** Monta a mensagem pre-preenchida do WhatsApp a partir do lead em memoria. */
function buildWhatsAppMessage(lead: LeadHandoff | null): string {
  if (!lead) return "Olá! Gostaria de agendar um exame.";
  const linhas = [
    `Olá! Meu nome é ${lead.nome || "Cliente"}.`,
    `Telefone: ${lead.telefone || "Não informado"}`,
    `E-mail: ${lead.email || "Não informado"}`,
  ];
  if (lead.tipoExame) linhas.push(`Exame: ${lead.tipoExame}`);
  if (lead.mensagem) linhas.push(`Mensagem: ${lead.mensagem}`);
  return linhas.join("\n");
}

export default function FormSubmissionSuccess() {
  const [, setLocation] = useLocation();
  const [countdown, setCountdown] = useState(5);
  const [nome, setNome] = useState("");
  // Ref, e nao state: o lead precisa sobreviver ao duplo-render do StrictMode
  // sem ser lido duas vezes do storage (a leitura apaga o registro).
  const leadRef = useRef<LeadHandoff | null>(null);

  const openWhatsApp = () => {
    const msg = encodeURIComponent(buildWhatsAppMessage(leadRef.current));
    trackWhatsAppConversion("form_success_cta", "form_success");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    if (!leadRef.current) {
      const lead = consumeLeadHandoff();
      if (lead) {
        leadRef.current = lead;
        setNome(lead.nome);
      }
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          openWhatsApp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
          {nome ? `Obrigado por entrar em contato, ${nome}! ` : "Obrigado por entrar em contato com a Total Quality! "}
          Recebemos sua mensagem e nossa equipe vai retornar em breve.
        </p>

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
            onClick={openWhatsApp}
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
          Seus dados foram registrados com segurança e usados apenas para o seu atendimento. Você será
          redirecionado para o WhatsApp para continuar a conversa.
        </p>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Phone, Heart, CheckCircle } from "lucide-react";
import { trackPhoneClick } from "@/lib/tracking";

/**
 * Página de agradecimento após clique em "Ligar"
 * Rota: /obrigado-chamada
 * Exibe mensagem de agradecimento por 3 segundos
 * Depois redireciona para tel:+551238873535
 *
 * Fluxo: Usuário clica em "Ligar" → CallRedirect → ThankYouCall (3s) → tel:+551238873535
 */
export default function ThankYouCall() {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Track que o usuário chegou na página de agradecimento
    trackPhoneClick("thank_you_call_page");

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Redirecionar para chamada telefônica
          window.location.href = "tel:+551238873535";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand to-brand-dark flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Icon animation */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-24 h-24">
            {/* Outer circle pulse */}
            <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
            {/* Middle circle */}
            <div className="absolute inset-2 rounded-full bg-white/30 flex items-center justify-center">
              {/* Inner icon */}
              <div className="bg-white rounded-full p-5 shadow-lg">
                <Phone className="w-8 h-8 text-brand animate-bounce" />
              </div>
            </div>
          </div>
        </div>

        {/* Main message */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-2">
            <CheckCircle className="w-8 h-8" />
            Obrigado!
          </h1>
          <p className="text-xl text-white/90 mb-2">
            Sua chamada será iniciada em breve
          </p>
          <p className="text-sm text-white/70">
            Se a chamada não iniciar automaticamente, clique no botão abaixo
          </p>
        </div>

        {/* Countdown display */}
        <div className="mb-8 flex justify-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 border border-white/30">
            <div className="text-5xl font-bold text-white">{countdown}</div>
            <p className="text-white/80 text-sm mt-2">segundos</p>
          </div>
        </div>

        {/* Manual call button */}
        <a
          href="tel:+551238873535"
          onClick={() => trackPhoneClick("obrigado_chamada")}
          className="inline-flex items-center gap-3 px-8 py-4 bg-white text-brand font-semibold rounded-full hover:bg-white/90 transition-all shadow-lg hover:shadow-xl"
        >
          <Phone className="w-5 h-5" />
          Ligar Agora: (12) 3887-3535
        </a>

        {/* Footer message */}
        <div className="mt-12 text-white/60 text-sm">
          <p className="flex items-center justify-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-white/40" />
            Total Quality Medicina Diagnóstica
          </p>
          <p>Estamos aqui para cuidar da sua saúde</p>
        </div>
      </div>
    </div>
  );
}

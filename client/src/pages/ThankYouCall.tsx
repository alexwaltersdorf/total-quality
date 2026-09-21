import { useEffect, useRef, useState } from "react";
import { Phone, Heart, CheckCircle } from "lucide-react";
import { trackPhoneClick } from "@/lib/tracking";
import { MARCA_LIGACAO_QUALIFICADA, useTelefoneRedirect } from "@/contexts/ContatoLeadContext";

/**
 * Rota /obrigado-chamada — o unico ponto do site que de fato disca.
 *
 * Fluxo: /ligar abre o formulario de qualificacao; com o formulario enviado,
 * CallRedirect manda para ca e aqui a chamada comeca. O salto existe porque
 * esta URL pode estar cadastrada como gatilho de conversao no GTM.
 *
 * QUEM CHEGA AQUI SEM PASSAR PELO FORMULARIO nao disca: desde 21/09/2026 a
 * regra e que nenhum pedido de contato sai do site sem lead, e esta pagina
 * tem URL propria — bastaria digita-la para contornar o formulario. Nesse
 * caso, em vez do contador, abrimos o formulario.
 */
export default function ThankYouCall() {
  const [countdown, setCountdown] = useState(3);
  const abrirTelefone = useTelefoneRedirect();
  // Lazy de proposito: consumir() apaga a marca, entao nao pode rodar a cada
  // render.
  const [qualificada] = useState(() => MARCA_LIGACAO_QUALIFICADA.consumir());
  const jaAbriu = useRef(false);

  const pedirQualificacao = () => {
    jaAbriu.current = true;
    abrirTelefone("obrigado_chamada_direto", () => {
      MARCA_LIGACAO_QUALIFICADA.marcar();
      window.location.reload();
    });
  };

  useEffect(() => {
    if (!qualificada) {
      // StrictMode monta duas vezes em desenvolvimento.
      if (jaAbriu.current) return;
      pedirQualificacao();
      return;
    }

    // Track que o usuário chegou na página de agradecimento
    trackPhoneClick("thank_you_call_page");

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Unico tel: do site. Todos os outros pontos passam pelo formulario
          // e desembocam aqui (ver contexts/ContatoLeadContext.tsx).
          window.location.href = "tel:+551238873535";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qualificada]);

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
            {qualificada
              ? "Sua chamada será iniciada em breve"
              : "Só falta um passo para ligar"}
          </p>
          <p className="text-sm text-white/70">
            {qualificada
              ? "Se a chamada não iniciar automaticamente, clique no botão abaixo"
              : "Preencha seus dados para que possamos retornar se a ligação não completar"}
          </p>
        </div>

        {/* Countdown display */}
        {qualificada && (
          <div className="mb-8 flex justify-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 border border-white/30">
              <div className="text-5xl font-bold text-white">{countdown}</div>
              <p className="text-white/80 text-sm mt-2">segundos</p>
            </div>
          </div>
        )}

        {/* Manual call button */}
        {qualificada ? (
          <a
            href="tel:+551238873535"
            onClick={() => trackPhoneClick("obrigado_chamada")}
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-brand font-semibold rounded-full hover:bg-white/90 transition-all shadow-lg hover:shadow-xl"
          >
            <Phone className="w-5 h-5" />
            Ligar Agora: (12) 3887-3535
          </a>
        ) : (
          <button
            type="button"
            onClick={pedirQualificacao}
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-brand font-semibold rounded-full hover:bg-white/90 transition-all shadow-lg hover:shadow-xl"
          >
            <Phone className="w-5 h-5" />
            Ligar Agora: (12) 3887-3535
          </button>
        )}

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

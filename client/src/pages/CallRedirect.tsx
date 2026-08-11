import { useEffect } from "react";
import { useLocation } from "wouter";
import { trackPhoneClick } from "@/lib/tracking";

/**
 * Página de redirecionamento para chamada telefônica
 * Rota: /ligar
 * Redireciona para: /obrigado-chamada (página de agradecimento)
 * Depois a página de agradecimento redireciona para: tel:+551238873535
 *
 * Fluxo: Clique em "Ligar" → /ligar → /obrigado-chamada (3s) → tel:+551238873535
 * Uso: <a href="/ligar">Ligar</a>
 */
export default function CallRedirect() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Track o clique em "Ligar"
    trackPhoneClick("call_redirect_page");

    // Redirecionar para página de agradecimento (que depois redireciona para tel:)
    setLocation("/obrigado-chamada");
  }, [setLocation]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center">
        <p className="text-lg text-gray-600 mb-4">Preparando chamada...</p>
        <p className="text-sm text-gray-500">Se não funcionar, clique aqui: <a href="tel:+551238873535" onClick={() => trackPhoneClick("ligar_fallback")} className="text-brand underline">+55 (12) 3887-3535</a></p>
      </div>
    </div>
  );
}

import { useEffect } from "react";

/**
 * Página de redirecionamento para chamada telefônica
 * Rota: /ligar
 * Redireciona para: tel:+551238873535
 *
 * Uso: <a href="/ligar">Ligar</a>
 */
export default function CallRedirect() {
  useEffect(() => {
    // Redirecionar para protocolo tel: com formato internacional
    window.location.href = "tel:+551238873535";
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center">
        <p className="text-lg text-gray-600 mb-4">Redirecionando para chamada telefônica...</p>
        <p className="text-sm text-gray-500">Se não funcionar, clique aqui: <a href="tel:+551238873535" className="text-brand underline">+55 (12) 3887-3535</a></p>
      </div>
    </div>
  );
}

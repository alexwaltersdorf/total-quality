import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { MARCA_LIGACAO_QUALIFICADA, useTelefoneRedirect } from "@/contexts/ContatoLeadContext";

/**
 * Rota /ligar — porta de entrada para pedidos de ligacao que vem de FORA do
 * site (extensao de chamada do Google Ads, perfil do Google, links avulsos).
 * Nenhuma pagina do site aponta para ca.
 *
 * Ate 21/09/2026 esta pagina apenas redirecionava e o numero ia direto para o
 * discador, sem deixar lead nenhum. Agora abre o mesmo formulario de
 * qualificacao dos demais botoes de telefone; com o formulario enviado, segue
 * para /obrigado-chamada, que e quem disca.
 *
 * O salto por /obrigado-chamada foi mantido de proposito: essa URL pode estar
 * cadastrada como gatilho de conversao no GTM, e tirar o salto apagaria a
 * conversao sem aviso.
 */
export default function CallRedirect() {
  const [, setLocation] = useLocation();
  const abrirTelefone = useTelefoneRedirect();
  const jaAbriu = useRef(false);

  const seguir = () => {
    MARCA_LIGACAO_QUALIFICADA.marcar();
    setLocation("/obrigado-chamada");
  };

  useEffect(() => {
    // O StrictMode monta duas vezes em desenvolvimento; sem a trava o
    // phone_click sairia duplicado.
    if (jaAbriu.current) return;
    jaAbriu.current = true;
    abrirTelefone("call_redirect_page", () => {
      MARCA_LIGACAO_QUALIFICADA.marcar();
      setLocation("/obrigado-chamada");
    });
  }, [abrirTelefone, setLocation]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center px-4">
        <p className="text-lg text-gray-600 mb-4">Preparando chamada...</p>
        <p className="text-sm text-gray-500">
          Se o formulário não abrir,{" "}
          <button
            type="button"
            onClick={() => abrirTelefone("ligar_fallback", seguir)}
            className="text-brand underline"
          >
            clique aqui
          </button>
          .
        </p>
      </div>
    </div>
  );
}

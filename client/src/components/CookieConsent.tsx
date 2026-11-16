/*
 * Banner de cookies (LGPD) + Consent Mode v2.
 *
 * O padrão de consentimento é NEGADO (definido inline no index.html, antes do
 * GTM). Este banner registra a escolha do visitante em localStorage
 * ("tq-consent") e envia gtag('consent','update',...) — o GTM e as tags do
 * Google reagem sozinhos. "Somente essenciais" mantém tudo negado: o GA4
 * segue medindo em modo cookieless (pings modelados, sem identificar).
 *
 * A escolha pode ser revista limpando os dados do site no navegador; a
 * política completa vive em /privacidade.
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { trackConsentGranted } from "@/lib/tracking";

const STORAGE_KEY = "tq-consent";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function updateConsent(granted: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, granted ? "granted" : "denied");
  } catch {
    // navegação privada sem storage: consentimento vale só para a sessão
  }
  const value = granted ? "granted" : "denied";
  window.gtag?.("consent", "update", {
    ad_storage: value,
    analytics_storage: value,
    ad_user_data: value,
    ad_personalization: value,
  });
  if (granted) trackConsentGranted();
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      stored = null;
    }
    if (!stored) setVisible(true);
  }, []);

  if (!visible) return null;

  const choose = (granted: boolean) => {
    updateConsent(granted);
    setVisible(false);
  };

  return (
    // Compacto (auditoria de design, 18/10/2026): no celular o aviso cobria um
    // terco da tela e escondia o botao principal de todas as paginas. Os dois
    // botoes tem o mesmo peso visual — a LGPD pede escolha livre, entao
    // "Somente essenciais" nao pode parecer a opcao de segunda classe.
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed bottom-0 inset-x-0 z-[60] bg-white border-t border-black/10 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-3 sm:py-4"
    >
      <div className="container flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-6 !px-0 sm:!px-6">
        <p className="text-[13px] sm:text-sm text-text-light leading-snug flex-1">
          Usamos cookies para medir o uso do site; nos essenciais, a medição é anônima.{" "}
          <Link href="/privacidade" className="text-brand underline underline-offset-2">
            Privacidade
          </Link>
        </p>
        <div className="grid grid-cols-2 gap-2 shrink-0 sm:flex">
          <button
            onClick={() => choose(false)}
            className="min-h-[44px] px-4 text-sm rounded-full border border-black/20 text-text font-semibold hover:bg-black/5 transition-colors"
          >
            Só essenciais
          </button>
          <button
            onClick={() => choose(true)}
            className="min-h-[44px] px-4 text-sm rounded-full border border-black/20 text-text font-semibold hover:bg-black/5 transition-colors"
          >
            Aceitar todos
          </button>
        </div>
      </div>
    </div>
  );
}

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
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed bottom-0 inset-x-0 z-[60] bg-white border-t border-black/10 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] p-4 sm:p-5"
    >
      <div className="container flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-text-light leading-relaxed flex-1">
          Usamos cookies para medir o uso do site e melhorar sua experiência.
          Você pode aceitar ou seguir apenas com os essenciais — nesse caso a
          medição continua de forma anônima, sem identificar você. Saiba mais na
          nossa{" "}
          <Link href="/privacidade" className="text-brand underline underline-offset-2">
            Política de Privacidade
          </Link>
          .
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => choose(false)}
            className="px-4 py-2 text-sm rounded-full border border-black/15 text-text hover:bg-black/5 transition-colors"
          >
            Somente essenciais
          </button>
          <button
            onClick={() => choose(true)}
            className="px-5 py-2 text-sm rounded-full bg-brand text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Aceitar cookies
          </button>
        </div>
      </div>
    </div>
  );
}

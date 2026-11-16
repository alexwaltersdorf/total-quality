/*
 * CTA de WhatsApp como link de verdade (SEO nov/2026, Fase 2).
 *
 * Antes todo CTA era <button> sem href: o Google nao via o destino, o leitor
 * de tela nao anunciava um link e "abrir em nova aba" nao existia. Agora e um
 * <a href="https://api.whatsapp.com/send?..."> — mas o CLIQUE continua
 * exatamente como era: preventDefault e a mesma funcao de antes (o evento de
 * rastreamento + o formulario de qualificacao, regra 8 do CLAUDE.md). O href
 * so e seguido se o JavaScript nunca carregar.
 *
 * Clique do meio e Ctrl/Cmd+clique tambem passam pelo formulario: sem isso
 * eles abririam a conversa sem lead e sem evento.
 *
 * Clique ANTES da hidratacao (pagina renderizada no servidor, JS ainda
 * chegando): o script inline do index.html segura o clique e guarda o link
 * em window.__tqCtaPendente; quando este componente hidrata, executa o
 * clique guardado — com o mesmo onClick, os mesmos eventos.
 */
import { useEffect, useRef, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from "react";
import { whatsappUrl } from "@shared/const";

declare global {
  interface Window {
    __tqCtaPendente?: Element | null;
  }
}

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick" | "target" | "rel"> & {
  /** Texto pre-preenchido do href (o mesmo que o onClick manda ao formulario). */
  mensagem: string;
  /** Exatamente o que o <button> fazia: rastreamento + openWhatsApp(...). */
  onClick: () => void;
  children: ReactNode;
};

export default function CtaWhatsApp({ mensagem, onClick, children, ...resto }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const acao = useRef(onClick);
  acao.current = onClick;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.setAttribute("data-hidratado", "");
    if (typeof window !== "undefined" && window.__tqCtaPendente === el) {
      window.__tqCtaPendente = null;
      acao.current();
    }
  }, []);

  const abrir = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onClick();
  };

  return (
    <a
      {...resto}
      ref={ref}
      href={whatsappUrl(mensagem)}
      target="_blank"
      rel="noopener noreferrer"
      data-cta="whatsapp"
      onClick={abrir}
      onAuxClick={(e) => {
        if (e.button === 1) abrir(e);
      }}
    >
      {children}
    </a>
  );
}

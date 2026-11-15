/*
 * Assunto da pagina para a mensagem do WhatsApp (SEO nov/2026, Fase 2).
 *
 * Toda conversa aberta pelo site comeca com "Olá, vim pelo site e quero
 * informações sobre [assunto]": a recepcao ja sabe de que exame se trata e a
 * conversa nao comeca do zero. A pagina declara o assunto uma vez
 * (<AssuntoPagina value="hemograma completo">) e todos os CTAs dentro dela
 * — inclusive navbar, rodape e botao flutuante — usam a mesma frase. Fora de
 * uma pagina com assunto, cada CTA mantem a mensagem geral que ja tinha.
 *
 * O codigo de referencia do anuncio ([TQ-XXXXX], ContatoLeadContext ->
 * mensagemComCodigo) continua sendo acrescentado no clique, depois desta
 * frase — nada aqui mexe nele.
 */
import { createContext, useContext } from "react";

const AssuntoContext = createContext<string | null>(null);

export const AssuntoPagina = AssuntoContext.Provider;

export function mensagemSobre(assunto: string): string {
  return `Olá, vim pelo site e quero informações sobre ${assunto}`;
}

/** Mensagem do WhatsApp para um CTA: a da pagina, se houver; senao, a geral. */
export function useMensagemWhatsApp(geral: string): string {
  const assunto = useContext(AssuntoContext);
  return assunto ? mensagemSobre(assunto) : geral;
}

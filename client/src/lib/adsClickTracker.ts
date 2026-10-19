/**
 * Codigo TQ-XXXXX que liga o clique no WhatsApp ao clique no anuncio.
 *
 * O problema que isto resolve: quando alguem sai do site para o WhatsApp, o
 * gclid fica para tras. A conversa chega na Ana sem nenhuma ligacao com a
 * campanha que pagou pelo clique, e o Google Ads nunca fica sabendo que aquele
 * anuncio virou exame agendado.
 *
 * O caminho: o site gera um codigo curto, coloca-o na mensagem pre-preenchida
 * e manda o codigo junto com o gclid para o ADS-01 (N8N), que grava em
 * ana_ads_clicks. Quando a mensagem com o codigo chega na Ana, o banco liga o
 * codigo ao telefone. O ADS-02 fecha o circuito mandando a conversao para o
 * Google Ads pela Data Manager API quando o lead vira agendamento.
 *
 * Ver docs/gclid-e-conversoes-offline.md.
 */

import { getAdClickIds } from "./utmTracker";

/**
 * Alfabeto do codigo: A-H, J-N, P-Z e 2-9.
 *
 * Fora dele ficam I, O, 0 e 1 — os quatro caracteres que as pessoas trocam ao
 * ler ou digitar. O codigo viaja numa mensagem de WhatsApp que alguem pode
 * reescrever a mao, entao ambiguidade custa atribuicao perdida.
 *
 * Tem exatamente 32 simbolos, e 256 e multiplo de 32: cada byte sorteado vira
 * um simbolo sem vies de modulo.
 */
const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Precisa continuar casando com a validacao do ADS-01: /^TQ-[A-HJ-NP-Z2-9]{5}$/ */
export const PADRAO_CODIGO = /^TQ-[A-HJ-NP-Z2-9]{5}$/;

export function gerarCodigoTQ(): string {
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  let sufixo = "";
  for (let i = 0; i < bytes.length; i++) {
    sufixo += ALFABETO.charAt(bytes[i] % ALFABETO.length);
  }
  return `TQ-${sufixo}`;
}

/**
 * URL do webhook ADS-01. Sem ela o registro simplesmente nao acontece.
 *
 * NAO tem valor padrao de proposito. O endereco do N8N nao entra no
 * repositorio: ele acabaria no historico publico do git, e o webhook aceita
 * POST de qualquer origem. Configure VITE_ADS_CLICK_WEBHOOK_URL no ambiente de
 * build da Hostinger.
 */
function urlDoWebhook(): string | null {
  const url = import.meta.env.VITE_ADS_CLICK_WEBHOOK_URL;
  return typeof url === "string" && url.startsWith("https://") ? url : null;
}

/**
 * Manda o codigo e os identificadores de clique para o ADS-01.
 *
 * Usa sendBeacon porque a pagina esta prestes a ser trocada pelo WhatsApp:
 * um fetch normal seria cancelado na navegacao. O corpo vai como text/plain
 * para nao disparar preflight de CORS — o ADS-01 aceita string e faz o parse.
 *
 * Nunca lanca. Se o registro falhar, o paciente ainda vai para o WhatsApp:
 * medicao quebrada nao pode derrubar atendimento.
 */
export function registrarCliqueWhatsApp(codigo: string, source: string): boolean {
  try {
    const url = urlDoWebhook();
    if (!url) return false;
    if (!PADRAO_CODIGO.test(codigo)) return false;
    if (typeof navigator === "undefined" || !navigator.sendBeacon) return false;

    const corpo = JSON.stringify({
      codigo,
      source,
      ...getAdClickIds(),
      page_url: window.location.href,
      referrer: document.referrer || null,
    });

    return navigator.sendBeacon(url, new Blob([corpo], { type: "text/plain" }));
  } catch {
    return false;
  }
}

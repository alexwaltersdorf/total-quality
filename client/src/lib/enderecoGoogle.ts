/// <reference types="google.maps" />
/*
 * Autocompletar de endereco pelo Google Maps Platform (pedido do Alex,
 * 22/11/2026). Usado SO pelo campo "Endereco (opcional)" do formulario de
 * qualificacao (components/CampoEnderecoGoogle.tsx).
 *
 * CARREGAMENTO SOB DEMANDA. Este modulo e importado com import() quando o
 * formulario abre pela primeira vez, e so entao injeta o <script> da Maps
 * JavaScript API. Quem nunca abre o formulario nao baixa nada do Google: zero
 * custo de LCP/INP e nenhuma requisicao ao Google para esse visitante.
 *
 * NAO E O MAPA ANTIGO. O CLAUDE.md do repo de SEO proibe reintroduzir a Maps
 * JS API "por proxy de terceiros" — a regra fala do mapa que passava pelo
 * proxy da Manus (forge). Isto e a API oficial do Google, com a chave do
 * proprio Alex, carregada so no formulario. O mapa da localizacao continua
 * sendo o <iframe> de sempre.
 *
 * DUAS GERACOES DA API. O Google recomenda a Places API (New)
 * (AutocompleteSuggestion); a legada (AutocompleteService, usada pelo exemplo
 * do Quick Builder que o Alex mandou) nao esta disponivel para projetos novos
 * desde mar/2025. Tentamos a nova primeiro e caimos para a legada se a nova
 * for recusada. Se as duas forem recusadas — chave sem a API habilitada,
 * referenciador nao autorizado, script bloqueado, sem rede — o campo vira um
 * input de texto comum, sem aviso e sem travar o envio.
 *
 * As sugestoes sao desenhadas pelo proprio formulario (lista dentro do modal),
 * em vez do widget do Google: nao ha .pac-container brigando com o z-index do
 * modal nem com o teclado do celular, e a lista segue o padrao ARIA combobox.
 *
 * PRIVACIDADE. O Google recebe o que e digitado NESTE campo (para sugerir) e
 * mais nada do formulario. A politica em /privacidade diz isso.
 */
import { GOOGLE_MAPS_BROWSER_KEY } from "@shared/const";
import type { ComponentesEndereco } from "./enderecoLead";

/** Rua Padre Anchieta, 1010 — Centro, Caraguatatuba (mesmo geo do schema). */
export const CENTRO_VIES = { lat: -23.6225, lng: -45.4132 } as const;
/** ~60 km: cobre o Litoral Norte (Ubatuba a Sao Sebastiao/Ilhabela). */
export const RAIO_VIES_M = 60_000;
/** Tipos de endereco aceitos pela Places API (New) — Tabela B do Google. */
export const TIPOS_ENDERECO_NOVA = ["street_address", "route", "premise", "subpremise"];

const CALLBACK = "__tqGoogleMapsPronto";
const TEMPO_LIMITE_MS = 10_000;

declare global {
  interface Window {
    __tqGoogleMapsPronto?: () => void;
    gm_authFailure?: () => void;
  }
}

/** A chave do build (VITE_GOOGLE_MAPS_API_KEY) vence a constante do repo. */
export function chaveGoogleMaps(): string {
  const doBuild = (import.meta.env?.VITE_GOOGLE_MAPS_API_KEY as string | undefined)?.trim();
  return doBuild || GOOGLE_MAPS_BROWSER_KEY;
}

export function urlScriptGoogleMaps(chave: string): string {
  const p = new URLSearchParams({
    key: chave,
    loading: "async",
    libraries: "places",
    language: "pt-BR",
    region: "BR",
    callback: CALLBACK,
  });
  return `https://maps.googleapis.com/maps/api/js?${p.toString()}`;
}

let carregamento: Promise<boolean> | null = null;
/** Chave recusada pelo Google (referenciador, cobranca, API desligada). */
let chaveRecusada = false;

/**
 * Injeta o script uma vez por pagina. Resolve false — nunca rejeita — em
 * qualquer falha, e nesse caso permite nova tentativa na proxima abertura
 * (rede que voltou), exceto quando o Google recusou a chave.
 */
export function carregarGoogleMaps(): Promise<boolean> {
  if (chaveRecusada) return Promise.resolve(false);
  if (carregamento) return carregamento;
  carregamento = new Promise<boolean>((resolve) => {
    if (typeof window === "undefined" || typeof document === "undefined") return resolve(false);
    if (typeof google !== "undefined" && typeof google.maps?.importLibrary === "function") return resolve(true);
    const chave = chaveGoogleMaps();
    if (!chave) return resolve(false);

    let script: HTMLScriptElement | null = null;
    const falhar = () => {
      clearTimeout(timer);
      script?.remove();
      carregamento = null;
      resolve(false);
    };
    const timer = setTimeout(falhar, TEMPO_LIMITE_MS);
    window[CALLBACK] = () => {
      clearTimeout(timer);
      resolve(true);
    };
    // Chamado pelo proprio Google quando a chave e recusada (ex.:
    // RefererNotAllowedMapError). Sem isto o campo ficaria esperando.
    window.gm_authFailure = () => {
      chaveRecusada = true;
      falhar();
    };
    try {
      script = document.createElement("script");
      script.src = urlScriptGoogleMaps(chave);
      script.async = true;
      script.onerror = falhar;
      document.head.appendChild(script);
    } catch {
      falhar();
    }
  });
  return carregamento;
}

/** Componente de endereco nos dois formatos do Google, normalizado. */
interface ParteEndereco {
  tipos: readonly string[];
  longo: string;
  curto: string;
}

/** Places API (New): Place.addressComponents. */
export function partesDaApiNova(
  lista: ReadonlyArray<{ types: readonly string[]; longText: string | null; shortText: string | null }> | null | undefined
): ParteEndereco[] {
  return (lista ?? []).map((c) => ({ tipos: c.types, longo: c.longText ?? "", curto: c.shortText ?? c.longText ?? "" }));
}

/** Places API legada: PlaceResult.address_components. */
export function partesDaApiLegada(
  lista: ReadonlyArray<{ types: readonly string[]; long_name: string; short_name: string }> | null | undefined
): ParteEndereco[] {
  return (lista ?? []).map((c) => ({ tipos: c.types, longo: c.long_name, curto: c.short_name }));
}

/**
 * Rua, numero, bairro, cidade, UF e CEP a partir dos componentes do Google.
 * No Brasil a cidade costuma vir em administrative_area_level_2 (e as vezes
 * tambem em locality), e o bairro em sublocality_level_1.
 */
export function extrairComponentes(partes: ParteEndereco[]): ComponentesEndereco {
  const achar = (...tipos: string[]) => {
    for (const t of tipos) {
      const p = partes.find((x) => x.tipos.includes(t));
      if (p) return p;
    }
    return undefined;
  };
  const r: ComponentesEndereco = {
    rua: achar("route")?.longo,
    numero: achar("street_number")?.longo,
    bairro: achar("sublocality_level_1", "sublocality", "neighborhood")?.longo,
    cidade: achar("locality", "administrative_area_level_2")?.longo,
    uf: achar("administrative_area_level_1")?.curto,
    cep: achar("postal_code")?.longo,
  };
  return Object.fromEntries(Object.entries(r).filter(([, v]) => v)) as ComponentesEndereco;
}

export interface SugestaoEndereco {
  id: string;
  principal: string;
  secundario?: string;
}

export interface EnderecoEscolhido {
  formatado?: string;
  componentes: ComponentesEndereco;
}

export interface BuscadorEndereco {
  /** null = servico indisponivel: o campo deve virar texto comum. */
  sugerir(texto: string): Promise<SugestaoEndereco[] | null>;
  detalhar(id: string): Promise<EnderecoEscolhido | null>;
}

type Modo = "nova" | "legada" | "desligado";

/**
 * Cria o buscador depois de carregar a API. Devolve null se a API nao
 * carregou — o chamador simplesmente nao liga o autocompletar.
 */
export async function criarBuscador(): Promise<BuscadorEndereco | null> {
  if (!(await carregarGoogleMaps())) return null;
  let places: google.maps.PlacesLibrary;
  try {
    places = (await google.maps.importLibrary("places")) as google.maps.PlacesLibrary;
  } catch {
    return null;
  }

  let modo: Modo = places.AutocompleteSuggestion ? "nova" : "legada";
  const novas = new Map<string, google.maps.places.PlacePrediction>();
  let tokenNova: google.maps.places.AutocompleteSessionToken | null = null;
  let tokenLegada: google.maps.places.AutocompleteSessionToken | null = null;
  const vies = { center: CENTRO_VIES, radius: RAIO_VIES_M };

  async function sugerirNova(texto: string): Promise<SugestaoEndereco[]> {
    tokenNova ??= new places.AutocompleteSessionToken();
    const { suggestions } = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
      input: texto,
      sessionToken: tokenNova,
      includedRegionCodes: ["br"],
      includedPrimaryTypes: TIPOS_ENDERECO_NOVA,
      locationBias: vies,
      language: "pt-BR",
      region: "br",
    });
    novas.clear();
    const lista: SugestaoEndereco[] = [];
    for (const s of suggestions) {
      const p = s.placePrediction;
      if (!p) continue;
      novas.set(p.placeId, p);
      lista.push({ id: p.placeId, principal: p.mainText?.text ?? p.text.text, secundario: p.secondaryText?.text });
    }
    return lista;
  }

  function sugerirLegada(texto: string): Promise<SugestaoEndereco[]> {
    tokenLegada ??= new google.maps.places.AutocompleteSessionToken();
    const servico = new google.maps.places.AutocompleteService();
    return new Promise((ok, falha) => {
      servico.getPlacePredictions(
        {
          input: texto,
          sessionToken: tokenLegada!,
          componentRestrictions: { country: "br" },
          types: ["address"],
          locationBias: vies,
          language: "pt-BR",
          region: "br",
        },
        (previsoes, status) => {
          const S = google.maps.places.PlacesServiceStatus;
          if (status === S.OK || status === S.ZERO_RESULTS) {
            ok((previsoes ?? []).map((p) => ({
              id: p.place_id,
              principal: p.structured_formatting?.main_text ?? p.description,
              secundario: p.structured_formatting?.secondary_text,
            })));
          } else {
            falha(new Error(String(status)));
          }
        }
      );
    });
  }

  return {
    async sugerir(texto) {
      if (modo === "nova") {
        try {
          return await sugerirNova(texto);
        } catch {
          // Places API (New) recusada (nao habilitada na chave/projeto) ou
          // falha de rede: tenta a legada antes de desistir.
          modo = "legada";
        }
      }
      if (modo === "legada") {
        try {
          return await sugerirLegada(texto);
        } catch {
          modo = "desligado";
        }
      }
      return null;
    },

    async detalhar(id) {
      try {
        const previsao = novas.get(id);
        if (previsao) {
          const place = previsao.toPlace();
          await place.fetchFields({ fields: ["addressComponents", "formattedAddress"] });
          tokenNova = null; // a sessao de cobranca termina no detalhe
          return {
            formatado: place.formattedAddress ?? undefined,
            componentes: extrairComponentes(partesDaApiNova(place.addressComponents)),
          };
        }
        const servico = new google.maps.places.PlacesService(document.createElement("div"));
        const token = tokenLegada;
        tokenLegada = null;
        return await new Promise<EnderecoEscolhido | null>((ok) => {
          servico.getDetails(
            { placeId: id, fields: ["address_components", "formatted_address"], sessionToken: token ?? undefined },
            (r, status) => {
              if (status !== google.maps.places.PlacesServiceStatus.OK || !r) return ok(null);
              ok({
                formatado: r.formatted_address,
                componentes: extrairComponentes(partesDaApiLegada(r.address_components)),
              });
            }
          );
        });
      } catch {
        return null;
      }
    },
  };
}

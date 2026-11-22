/*
 * Campo "Endereco (opcional)" do formulario de qualificacao, com sugestoes do
 * Google Maps (pedido do Alex, 22/11/2026).
 *
 * Funciona em dois estados, e o segundo e o normal enquanto a chave nao
 * estiver liberada para o site:
 *   - com o Google: digitar 3+ letras mostra ate 5 sugestoes numa lista
 *     dentro do modal (setas + Enter, ou toque), e escolher uma preenche o
 *     campo com o endereco formatado e guarda rua/numero/bairro/cidade/UF/CEP;
 *   - sem o Google (script bloqueado, chave recusada, sem rede): e um input de
 *     texto comum, com autocomplete="street-address" do navegador. Nada trava
 *     e nenhum erro aparece para o paciente.
 *
 * O modulo do Google (lib/enderecoGoogle.ts) so e baixado quando este campo
 * monta — isto e, quando o formulario abre — e nunca no carregamento da pagina.
 */
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { ComponentesEndereco } from "@/lib/enderecoLead";
import type { BuscadorEndereco, SugestaoEndereco } from "@/lib/enderecoGoogle";

const MIN_LETRAS = 3;
const ESPERA_MS = 300;
const MAX_SUGESTOES = 5;

interface Props {
  id: string;
  valor: string;
  maxLength: number;
  className: string;
  onTexto: (texto: string) => void;
  /** null quando o texto deixa de corresponder a uma sugestao escolhida. */
  onComponentes: (c: ComponentesEndereco | null) => void;
}

export default function CampoEnderecoGoogle({ id, valor, maxLength, className, onTexto, onComponentes }: Props) {
  const [buscador, setBuscador] = useState<BuscadorEndereco | null>(null);
  const [sugestoes, setSugestoes] = useState<SugestaoEndereco[]>([]);
  const [ativa, setAtiva] = useState(-1);
  const consulta = useRef(0);
  const espera = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listaId = `${id}-sugestoes`;
  const aberta = sugestoes.length > 0;

  useEffect(() => {
    let vivo = true;
    import("@/lib/enderecoGoogle")
      .then((m) => m.criarBuscador())
      .then((b) => {
        if (vivo && b) setBuscador(b);
      })
      .catch(() => {
        // Sem o modulo (offline, deploy novo com chunk antigo): campo comum.
      });
    return () => {
      vivo = false;
      if (espera.current) clearTimeout(espera.current);
    };
  }, []);

  const fechar = () => {
    consulta.current++;
    setSugestoes([]);
    setAtiva(-1);
  };

  const digitar = (texto: string) => {
    onTexto(texto);
    onComponentes(null);
    if (espera.current) clearTimeout(espera.current);
    if (!buscador || texto.trim().length < MIN_LETRAS) {
      fechar();
      return;
    }
    const n = ++consulta.current;
    espera.current = setTimeout(async () => {
      const r = await buscador.sugerir(texto.trim());
      if (n !== consulta.current) return; // resposta de uma digitacao antiga
      if (r === null) {
        setBuscador(null); // Google recusou: daqui em diante, campo comum
        fechar();
        return;
      }
      setSugestoes(r.slice(0, MAX_SUGESTOES));
      setAtiva(-1);
    }, ESPERA_MS);
  };

  const escolher = async (s: SugestaoEndereco) => {
    const provisorio = [s.principal, s.secundario].filter(Boolean).join(", ");
    fechar();
    onTexto(provisorio.slice(0, maxLength));
    const det = await buscador?.detalhar(s.id);
    if (!det) return; // fica o texto da sugestao, sem componentes
    if (det.formatado) onTexto(det.formatado.slice(0, maxLength));
    onComponentes(det.componentes);
  };

  const teclar = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!aberta) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAtiva((i) => (i + 1) % sugestoes.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setAtiva((i) => (i <= 0 ? sugestoes.length - 1 : i - 1));
    } else if (e.key === "Enter" && ativa >= 0) {
      // Enter com sugestao destacada escolhe a sugestao — nao envia o form.
      e.preventDefault();
      void escolher(sugestoes[ativa]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      fechar();
    }
  };

  return (
    <div>
      <input
        id={id}
        name="endereco"
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={aberta}
        aria-controls={listaId}
        aria-activedescendant={ativa >= 0 ? `${listaId}-${ativa}` : undefined}
        aria-describedby={`${id}-ajuda`}
        // Com as sugestoes do Google ligadas, o preenchimento automatico do
        // navegador abriria uma segunda lista por cima da nossa.
        autoComplete={buscador ? "off" : "street-address"}
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="next"
        maxLength={maxLength}
        value={valor}
        onChange={(e) => digitar(e.target.value)}
        onKeyDown={teclar}
        onBlur={() => setTimeout(fechar, 150)}
        placeholder="Rua, número, bairro, cidade"
        className={className}
      />
      <ul
        id={listaId}
        role="listbox"
        aria-label="Sugestões de endereço"
        hidden={!aberta}
        className="mt-1 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm"
      >
        {sugestoes.map((s, i) => (
          <li
            key={s.id}
            id={`${listaId}-${i}`}
            role="option"
            aria-selected={i === ativa}
            // mousedown sem preventDefault tiraria o foco e fecharia a lista
            // antes do clique chegar.
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => void escolher(s)}
            className={`px-3 py-2.5 text-sm cursor-pointer border-b border-gray-100 last:border-b-0 ${
              i === ativa ? "bg-brand/10" : "hover:bg-gray-50"
            }`}
          >
            <span className="block text-text-light">{s.principal}</span>
            {s.secundario && <span className="block text-xs text-text-light/60">{s.secundario}</span>}
          </li>
        ))}
      </ul>
      <p id={`${id}-ajuda`} className="text-[11px] leading-snug text-text-light/60 mt-1">
        {buscador
          ? "Sugestões de endereço por Google Maps. Agiliza o cadastro e a coleta domiciliar."
          : "Agiliza o cadastro e a coleta domiciliar."}
      </p>
    </div>
  );
}

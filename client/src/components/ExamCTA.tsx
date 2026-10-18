/*
 * Quadro de contato dos artigos de exame (out/2026).
 *
 * Entra duas vezes por artigo: no meio (bloco "[[cta]]" do corpo, logo depois
 * do preparo) e no fim. O texto segue as decisoes do Alex, nao o briefing de
 * SEO que o originou:
 *   - a coleta laboratorial e SEM agendamento, por ordem de chegada (decisao
 *     de 01/08/2026) — por isso o botao e "Tirar duvidas", nunca "Agende";
 *   - coleta domiciliar existe, mas area, horario e valor sao confirmados pelo
 *     WhatsApp, sem prometer condicao;
 *   - o clique passa pelo formulario de qualificacao (useWhatsAppRedirect) e
 *     emite o evento canonico whatsapp_click com exam_type — nao um parametro
 *     novo "exam_name", que o GTM nao conhece.
 */
import { ArrowUpRight } from "lucide-react";
import { trackWhatsAppConversion } from "@/lib/tracking";
import { useWhatsAppRedirect } from "@/contexts/ContatoLeadContext";
import { textoContato } from "@/lib/blogMeta";

type Props = {
  examName: string;
  examType?: string;
  /** "meio" ou "fim": vira o event_label, para comparar as duas posicoes. */
  posicao: "meio" | "fim";
  /** Exame com hora marcada (imagem, MAPA, coleta ginecologica). */
  horaMarcada?: boolean;
};

export default function ExamCTA({ examName, examType, posicao, horaMarcada }: Props) {
  const openWhatsApp = useWhatsAppRedirect();
  const domiciliar = examName === "coleta domiciliar";
  const label = `artigo_cta_${posicao}`;

  return (
    <aside className="my-10 p-6 md:p-8 bg-surface-light border border-black/5" aria-label="Fale com a Total Quality">
      {/* <p>, nao <h2>: o artigo ja tem o H2 "Onde fazer ... em Caraguatatuba"
          e o quadro aparece duas vezes — titulo repetido polui o sumario. */}
      <p className="heading-display text-2xl md:text-3xl text-text mb-3">
        {domiciliar ? "Coleta domiciliar em Caraguatatuba" : `${examName[0].toUpperCase()}${examName.slice(1)} na Total Quality`}
      </p>
      {textoContato(horaMarcada).map((t, i) => (
        <p key={i} className={`text-text-light text-sm leading-relaxed ${i === 0 ? "mb-2" : "mb-6"}`}>
          {t}
        </p>
      ))}
      <button
        type="button"
        onClick={() => {
          trackWhatsAppConversion(label, "blog", examType);
          openWhatsApp(
            label,
            domiciliar
              ? "Olá! Gostaria de informações sobre a coleta domiciliar."
              : `Olá! Tenho uma dúvida sobre ${examName}.`
          );
        }}
        className="btn-pill-brand inline-flex items-center gap-2"
      >
        Tirar dúvidas pelo WhatsApp <ArrowUpRight className="w-4 h-4" />
      </button>
    </aside>
  );
}

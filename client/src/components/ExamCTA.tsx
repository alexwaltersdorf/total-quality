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
 *
 * System prompt do blog (21/10/2026, fase 3): o quadro leva tambem a pagina do
 * exame (botao secundario), diz "em Caraguatatuba" no titulo (a ligacao local
 * fica aqui, nao no title do artigo) e a mensagem do WhatsApp avisa que o
 * paciente veio do blog. "Agendar" so para exame com hora marcada.
 */
import { ArrowUpRight } from "lucide-react";
import { Link } from "wouter";
import { trackWhatsAppConversion } from "@/lib/tracking";
import { useWhatsAppRedirect } from "@/contexts/ContatoLeadContext";
import { mensagemContato, PAGINA_EXAME_LABEL, textoContato, tituloContato } from "@/lib/blogMeta";

type Props = {
  examName: string;
  examType?: string;
  /** "meio" ou "fim": vira o event_label, para comparar as duas posicoes. */
  posicao: "meio" | "fim";
  /** Exame com hora marcada (imagem, MAPA, coleta ginecologica). */
  horaMarcada?: boolean;
  /** Paginas de exame linkadas pelo quadro (botao secundario). */
  examPages?: string[];
};

export default function ExamCTA({ examName, examType, posicao, horaMarcada, examPages = [] }: Props) {
  const openWhatsApp = useWhatsAppRedirect();
  const label = `artigo_cta_${posicao}`;
  const paginas = examPages.filter((href) => PAGINA_EXAME_LABEL[href]);

  return (
    <aside className="my-10 p-6 md:p-8 bg-surface-light border border-black/5" aria-label="Fale com a Total Quality">
      {/* <p>, nao <h2>: o quadro aparece duas vezes — titulo repetido polui o sumario. */}
      <p className="heading-display text-2xl md:text-3xl text-text mb-3">{tituloContato(examName)}</p>
      {textoContato(horaMarcada).map((t, i, arr) => (
        <p key={i} className={`text-text-light text-sm leading-relaxed ${i === arr.length - 1 ? "mb-6" : "mb-2"}`}>
          {t}
        </p>
      ))}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            trackWhatsAppConversion(label, "blog", examType);
            openWhatsApp(label, mensagemContato(examName, horaMarcada));
          }}
          className="btn-pill-brand inline-flex items-center gap-2"
        >
          {horaMarcada ? "Agendar pelo WhatsApp" : "Tirar dúvidas pelo WhatsApp"} <ArrowUpRight className="w-4 h-4" />
        </button>
        {paginas.map((href) => (
          <Link key={href} href={href} className="btn-pill-outline inline-flex items-center gap-2">
            {PAGINA_EXAME_LABEL[href]}
          </Link>
        ))}
      </div>
    </aside>
  );
}

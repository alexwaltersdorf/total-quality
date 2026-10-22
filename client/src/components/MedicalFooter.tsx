/*
 * Rodape de cada artigo: identificacao do art. 5o da Resolucao CFM 2.336/2023,
 * aviso de conteudo informativo e as datas de atualizacao e revisao.
 *
 * O texto da identificacao e o bloco padrao do Alex, sem a sigla do conselho
 * (guard-rail em server/seo-content.test.ts). O equivalente pre-renderizado
 * esta em blogFooterHtml(), em server/_core/seo-content.ts.
 */
import { AVISO_INFORMATIVO, IDENTIFICACAO, isoToBr } from "@/lib/blogMeta";

type Props = {
  dateModified: string;
  lastReviewed?: string;
  draft?: boolean;
};

export default function MedicalFooter({ dateModified, lastReviewed, draft }: Props) {
  return (
    <footer className="mt-12 pt-6 border-t border-black/10 text-xs text-text-muted leading-relaxed space-y-1">
      <p className="text-text-light font-medium">{AVISO_INFORMATIVO}</p>
      <p>
        {IDENTIFICACAO.map((linha, i) => (
          <span key={linha}>
            {i > 0 && <br />}
            {linha}
          </span>
        ))}
      </p>
      {dateModified && <p>Última atualização: {isoToBr(dateModified)}</p>}
      {lastReviewed ? (
        <p>Última revisão médica: {isoToBr(lastReviewed)}</p>
      ) : (
        draft && <p>Rascunho — revisão médica pendente.</p>
      )}
    </footer>
  );
}

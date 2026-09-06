/*
 * Valor monetario por tipo de lead, usado no parametro `value` do evento
 * whatsapp_click — e portanto na conversao do Google Ads e no Lead do Meta.
 *
 * Para que serve: com todos os leads valendo o mesmo, o Ads e o Meta so
 * conseguem otimizar por VOLUME. Com valores diferentes por tipo, eles passam
 * a perseguir os leads que valem mais para a clinica — uma tomografia (R$ 300)
 * nao vale o mesmo que um eletrocardiograma (R$ 100).
 *
 * ORIGEM DOS NUMEROS: informados pelo Alex em 06/09/2026. Sao informacao de
 * negocio dele. Nao inventar valor para tipo que ele nao informou: numero
 * chutado distorce o leilao e gasta orcamento no lugar errado. Tipo sem valor
 * informado cai no padrao, de proposito.
 *
 * AS CHAVES IMPORTAM. O `exam_type` que chega aqui vem de duas fontes:
 *   1. paginas de exame  -> o SLUG do exame (client/src/lib/examesData.ts),
 *      com hifen: "tomografia-computadorizada", "raio-x", "exame-toxicologico";
 *   2. paginas tematicas -> a categoria: "checkup", "cartao", "bioimpedancia".
 * Antes de 06/09 a tabela so tinha categorias, e NENHUM slug de exame casava:
 * todo lead vindo de pagina de exame caia no padrao. Por isso os slugs estao
 * escritos aqui, um a um. Ao criar um exame novo em examesData, adicionar a
 * chave aqui — ha guard-rail que quebra o build se faltar.
 */

const LABORATORIO = 135.0;
const TOXICOLOGICO = 160.0;
const TOMOGRAFIA = 300.0;
const ULTRASSONOGRAFIA = 150.0;
const RAIO_X = 120.0;
const MAPA = 165.0;
const HOLTER = 165.0;
const ELETROCARDIOGRAMA = 100.0;
const ELETROENCEFALOGRAMA = 200.0;
const ESPIROMETRIA = 165.0;
const CHECKUP = 399.0;

export const LEAD_VALUES: Record<string, number> = {
  // --- Slugs das paginas de exame (exam_type vem do slug) ---
  "exames-de-sangue": LABORATORIO,
  hemograma: LABORATORIO,
  "exame-toxicologico": TOXICOLOGICO,
  "tomografia-computadorizada": TOMOGRAFIA,
  ultrassonografia: ULTRASSONOGRAFIA,
  "raio-x": RAIO_X,
  mapa: MAPA,
  holter: HOLTER,
  eletrocardiograma: ELETROCARDIOGRAMA,
  eletroencefalograma: ELETROENCEFALOGRAMA,
  espirometria: ESPIROMETRIA,

  // --- Categorias de origem (lead_source) ---
  laboratorio: LABORATORIO,
  exames: LABORATORIO,
  checkup: CHECKUP,
};

/*
 * Valor usado quando o tipo de lead nao esta na tabela.
 *
 * Vale o ticket de laboratorio (o servico de maior volume da clinica e o
 * desfecho mais provavel de um lead que nao se identificou). Fica na faixa
 * BAIXA da tabela de proposito — so o eletrocardiograma vale menos: superestimar
 * lead frio faz o algoritmo gastar orcamento perseguindo contato que nao se
 * paga, e esse erro custa mais caro que o inverso.
 *
 * Cai aqui hoje, por falta de valor informado pelo Alex:
 *   - "mamografia" e "exame-admissional" (paginas de exame existentes);
 *   - "bioimpedancia" e "cartao" (paginas tematicas);
 *   - "geral", "blog" e "convenios" (origens informacionais, intencao fria).
 * Quando ele informar o ticket desses, trocar linha a linha.
 */
export const LEAD_VALUE_PADRAO = LABORATORIO;

/**
 * Resolve o valor de um lead, do mais especifico para o mais generico:
 * o tipo de exame exato, depois seu prefixo, depois a origem e o prefixo dela.
 *
 * O prefixo cobre os pacotes de check-up, que chegam como "checkup_completo"
 * e precisam casar com a chave "checkup". Quebra em "_" e em "-" porque as
 * duas convencoes convivem: categoria usa underscore, slug de exame usa hifen.
 */
export function resolveLeadValue(leadSource: string, examType: string): number {
  const candidatas = [
    examType,
    examType.split(/[_-]/)[0],
    leadSource,
    leadSource.split(/[_-]/)[0],
  ];
  for (const chave of candidatas) {
    if (chave && chave in LEAD_VALUES) return LEAD_VALUES[chave];
  }
  return LEAD_VALUE_PADRAO;
}

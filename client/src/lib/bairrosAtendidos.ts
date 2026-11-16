/*
 * Secao "Quem vem de outros bairros" da landing /laboratorio-caraguatatuba.
 *
 * Herdou o conteudo de dois artigos do blog que disputavam a intencao local
 * desta pagina e foram consolidados nela com 301 em 22/10/2026:
 * /blog/laboratorio-regiao-sul-caraguatatuba e
 * /blog/laboratorio-jardim-primavera-caraguatatuba. Uma URL por intencao: busca
 * de laboratorio com nome de bairro e desta pagina, nao do blog.
 *
 * Arquivo PURO: usado pela pagina React e pelo prerender
 * (server/_core/seo-content.ts), para os dois textos nao divergirem.
 *
 * A clinica NAO tem unidade fora do Centro. A frase "Nao temos unidade na
 * regiao sul" e travada por teste: sem ela, a secao vira promessa falsa de
 * localidade.
 */

export const BAIRROS_TITULO = "Quem vem de outros bairros";

export const BAIRROS_INTRO =
  "A Total Quality fica na Rua Padre Anchieta, 1010, no Centro de Caraguatatuba. Não temos unidade na região sul nem em outros bairros: todo o atendimento presencial é feito neste endereço.";

/** Grupos de bairros. Os da regiao sul seguem a area de referencia do CRAS Sul da Prefeitura. */
export const BAIRROS_GRUPOS: { titulo: string; bairros: string }[] = [
  {
    titulo: "Região sul",
    bairros:
      "Perequê-Mirim, Travessão, Pegorelli, Morro do Algodão, Porto Novo, Praia das Palmeiras, Pontal Santa Marina, Jardim Britânia, Barranco Alto, Golfinho, Rio Claro e Jaraguá",
  },
  {
    titulo: "Vizinhos do Centro",
    bairros: "Jardim Primavera, Sumaré e Indaiá",
  },
];

export const BAIRROS_PARAGRAFOS: string[] = [
  "Se o pedido tem exame com jejum, as horas contam a partir da última refeição em casa: o trajeto até o Centro entra dentro do jejum. Como a coleta laboratorial é sem agendamento, por ordem de chegada, chegar cedo resolve, sem depender de vaga em agenda.",
  "Ultrassonografia, tomografia, raio-X, eletrocardiograma, MAPA e Holter são feitos com hora marcada pelo WhatsApp (12) 3887-3535. Se o pedido junta exames de laboratório e de imagem, pergunte se dá para fazer tudo no mesmo dia: uma ida ao Centro pode resolver o pedido inteiro.",
  "Para quem tem dificuldade de se deslocar, existe coleta domiciliar de exames laboratoriais. Área atendida, horário e valor são confirmados pelo WhatsApp. Exames de imagem dependem dos aparelhos da clínica e são feitos só no endereço do Centro.",
  "Laboratório não é serviço de urgência. Febre alta que não cede, falta de ar ou dor forte pedem a UPA; em situação grave, como dor no peito, desmaio ou fraqueza de um lado do corpo, ligue para o SAMU 192.",
];

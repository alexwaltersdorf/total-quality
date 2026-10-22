/*
 * Lista oficial de convênios aceitos, exibida em /convenios.
 *
 * ATENÇÃO: esta lista existe em DOIS lugares — aqui (client) e em
 * server/_core/seo-content.ts (prerender; usa node:fs, o client não pode
 * importá-lo). Ao incluir ou remover um convênio, alterar NOS DOIS arquivos.
 * O teste de paridade em server/seo-content.test.ts compara as duas listas
 * e falha se divergirem.
 */
export const CONVENIOS = [
  "Cartão de Todos", "Solumedi", "Leader",
];

/**
 * Perguntas frequentes de /convenios — fonte unica da pagina React e do
 * prerender (antes cada um tinha a sua lista, e elas divergiam). Recebeu em
 * 22/10/2026 o que o post /blog/convenios-laboratorio-caraguatatuba tinha de
 * util, quando ele foi consolidado aqui com 301.
 */
export const CONVENIOS_FAQS: { q: string; a: string }[] = [
  {
    q: "Quais convênios a Total Quality atende?",
    a: "Atendemos Cartão de Todos, Solumedi e Leader. Fora desses, o atendimento é particular, com tabela própria. Confirme condições e valores pelo WhatsApp (12) 3887-3535 antes de vir.",
  },
  {
    q: "O que preciso levar para usar o convênio?",
    a: "O cartão do convênio, um documento de identidade com foto e o pedido médico.",
  },
  {
    q: "Preciso de liberação prévia?",
    a: "Alguns exames de maior complexidade, como tomografia e mamografia, podem exigir procedimento próprio de liberação do convênio. A equipe orienta sobre o seu caso ao marcar o exame pelo WhatsApp.",
  },
  {
    q: "Meu convênio não está na lista. Posso fazer os exames?",
    a: "Pode. O atendimento particular cobre a mesma lista de mais de 3.000 exames laboratoriais e de imagem, com tabela própria. Os valores são informados pelo WhatsApp (12) 3887-3535.",
  },
  {
    q: "Quais formas de pagamento são aceitas no particular?",
    a: "Dinheiro, cartão de crédito, cartão de débito e PIX. Para check-ups e pacotes de exames, a equipe informa as opções pelo WhatsApp.",
  },
];

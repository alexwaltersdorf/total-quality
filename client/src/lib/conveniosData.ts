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

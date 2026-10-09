import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/*
 * chavesTelefone() vive em docs/scripts/status-de-leads.gs, que e colado no
 * Apps Script da planilha e nunca importado pelo site. Mesmo assim e testado
 * aqui, porque errar a comparacao de telefone corrompe em silencio justamente
 * o numero que a coluna de status existe para medir: casar o lead errado
 * marca como agendado quem nao agendou.
 *
 * O arquivo e lido como texto e avaliado, na mesma convencao que os outros
 * guard-rails deste repositorio ja usam para aferir codigo-fonte.
 */
function carregarChavesTelefone(): (bruto: unknown) => { cheia: string; curta: string } | null {
  const fonte = readFileSync(
    path.resolve(import.meta.dirname, "..", "docs", "scripts", "status-de-leads.gs"),
    "utf8"
  );
  const inicio = fonte.indexOf("function chavesTelefone");
  expect(inicio, "chavesTelefone sumiu do script").toBeGreaterThan(-1);
  // Ate a proxima declaracao de funcao no topo do arquivo.
  const resto = fonte.slice(inicio);
  const fim = resto.indexOf("\n/**", 1);
  const corpo = fim === -1 ? resto : resto.slice(0, fim);
  return new Function(`${corpo}; return chavesTelefone;`)() as never;
}

const chaves = carregarChavesTelefone();

describe("comparacao de telefone entre WhatsApp e planilha", () => {
  it("reconhece o mesmo numero em todos os formatos que aparecem na pratica", () => {
    const esperado = chaves("(12) 99725-7786");
    expect(esperado).not.toBeNull();
    for (const variante of [
      "+55 12 99725-7786",
      "5512997257786",
      "55 (12) 99725-7786",
      "12997257786",
      "012997257786",
      " (12) 9 9725-7786 ",
    ]) {
      expect(chaves(variante)?.cheia, variante).toBe(esperado!.cheia);
    }
  });

  /*
   * O nono digito entrou em 2012 e cadastro antigo nao tem. O mesmo aparelho
   * existe com 10 e com 11 digitos, e precisa casar pelos dois.
   */
  it("casa o celular com e sem o nono digito", () => {
    const novo = chaves("(12) 99725-7786");
    const antigo = chaves("(12) 9725-7786");
    expect(novo!.cheia).not.toBe(antigo!.cheia);
    expect(novo!.curta).toBe(antigo!.curta);
  });

  it("nao confunde numeros realmente diferentes", () => {
    expect(chaves("(12) 99725-7786")!.curta).not.toBe(chaves("(12) 99660-9287")!.curta);
    // DDD diferente, mesmo numero: sao pessoas diferentes.
    expect(chaves("(12) 99725-7786")!.curta).not.toBe(chaves("(11) 99725-7786")!.curta);
  });

  /*
   * A chave curta ignora o nono digito, entao um fixo e um celular do mesmo
   * assinante colidem nela. O teste registra a colisao de proposito: e por
   * existir que o motor so usa a chave curta quando ha UM candidato, e reporta
   * ambiguidade em vez de chutar.
   */
  it("a chave curta colide fixo com celular — por isso a ambiguidade e reportada", () => {
    expect(chaves("(12) 3887-3535")!.curta).toBe(chaves("(12) 93887-3535")!.curta);
    expect(chaves("(12) 3887-3535")!.cheia).not.toBe(chaves("(12) 93887-3535")!.cheia);
  });

  it("recusa o que nao da para comparar", () => {
    for (const lixo of ["", "   ", "abc", "1234", "99725-7786", null, undefined]) {
      expect(chaves(lixo), String(lixo)).toBeNull();
    }
  });

  it("aceita fixo com DDD", () => {
    expect(chaves("(12) 3887-3535")!.cheia).toBe("1238873535");
  });
});

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const RAIZ = path.resolve(import.meta.dirname, "..");
const leia = (rel: string) => readFileSync(path.resolve(RAIZ, rel), "utf8");

/*
 * Em 21/09/2026 o Alex preencheu um lead de teste e foi conferir o e-mail que
 * o codigo dizia enviar. Nao chegou nada — e nao podia mesmo: o site nunca
 * enviou e-mail. O comentario acima da chamada dizia "Notificacao automatica
 * para sac@totalquality.med.br" e a funcao anotada por ele publica no servico
 * de notificacao do Manus, com um payload que nao tem destinatario.
 *
 * O custo do comentario mentiroso foi maior que o do bug: ele passou por
 * revisao, entrou na documentacao e na descricao de um PR, e so apareceu
 * quando alguem foi conferir o resultado no mundo real. Estas travas existem
 * para esse comentario nao voltar, e para o dia em que o envio de verdade
 * existir a documentacao ser revista junto.
 *
 * Ver docs/notificacao-de-leads.md.
 */
describe("GUARD-RAIL: notificacao de leads (21/09/2026)", () => {
  it("nenhum comentario promete e-mail para um endereco que o codigo nao usa", () => {
    const arquivos = readdirSync(path.resolve(RAIZ, "server"), {
      recursive: true,
      encoding: "utf-8",
    }).filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"));

    const problemas: string[] = [];
    for (const rel of arquivos) {
      const linhas = leia(path.join("server", rel)).split("\n");
      linhas.forEach((linha, i) => {
        const comentario = /^\s*(\/\/|\*|\/\*)/.test(linha);
        if (!comentario) return;
        if (/notifica[çc][ãa]o\s+autom[áa]tica\s+para\s+\S+@/i.test(linha)) {
          problemas.push(
            `server/${rel}:${i + 1}: comentario promete e-mail que o codigo nao envia`
          );
        }
      });
    }
    expect(problemas, problemas.join("\n")).toEqual([]);
  });

  it("notifyOwner continua sem destinatario, e o payload denuncia isso", () => {
    const notification = leia("server/_core/notification.ts");
    // O corpo enviado e exatamente titulo e conteudo. Se um destinatario
    // aparecer aqui, o envio mudou de natureza e docs/notificacao-de-leads.md
    // precisa ser reescrito no mesmo commit.
    expect(notification).toContain("JSON.stringify({ title, content })");
    expect(notification).not.toMatch(/\bto\s*:/);
    expect(notification).not.toMatch(/recipient|destinatario/i);
  });

  it("a ausencia de envio de e-mail esta documentada, nao suposta", () => {
    const doc = leia("docs/notificacao-de-leads.md");
    // Os dois fatos que o documento existe para registrar. Aferir o nome do
    // proprio arquivo, como esta linha fazia antes, nao aferia nada.
    expect(doc).toContain("notifyOwner");
    expect(doc).toContain("BUILT_IN_FORGE_API_URL");

    /*
     * Se alguem instalar um cliente de e-mail de verdade, este teste quebra de
     * proposito: a partir dai a documentacao acima esta desatualizada e o
     * conserto precisa vir junto com a dependencia, nao depois dela.
     */
    const pkg = JSON.parse(leia("package.json")) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
    const clientesDeEmail = deps.filter((d) =>
      /^(nodemailer|resend|@sendgrid|mailgun|postmark|@aws-sdk\/client-ses|emailjs)/.test(d)
    );
    expect(
      clientesDeEmail,
      `Cliente de e-mail instalado (${clientesDeEmail.join(", ")}) — ` +
        "reescreva docs/notificacao-de-leads.md e este guard-rail no mesmo commit."
    ).toEqual([]);
  });
});

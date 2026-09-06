/*
 * /convenios — página transacional de convênios aceitos.
 *
 * Criada na auditoria de ago/2026 (fila C6): "convênio" aparece nas buscas
 * reais do perfil do Google e a landing /laboratorio-caraguatatuba só linkava
 * para um post de blog informacional. Esta página responde a intenção
 * transacional; o post /blog/convenios-laboratorio-caraguatatuba segue como
 * conteúdo de apoio.
 *
 * O conteúdo prerenderizado (com FAQPage schema) vive em
 * server/_core/seo-content.ts (conveniosHtml) — manter os dois textos
 * alinhados ao editar.
 */
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFAB from "@/components/WhatsAppFAB";
import { useCanonical, useMetaDescription } from "@/components/SEOHead";
import { CONVENIOS } from "@/lib/conveniosData";
import { trackWhatsAppConversion } from "@/lib/tracking";

const WHATSAPP_HREF =
  "https://wa.me/551238873535?text=Olá! Gostaria de confirmar se meu convênio é aceito na Total Quality.";

const FAQS = [
  {
    q: "Quais convênios a Total Quality atende?",
    a: "Atendemos Cartão de Todos, Solumedi e Leader. Fora desses, o atendimento é particular, com tabela própria. Confirme condições e valores pelo WhatsApp (12) 3887-3535 antes de vir.",
  },
  {
    q: "Preciso de liberação prévia?",
    a: "Alguns exames de maior complexidade, como tomografia e mamografia, podem exigir procedimento próprio de liberação. Nossa equipe orienta sobre o seu caso no momento do agendamento.",
  },
  {
    q: "O que preciso levar para usar o convênio?",
    a: "O cartão do convênio, um documento de identidade com foto e o pedido médico.",
  },
  {
    q: "E se eu não tiver convênio?",
    a: "Atendemos particular com valores acessíveis e pagamento em dinheiro, cartão de crédito, débito ou PIX. Há condições especiais para check-ups e pacotes de exames.",
  },
];

export default function Convenios() {
  useCanonical("https://totalquality.med.br/convenios");
  useMetaDescription(
    "Convênios aceitos no laboratório Total Quality em Caraguatatuba: Cartão de Todos, Solumedi e Leader. Nos demais casos, atendimento particular."
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-6 lg:px-12">
          <h1 className="heading-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] text-text mb-6">
            Convênios Aceitos no Laboratório em Caraguatatuba
          </h1>

          <div className="space-y-8 text-text-light leading-relaxed">
            <p>
              A Total Quality Medicina Diagnóstica atende Cartão de Todos, Solumedi e Leader
              em Caraguatatuba – SP, para{" "}
              <Link href="/exames/exames-de-sangue" className="text-primary underline">
                exames de sangue
              </Link>
              ,{" "}
              <Link href="/laboratorio-caraguatatuba" className="text-primary underline">
                exames laboratoriais
              </Link>
              ,{" "}
              <Link href="/exames/tomografia-computadorizada" className="text-primary underline">
                tomografia
              </Link>
              ,{" "}
              <Link href="/exames/ultrassonografia" className="text-primary underline">
                ultrassonografia
              </Link>
              ,{" "}
              <Link href="/exames/mamografia" className="text-primary underline">
                mamografia
              </Link>{" "}
              e{" "}
              <Link href="/checkup" className="text-primary underline">
                check-up
              </Link>
              .
            </p>

            <section>
              <h2 className="heading-display text-2xl text-text mb-4">
                Convênios e cartões atendidos
              </h2>
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 list-disc pl-5">
                {CONVENIOS.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <p className="mt-4">
                Não trabalhamos com outros convênios ou planos de saúde: fora dessa lista, o
                atendimento é particular. Confirme condições e valores pelo WhatsApp{" "}
                <a href={WHATSAPP_HREF} className="text-primary underline" target="_blank" rel="noopener noreferrer" onClick={() => trackWhatsAppConversion("convenios_link", "convenios")}>
                  (12) 3887-3535
                </a>{" "}
                antes de agendar.
              </p>
            </section>

            <section>
              <h2 className="heading-display text-2xl text-text mb-4">Perguntas frequentes</h2>
              <div className="space-y-6">
                {FAQS.map((faq) => (
                  <div key={faq.q}>
                    <h3 className="font-semibold text-text mb-2">{faq.q}</h3>
                    <p>{faq.a}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-gray-50 rounded-2xl p-8">
              <h2 className="heading-display text-2xl text-text mb-3">
                Confirme seu convênio e agende
              </h2>
              <p className="mb-4">
                R. Padre Anchieta, 1010 – Centro, Caraguatatuba – SP. Atendimento de segunda a
                sexta, das 7h30 às 18h. A coleta laboratorial é sem agendamento, por ordem de
                chegada; exames de imagem são agendados pelo WhatsApp.
              </p>
              <a
                href={WHATSAPP_HREF}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppConversion("convenios_cta", "convenios")}
                className="inline-block bg-primary text-white font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
              >
                Agendar pelo WhatsApp
              </a>
            </section>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppFAB />
    </div>
  );
}

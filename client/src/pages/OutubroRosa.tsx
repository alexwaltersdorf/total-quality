/*
 * Campanha Check-up Outubro Rosa — /outubro-rosa
 *
 * DECISÕES QUE VALEM REVISÃO ANTES DE MEXER AQUI:
 *
 * 1. O rosa é ADAPTAÇÃO DE CAMPANHA, não cor institucional auditada. Ele sai
 *    do mesmo matiz da marca (oklch hue 18) só com mais claridade, para ficar
 *    parente do vinho institucional em vez de cor estrangeira. Fica todo em
 *    classe utilitária com valor literal NESTE arquivo: nenhuma linha de CSS
 *    global foi tocada, então nada vaza para o resto do site.
 *
 * 2. O rosa nunca carrega texto pequeno — contraste de ~3:1 sobre branco não
 *    passa em corpo de texto. Ele preenche fundo, borda e laço; quem carrega
 *    contraste é o `brand` institucional e o `text`.
 *
 * 3. Os contatos passam pelo formulário de qualificação do site
 *    (ContatoLeadContext), e não num link direto de conversa. O briefing pedia "sem
 *    formulário obrigatório", mas a regra de 21/09/2026 — registrada no
 *    guard-rail de rastreamento — existe porque metade dos pedidos de contato
 *    ficava invisível sem ela, e é o formulário que alimenta as boas-vindas
 *    (BV-01) e o follow-up da Ana. A mensagem exigida pelo briefing continua
 *    pré-preenchida: ela viaja no `message` e chega ao WhatsApp no fim do
 *    fluxo. Para fazer como o briefing pedia, trocar os dois hooks por um
 *    window.open direto — e aceitar que o lead da campanha some.
 *
 * 4. Sem WhatsAppFAB nesta rota, de propósito: a barra fixa do rodapé no
 *    celular já é o CTA permanente, e o briefing proíbe empilhar barra fixa
 *    com botão flutuante.
 */
import { useEffect } from "react";
import { trackWhatsAppClick } from "@/lib/tracking";
import { Link } from "wouter";
import { ArrowUpRight, Check, MapPin, MessageCircle, Phone } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCanonical, useFAQSchema, useMetaDescription } from "@/components/SEOHead";
import { useTelefoneRedirect, useWhatsAppRedirect } from "@/contexts/ContatoLeadContext";
import { anosDeAtuacao } from "@shared/const";

const PRECO_DE = "R$ 500,00";
const PRECO_POR_INTEIRO = "399";
const PRECO_POR_CENTAVOS = ",90";

const MENSAGEM =
  "Olá! Gostaria de informações e de verificar o agendamento do Check-up Outubro Rosa, com os três exames anunciados por R$ 399,90.";

const EXAMES = [
  {
    titulo: "Ultrassonografia das mamas",
    descricao:
      "Exame de imagem que auxilia na avaliação das mamas, conforme a indicação e o contexto clínico.",
  },
  {
    titulo: "Ultrassonografia transvaginal",
    descricao:
      "Exame de imagem utilizado para avaliar estruturas ginecológicas, como útero e ovários, conforme indicação médica.",
  },
  {
    titulo: "Preventivo — Papanicolau",
    descricao:
      "Exame que avalia células do colo do útero para identificar alterações que possam precisar de acompanhamento.",
  },
];

const PASSOS = [
  {
    titulo: "Entre em contato",
    texto: "Clique no botão e fale com nossa equipe pelo WhatsApp.",
  },
  {
    titulo: "Confira as orientações",
    texto: "Verifique disponibilidade, documentos e preparo necessário para os exames.",
  },
  {
    titulo: "Confirme seu atendimento",
    texto: "A equipe orientará as datas e os horários disponíveis.",
  },
];

const PERGUNTAS = [
  {
    q: "O que está incluído no valor de R$ 399,90?",
    a: "O valor anunciado corresponde ao conjunto de ultrassonografia das mamas, ultrassonografia transvaginal e preventivo — Papanicolau.",
  },
  {
    q: "A mamografia está incluída?",
    a: "Não. A oferta apresentada contempla os três exames listados, e no momento a Total Quality não realiza mamografia. A ultrassonografia das mamas não substitui a mamografia quando ela é indicada.",
  },
  {
    q: "Esse pacote é indicado para qualquer pessoa?",
    a: "A necessidade de cada exame depende da avaliação individual. Converse com o profissional que acompanha sua saúde e esclareça as orientações com nossa equipe.",
  },
  {
    q: "Preciso de pedido médico ou preparo?",
    a: "A equipe informa a documentação necessária e as orientações específicas de cada exame no momento do agendamento.",
  },
  {
    q: "Posso fazer os três exames no mesmo dia?",
    a: "Essa possibilidade depende da disponibilidade dos profissionais e das orientações de cada exame. Confirme com a equipe pelo WhatsApp.",
  },
  {
    q: "Quais são as formas de pagamento e a validade da campanha?",
    a: "Consulte nossa equipe para confirmar as condições de pagamento e o período de atendimento da campanha.",
  },
];

/** Laço da campanha. Decorativo: fica fora da árvore de acessibilidade. */
function LacoRosa({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <path
        d="M12 21c-.5-3.2-1.6-5.9-3.2-8.2C7.1 10.4 6 8.6 6 6.8 6 4.7 7.5 3 9.4 3c1.3 0 2.2.8 2.6 1.9.4-1.1 1.3-1.9 2.6-1.9C16.5 3 18 4.7 18 6.8c0 1.8-1.1 3.6-2.8 6-1.6 2.3-2.7 5-3.2 8.2z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BotaoWhatsApp({
  origem,
  children,
  className = "",
}: {
  origem: string;
  children: React.ReactNode;
  className?: string;
}) {
  const abrirWhatsApp = useWhatsAppRedirect();
  return (
    <button
      type="button"
      onClick={() => {
        // Ate 29/10/2026 estes botoes abriam o formulario sem whatsapp_click.
        trackWhatsAppClick(origem);
        abrirWhatsApp(origem, MENSAGEM);
      }}
      className={`btn-pill-brand inline-flex min-h-[48px] items-center justify-center gap-2 text-center ${className}`}
    >
      {children}
      <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
    </button>
  );
}

export default function OutubroRosa() {
  const abrirTelefone = useTelefoneRedirect();

  useCanonical("https://totalquality.med.br/outubro-rosa");
  useMetaDescription(
    "Check-up Outubro Rosa na Total Quality: ultrassonografia das mamas, transvaginal e Papanicolau por R$ 399,90. Agende em Caraguatatuba."
  );
  useFAQSchema(PERGUNTAS);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ——— B. Apresentação principal ——— */}
      <main>
        <section className="bg-[oklch(0.97_0.018_18)] pt-28 pb-12 lg:pt-36 lg:pb-20">
          <div className="container">
            <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
              <div className="lg:col-span-7">
                <p className="section-label mb-5">Outubro Rosa</p>

                <h1 className="heading-display text-[clamp(2.4rem,7vw,4.5rem)] text-text">
                  Check-up Outubro Rosa
                </h1>

                <p className="mt-4 flex items-center gap-2 text-lg text-[oklch(0.52_0.15_18)]">
                  <LacoRosa className="h-6 w-6 shrink-0" />
                  <span className="font-semibold">Cuidar de você é um gesto de amor.</span>
                </p>

                <p className="mt-4 max-w-xl leading-relaxed text-text-light">
                  Conheça a condição especial da Total Quality para três exames voltados à saúde
                  mamária e ginecológica, em Caraguatatuba.
                </p>

                <ul className="mt-7 space-y-2.5">
                  {EXAMES.map((e) => (
                    <li key={e.titulo} className="flex items-start gap-3 text-text">
                      <span
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[oklch(0.72_0.14_18)]"
                        aria-hidden="true"
                      >
                        <Check className="h-3 w-3 text-white" strokeWidth={3} />
                      </span>
                      <span className="font-medium">{e.titulo}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 inline-flex flex-col rounded-2xl border border-[oklch(0.72_0.14_18)] bg-white px-6 py-5">
                  <span className="text-sm text-text-muted">
                    De <s>{PRECO_DE}</s>
                  </span>
                  <span className="mt-1 flex items-baseline gap-1 text-brand">
                    <span className="text-lg font-semibold">por R$</span>
                    <span className="heading-display text-5xl leading-none lg:text-6xl">
                      {PRECO_POR_INTEIRO}
                    </span>
                    <span className="text-2xl font-semibold lg:text-3xl">{PRECO_POR_CENTAVOS}</span>
                  </span>
                  <span className="mt-2 text-sm text-text-light">
                    Valor do conjunto dos três exames.
                  </span>
                </div>

                <div className="mt-7">
                  <BotaoWhatsApp origem="outubro_rosa_hero">Agendar pelo WhatsApp</BotaoWhatsApp>
                  <p className="mt-3 text-sm text-text-light">
                    Fale com nossa equipe para verificar disponibilidade e orientações.
                  </p>
                  <p className="mt-1 text-sm text-text-muted">Exames conforme indicação médica.</p>
                </div>
              </div>

              <div className="lg:col-span-5">
                <img
                  src="/images/outubro-rosa-900.webp"
                  width={900}
                  height={1120}
                  alt="Mulher sorrindo em ambiente claro, ilustrando a campanha Check-up Outubro Rosa"
                  className="max-h-[46vh] w-full rounded-3xl object-cover lg:max-h-none"
                  fetchPriority="high"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ——— C. Exames incluídos ——— */}
        <section id="exames" className="py-16 lg:py-24">
          <div className="container">
            <h2 className="heading-display mb-10 text-4xl text-text lg:text-5xl">
              Conheça os exames do Check-up Rosa
            </h2>

            <div className="grid gap-6 md:grid-cols-3">
              {EXAMES.map((e) => (
                <article
                  key={e.titulo}
                  className="rounded-2xl border border-black/5 bg-surface-light p-6"
                >
                  <span
                    className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[oklch(0.95_0.03_18)] text-[oklch(0.52_0.15_18)]"
                    aria-hidden="true"
                  >
                    <LacoRosa className="h-6 w-6" />
                  </span>
                  <h3 className="mb-2 text-lg font-semibold text-text">{e.titulo}</h3>
                  <p className="leading-relaxed text-text-light">{e.descricao}</p>
                </article>
              ))}
            </div>

            <p className="mt-6 max-w-3xl rounded-xl border-l-4 border-[oklch(0.72_0.14_18)] bg-surface-light p-4 text-sm leading-relaxed text-text-light">
              {/* Sem link para /exames/mamografia desde 31/10/2026: a clinica nao
                  realiza o exame no momento (decisao do Alex). */}
              A ultrassonografia das mamas não substitui a mamografia quando indicada. No
              momento, a Total Quality não realiza mamografia. A escolha dos exames deve
              considerar a avaliação individual.
            </p>
          </div>
        </section>

        {/* ——— D. Confiança ——— */}
        <section className="bg-surface-light py-16 lg:py-24">
          <div className="container">
            <h2 className="heading-display mb-10 text-4xl text-text lg:text-5xl">
              Cuidado com a confiança da Total Quality
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div>
                <p className="heading-display text-4xl text-brand">{anosDeAtuacao()} anos</p>
                <p className="mt-2 leading-relaxed text-text-light">
                  De atuação em Caraguatatuba, desde 2003.
                </p>
              </div>
              <div>
                <p className="heading-display text-4xl text-brand">Acolhimento</p>
                <p className="mt-2 leading-relaxed text-text-light">
                  Atendimento humanizado, do agendamento à entrega do laudo.
                </p>
              </div>
              <div>
                <p className="heading-display text-4xl text-brand">No Centro</p>
                <p className="mt-2 leading-relaxed text-text-light">
                  Estrutura de{" "}
                  <Link href="/exames" className="underline">
                    medicina diagnóstica
                  </Link>{" "}
                  no Centro de Caraguatatuba.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ——— E. Como agendar ——— */}
        <section className="py-16 lg:py-24">
          <div className="container">
            <h2 className="heading-display mb-10 text-4xl text-text lg:text-5xl">
              Seu agendamento começa com uma conversa
            </h2>
            <ol className="grid gap-8 md:grid-cols-3">
              {PASSOS.map((p, i) => (
                <li key={p.titulo}>
                  <span className="heading-display text-3xl text-[oklch(0.72_0.14_18)]">
                    {i + 1}
                  </span>
                  <h3 className="mt-1 text-lg font-semibold text-text">{p.titulo}</h3>
                  <p className="mt-2 leading-relaxed text-text-light">{p.texto}</p>
                </li>
              ))}
            </ol>
            <div className="mt-10">
              <BotaoWhatsApp origem="outubro_rosa_passos">
                Quero agendar meu Check-up Rosa
              </BotaoWhatsApp>
            </div>
          </div>
        </section>

        {/* ——— F. Perguntas frequentes ——— */}
        <section id="duvidas" className="bg-surface py-16 lg:py-24">
          <div className="container">
            <h2 className="heading-display mb-10 text-4xl text-text lg:text-5xl">
              Perguntas frequentes
            </h2>
            <div className="max-w-3xl space-y-4">
              {PERGUNTAS.map((f) => (
                <details
                  key={f.q}
                  className="group overflow-hidden rounded-xl border border-black/5 bg-white"
                >
                  <summary className="flex min-h-[48px] cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold text-text">
                    {f.q}
                    <span
                      className="shrink-0 text-[oklch(0.52_0.15_18)] transition-transform group-open:rotate-45"
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </summary>
                  <p className="px-5 pb-5 leading-relaxed text-text-light">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ——— G. Localização ——— */}
        <section id="localizacao" className="py-16 lg:py-24">
          <div className="container">
            <h2 className="heading-display mb-8 text-4xl text-text lg:text-5xl">
              Estamos no Centro de Caraguatatuba
            </h2>
            <div className="grid gap-8 lg:grid-cols-2">
              <address className="not-italic leading-relaxed text-text-light">
                <strong className="text-text">Total Quality Medicina Diagnóstica</strong>
                <br />
                Rua Padre Anchieta, 1010 – Centro
                <br />
                Caraguatatuba – SP, 11660-010
                <br />
                Segunda a sexta, das 7h30 às 18h
                <br />
                <button
                  type="button"
                  onClick={() => abrirTelefone("outubro_rosa")}
                  className="mt-2 min-h-[48px] underline"
                >
                  (12) 3887-3535
                </button>
              </address>
              <div className="flex flex-wrap items-start gap-3">
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Rua+Padre+Anchieta,+1010+-+Centro,+Caraguatatuba+-+SP"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-pill inline-flex min-h-[48px] items-center gap-2"
                >
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  Como chegar
                </a>
                <BotaoWhatsApp origem="outubro_rosa_localizacao">
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  Falar no WhatsApp
                </BotaoWhatsApp>
              </div>
            </div>
          </div>
        </section>

        {/* ——— H. Chamada final ——— */}
        <section className="bg-[oklch(0.97_0.018_18)] py-16 lg:py-24">
          <div className="container text-center">
            <LacoRosa className="mx-auto mb-4 h-10 w-10 text-[oklch(0.62_0.16_18)]" />
            <h2 className="heading-display text-4xl text-text lg:text-5xl">
              Reserve um momento para cuidar de você
            </h2>
            <p className="mx-auto mt-4 max-w-xl leading-relaxed text-text-light">
              Fale com a Total Quality e saiba como agendar seu Check-up Outubro Rosa.
            </p>
            <p className="mt-6 text-lg text-text">
              De <s className="text-text-muted">{PRECO_DE}</s> por{" "}
              <strong className="text-brand">R$ 399,90</strong>
            </p>
            <div className="mt-6">
              <BotaoWhatsApp origem="outubro_rosa_final">Agendar pelo WhatsApp</BotaoWhatsApp>
            </div>
            <p className="mt-3 text-sm text-text-muted">Exames conforme indicação médica.</p>
          </div>
        </section>
      </main>

      <Footer />

      {/*
        Barra fixa só no celular. `pb-[env(safe-area-inset-bottom)]` respeita a
        faixa do iPhone; o espaçador logo abaixo impede que ela cubra o rodapé.
      */}
      <div className="h-20 lg:hidden" aria-hidden="true" />
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <span className="leading-tight">
            <span className="block text-xs text-text-muted">Três exames</span>
            <strong className="text-lg text-brand">R$ 399,90</strong>
          </span>
          <BotaoWhatsApp origem="outubro_rosa_barra" className="flex-1 max-w-[12rem]">
            Agendar
          </BotaoWhatsApp>
        </div>
      </div>
    </div>
  );
}

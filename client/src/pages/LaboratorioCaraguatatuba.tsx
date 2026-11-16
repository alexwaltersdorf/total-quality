/*
 * /laboratorio-caraguatatuba — "analises clinicas em Caraguatatuba" (a home e
 * a dona de "laboratorio": shared/const.ts).
 *
 * SEO nov/2026, Fase 3: desenhada pelo modelo unico (components/PaginaServico.tsx)
 * com o conteudo de lib/paginasServico.ts (PAGINA_LABORATORIO). Os blocos
 * proprios desta pagina — listas de exames com link, bairros, convenios,
 * horarios e "por que escolher" — entram como extras do modelo.
 *
 * Rastreamento: os mesmos eventos de antes (lab_caraguatatuba_cta;
 * telefone landing_lab_hero, landing_lab_contato e landing_lab_cta).
 */
import { useEffect } from "react";
import { Link } from "wouter";
import { CheckCircle, Stethoscope, Microscope, Heart, Brain, Phone } from "lucide-react";
import { useCanonical, useMetaDescription } from "@/components/SEOHead";
import { ANALISES_TITLE, ANALISES_H1, ANALISES_DESCRIPTION, CONVENIOS_TEXTO } from "@shared/const";
import { trackScheduleExam } from "@/lib/tracking";
import { BAIRROS_TITULO, BAIRROS_INTRO, BAIRROS_GRUPOS, BAIRROS_PARAGRAFOS } from "@/lib/bairrosAtendidos";
import { useTelefoneRedirect, useWhatsAppRedirect } from "@/contexts/ContatoLeadContext";
import { LAB_FAQS, PAGINA_LABORATORIO, labDiferenciais } from "@/lib/paginasServico";
import PaginaServico, { artigosDaPagina, type BlocoExtra } from "@/components/PaginaServico";
import { mensagemSobre } from "@/contexts/AssuntoPagina";


/*
 * Os itens com `href` viram links internos reais (auditoria de links internos,
 * jul/2026). Antes a lista inteira era <div> + <span>: o Google via os nomes
 * dos exames como texto solto, sem caminho para as paginas que os aprofundam.
 *
 * Regra ao editar: so colocar `href` para pagina que EXISTE — item sem pagina
 * fica como texto. Link para rota inexistente cai no 404 real de
 * `resolveHttpStatus` e desperdica rastreamento.
 */
type ExamLink = { name: string; href?: string };

const examesLaboratoriais: ExamLink[] = [
  { name: "Hemograma completo", href: "/exames/hemograma" },
  { name: "Glicemia em jejum" },
  { name: "Colesterol total e frações" },
  { name: "Triglicerídeos" },
  { name: "TSH e T4 livre" },
  { name: "PSA total e livre" },
  { name: "Vitamina D", href: "/blog/vitamina-d-importancia-saude" },
  { name: "Hemoglobina glicada" },
  { name: "Ureia e creatinina" },
  { name: "TGO e TGP" },
  { name: "Ácido úrico" },
  { name: "Hormônios" },
  { name: "Marcadores tumorais" },
  { name: "Coagulograma" },
  { name: "Exame de urina" },
  { name: "Sexagem fetal", href: "/exames/sexagem-fetal" },
  { name: "Exame toxicológico", href: "/exames/exame-toxicologico" },
  { name: "Sorologias" },
  // Estava no pre-render e faltava aqui (SEO nov/2026, Fase 1).
  { name: "Exames ocupacionais e ASO", href: "/exames/exame-admissional" },
  { name: "Parasitológico de fezes" },
];

const examesImagem: Array<ExamLink & { icon: typeof Microscope }> = [
  { icon: Microscope, name: "Tomografia Computadorizada Multislice", href: "/exames/tomografia-computadorizada" },
  { icon: Stethoscope, name: "Ultrassonografia Geral e Doppler", href: "/exames/ultrassonografia" },
  { icon: Microscope, name: "Raio-X Digital", href: "/exames/raio-x" },
  // Mamografia saiu daqui em 31/10/2026, pelo mesmo motivo: a clinica NAO
  // realiza no momento ("No momento nao realizamos Mamografia", Alex).
  // /exames/mamografia faz 301 para /exames/ultrassonografia.
  // Ecocardiograma saiu daqui em 01/08/2026: a clinica NAO realiza no momento
  // (informado pelo Alex), embora pretenda oferecer no futuro. Nao reintroduzir
  // sem confirmacao — anunciar servico nao prestado viola as diretrizes do
  // Google e as normas do CFM, mesma regra da ressonancia magnetica.
  // Holter e MAPA estavam num card so; separados, cada um leva a sua pagina.
  { icon: Heart, name: "Holter 24h", href: "/exames/holter" },
  { icon: Heart, name: "MAPA 24h", href: "/exames/mapa" },
  { icon: Heart, name: "Eletrocardiograma", href: "/exames/eletrocardiograma" },
  { icon: Brain, name: "Eletroencefalograma", href: "/exames/eletroencefalograma" },
  { icon: Stethoscope, name: "Espirometria", href: "/exames/espirometria" },
  { icon: Stethoscope, name: "Bioimpedância", href: "/bioimpedancia" },
];

const ASSUNTO = "análises clínicas";

function ListaDeExames({ itens }: { itens: ExamLink[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {itens.map((exame) => {
        const conteudo = (
          <>
            <CheckCircle className="w-4 h-4 text-brand flex-shrink-0" />
            <span className="text-sm text-text">{exame.name}</span>
          </>
        );
        const base = "flex items-center gap-2 bg-white rounded-lg px-4 py-3 border border-black/5";
        return exame.href ? (
          <Link key={exame.name} href={exame.href} className={`${base} hover:border-brand hover:shadow-sm transition-all`}>
            {conteudo}
          </Link>
        ) : (
          <div key={exame.name} className={base}>{conteudo}</div>
        );
      })}
    </div>
  );
}

export default function LaboratorioCaraguatatuba() {
  const openWhatsApp = useWhatsAppRedirect();
  const abrirTelefone = useTelefoneRedirect();

  useEffect(() => {
    // Esta pagina e de "analises clinicas"; "laboratorio" e da home (shared/const.ts).
    document.title = ANALISES_TITLE;
  }, []);

  useCanonical("https://totalquality.med.br/laboratorio-caraguatatuba");
  useMetaDescription(ANALISES_DESCRIPTION);

  // BreadcrumbList, MedicalWebPage e FAQPage: emitidos pelo servidor no <head>
  // a partir dos mesmos dados (seo-content.ts).

  // Mensagem da pagina (Fase 2): "Olá, vim pelo site e quero informações sobre ...".
  const mensagem = mensagemSobre(ASSUNTO);
  const handleScheduleClick = () => {
    trackScheduleExam("lab_caraguatatuba_cta", "geral");
    openWhatsApp("lab_caraguatatuba_cta", mensagem);
  };

  const extras: BlocoExtra[] = [
    {
      id: "exames-laboratoriais",
      rotulo: "Exames laboratoriais em Caraguatatuba",
      node: (
        <section className="py-12 lg:py-16 bg-neutral-50">
          <div className="container">
            <h2 className="heading-display text-3xl lg:text-4xl text-text mb-4">
              Exames laboratoriais em <span className="text-brand">Caraguatatuba</span>
            </h2>
            <p className="text-text-light text-lg leading-relaxed max-w-3xl mb-10">
              A Total Quality é um{" "}
              <a href="/" className="underline decoration-brand/40 underline-offset-2 hover:text-brand transition-colors">
                laboratório em Caraguatatuba
              </a>{" "}
              que reúne análises clínicas e medicina diagnóstica no Centro da cidade desde 2003. Os resultados
              ficam disponíveis online, em curto prazo para a maioria dos{" "}
              <Link href="/exames/exames-de-sangue" className="text-brand hover:underline">
                exames de sangue em Caraguatatuba
              </Link>
              . Para acompanhar a saúde de forma preventiva, veja também o{" "}
              <Link href="/checkup" className="text-brand hover:underline">check-up completo</Link>{" "}
              e as{" "}
              <Link href="/blog/alimentacao-e-exames-laboratoriais" className="text-brand hover:underline">
                orientações de preparo e jejum
              </Link>
              .
            </p>
            <ListaDeExames itens={examesLaboratoriais} />
          </div>
        </section>
      ),
    },
    {
      id: "diagnostico-por-imagem",
      rotulo: "Diagnóstico por imagem",
      node: (
        <section className="py-12 lg:py-16">
          <div className="container">
            <h2 className="heading-display text-3xl lg:text-4xl text-text mb-4">
              Diagnóstico por imagem em <span className="text-brand">Caraguatatuba</span>
            </h2>
            <p className="text-text-light text-lg leading-relaxed max-w-3xl mb-10">
              Além das análises clínicas, a Total Quality realiza exames de imagem e cardiológicos no mesmo
              endereço, com equipe médica de radiologia, cardiologia e neurologia, que assina os laudos.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {examesImagem.map((exame) => {
                const conteudo = (
                  <>
                    <exame.icon className="w-6 h-6 text-brand flex-shrink-0" />
                    <span className="text-text font-medium">{exame.name}</span>
                  </>
                );
                const base = "flex items-center gap-4 bg-neutral-50 rounded-xl px-6 py-5 border border-black/5 hover:shadow-md transition-shadow";
                return exame.href ? (
                  <Link key={exame.name} href={exame.href} className={`${base} hover:border-brand`}>{conteudo}</Link>
                ) : (
                  <div key={exame.name} className={base}>{conteudo}</div>
                );
              })}
            </div>
          </div>
        </section>
      ),
    },
    {
      // Herdado dos artigos da regiao sul e do Jardim Primavera, consolidados
      // aqui com 301 (22/10/2026). Mesmo texto: lib/bairrosAtendidos.ts.
      id: "outros-bairros",
      rotulo: BAIRROS_TITULO,
      node: (
        <section className="py-12 lg:py-16 bg-neutral-50">
          <div className="container max-w-4xl">
            <h2 className="heading-display text-3xl lg:text-4xl text-text mb-6">{BAIRROS_TITULO}</h2>
            <p className="text-text-light leading-relaxed mb-6">{BAIRROS_INTRO}</p>
            <ul className="space-y-2 mb-6">
              {BAIRROS_GRUPOS.map((g) => (
                <li key={g.titulo} className="text-text-light leading-relaxed">
                  <span className="font-medium text-text">{g.titulo}:</span> {g.bairros}
                </li>
              ))}
            </ul>
            {BAIRROS_PARAGRAFOS.map((t) => (
              <p key={t} className="text-text-light leading-relaxed mb-4">{t}</p>
            ))}
          </div>
        </section>
      ),
    },
    {
      id: "convenios-e-horarios",
      rotulo: "Convênios e horários",
      node: (
        <section className="py-12 lg:py-16">
          <div className="container max-w-4xl">
            <h2 className="heading-display text-3xl lg:text-4xl text-text mb-4">
              Convênios e <span className="text-brand">horários</span>
            </h2>
            <p className="text-text-light text-lg leading-relaxed mb-8">
              O laboratório atende {CONVENIOS_TEXTO}. Veja a{" "}
              <Link href="/convenios" className="text-brand hover:underline">lista de convênios aceitos</Link>{" "}
              ou fale pelo WhatsApp para confirmar condições e valores. Fora desses, o atendimento é particular.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-neutral-50 rounded-2xl p-6 border border-black/5">
                <h3 className="heading-display text-xl text-text mb-3">Coleta laboratorial</h3>
                <p className="text-text-light">Segunda a sexta, das 7h30 às 18h; sábado e domingo, fechado.</p>
                <p className="text-text-light text-sm mt-2">Sem agendamento, por ordem de chegada. Coleta domiciliar mediante agendamento.</p>
              </div>
              <div className="bg-neutral-50 rounded-2xl p-6 border border-black/5">
                <h3 className="heading-display text-xl text-text mb-3">Exames de imagem</h3>
                <p className="text-text-light">Segunda a sexta, das 7h30 às 18h.</p>
                <p className="text-text-light text-sm mt-2">Com hora marcada pelo WhatsApp ou telefone.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => abrirTelefone("landing_lab_contato")}
              className="btn-pill-outline mt-8"
            >
              <Phone className="w-3.5 h-3.5" />
              (12) 3887-3535
            </button>
          </div>
        </section>
      ),
    },
    {
      id: "por-que-escolher",
      rotulo: "Por que escolher a Total Quality",
      node: (
        <section className="py-12 lg:py-16 bg-neutral-50">
          <div className="container max-w-4xl">
            <h2 className="heading-display text-3xl lg:text-4xl text-text mb-6">
              Por que escolher a <span className="text-brand">Total Quality</span>
            </h2>
            <ul className="space-y-3">
              {labDiferenciais().map((item) => (
                <li key={item} className="flex items-start gap-3 text-text-light">
                  <CheckCircle className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ),
    },
  ];

  return (
    <PaginaServico
      assunto={ASSUNTO}
      h1={ANALISES_H1}
      rotulo="Laboratório de Análises Clínicas"
      migalha="Análises clínicas"
      conteudo={PAGINA_LABORATORIO}
      faqs={LAB_FAQS}
      artigos={artigosDaPagina(PAGINA_LABORATORIO.blog ?? [])}
      mensagem={mensagem}
      agendar={handleScheduleClick}
      textoCta="Agendar Exame"
      telefone={{ topo: "landing_lab_hero", rodape: "landing_lab_cta" }}
      extras={extras}
      ctaFinal={{
        titulo: "Faça seus exames laboratoriais sem agendamento",
        texto: "A coleta é por ordem de chegada, de segunda a sexta, das 7h30 às 18h — basta trazer o pedido médico e um documento com foto.",
        botao: "Agendar pelo WhatsApp",
      }}
    />
  );
}

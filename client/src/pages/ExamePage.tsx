/*
 * Pagina de exame (/exames/:slug) e de especialidade (/especialidades/:slug).
 *
 * SEO nov/2026, Fase 3: o layout e o modelo unico (components/PaginaServico.tsx);
 * o conteudo vem de lib/paginas/exames.ts e lib/paginas/especialidades.ts
 * (ConteudoPagina, lib/modeloPagina.ts); FAQ, title e description continuam
 * em examesData/especialidadesData — a MESMA lista do FAQPage do servidor.
 *
 * Rastreamento: os mesmos eventos de antes (trackScheduleExam + formulario de
 * qualificacao, origem `exame_<slug>`; telefone `exame_topo`/`exame_rodape`).
 * O bloco para empresas (medicina do trabalho, exame admissional) usa os
 * mesmos eventos com a origem `exame_<slug>_empresa` — nenhum evento novo.
 */
import { useEffect } from "react";
import { Link, useParams, useLocation } from "wouter";
import { trackScheduleExam } from "@/lib/tracking";
import { useWhatsAppRedirect } from "@/contexts/ContatoLeadContext";
import { getExamBySlug, type ExamData } from "@/lib/examesData";
import { getEspecialidadeBySlug, ESPECIALIDADES_BASE } from "@/lib/especialidadesData";
import { blogPosts } from "@/lib/blogPublicados";
import { blogLinksFor, examesDeSangueLista } from "@/lib/examBlogLinks";
import { conteudoDaRota } from "@/lib/paginasCatalogo";
import { useCanonical } from "@/components/SEOHead";
import PaginaServico, { artigosDaPagina, type BlocoExtra } from "@/components/PaginaServico";
import { mensagemSobre } from "@/contexts/AssuntoPagina";

/** "MAPA" fica em caixa alta; "Raio-X" vira "raio-x"; "(ECG)" fica. */
function emMinusculas(texto: string): string {
  return texto
    .split(" ")
    .map((p) => (p === p.toUpperCase() ? p : p.toLowerCase()))
    .join(" ");
}

/**
 * Assunto da mensagem do WhatsApp nesta pagina (Fase 2): "Olá, vim pelo site
 * e quero informações sobre hemograma completo".
 */
function assuntoDaPagina(exam: ExamData): string {
  if (exam.category === "consulta") return `consulta com ${emMinusculas(exam.title)}`;
  return emMinusculas(exam.title);
}

/** Lista "Exames de sangue que realizamos" (so em /exames/exames-de-sangue). */
function ListaExamesDeSangue() {
  return (
    <section className="py-12 lg:py-16">
      <div className="container max-w-4xl">
        <h2 className="heading-display text-3xl lg:text-4xl text-text mb-6">
          Exames de sangue que <span className="text-brand">realizamos</span>
        </h2>
        <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2 list-disc pl-5 text-text-light">
          {examesDeSangueLista(blogPosts).map((item) => (
            <li key={item.nome}>
              {item.href ? (
                <Link href={item.href} className="text-brand underline underline-offset-2 hover:opacity-80">
                  {item.nome}
                </Link>
              ) : (
                item.nome
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default function ExamePage() {
  const openWhatsApp = useWhatsAppRedirect();
  const params = useParams<{ slug: string }>();
  const [location, navigate] = useLocation();
  // A mesma pagina serve /exames/:slug e /especialidades/:slug (consultas e
  // medicina do trabalho, 24/10/2026): muda a fonte dos dados e os textos.
  const isEspecialidade = location.startsWith(`${ESPECIALIDADES_BASE}/`);
  const base = isEspecialidade ? ESPECIALIDADES_BASE : "/exames";
  const slug = params.slug || "";
  const exam = isEspecialidade ? getEspecialidadeBySlug(slug) : getExamBySlug(slug);
  const conteudo = conteudoDaRota(`${base}/${slug}`);

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  // SEO: title e description da MESMA fonte que o servidor injeta
  // (examesData -> routes-metadata.ts); numa navegacao interna ficam certos.
  useEffect(() => {
    if (exam) {
      document.title = exam.metaTitle;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute("content", exam.metaDescription);
    }
  }, [exam]);

  // JSON-LD (MedicalWebPage, BreadcrumbList, FAQPage): emitido pelo servidor
  // no <head>, gerado dos mesmos dados desta pagina (seo-content.ts).
  useCanonical(`${base}/${slug}`);

  useEffect(() => {
    if (!exam || !conteudo) navigate("/404");
  }, [exam, conteudo, navigate]);

  if (!exam || !conteudo) return null;

  const assunto = assuntoDaPagina(exam);
  const mensagem = mensagemSobre(assunto);
  const agendar = () => { trackScheduleExam(`exame_${exam.slug}`, exam.slug); openWhatsApp(`exame_${exam.slug}`, mensagem); };
  const empresa = conteudo.empresa;
  const agendarEmpresa = empresa
    ? () => { trackScheduleExam(`exame_${exam.slug}_empresa`, exam.slug); openWhatsApp(`exame_${exam.slug}_empresa`, empresa.mensagem); }
    : undefined;

  const laboratorio = exam.category === "laboratorio";
  const artigos = artigosDaPagina(conteudo.blog ?? blogLinksFor(exam.slug, blogPosts).map((p) => p.slug));
  const extras: BlocoExtra[] = exam.slug === "exames-de-sangue"
    ? [{ id: "exames-que-realizamos", rotulo: "Exames de sangue que realizamos", node: <ListaExamesDeSangue /> }]
    : [];

  const ctaFinal = laboratorio
    ? {
        titulo: <>Faça {exam.slug === "exames-de-sangue" ? "seus" : "seu"}{" "}<span className="text-brand">{exam.shortTitle}</span> sem agendamento</>,
        texto: "A coleta é por ordem de chegada, sem agendamento: basta trazer o pedido médico e um documento com foto, de segunda a sexta, das 7h30 às 18h.",
        botao: "Tirar dúvidas no WhatsApp",
      }
    : isEspecialidade
      ? {
          titulo: <>Agende com a <span className="text-brand">Total Quality</span></>,
          texto: "Agende pelo WhatsApp: dias e horários são confirmados no atendimento. A clínica funciona de segunda a sexta, das 7h30 às 18h.",
          botao: "Agendar pelo WhatsApp",
        }
      : {
          titulo: <>Agende {exam.slug === "ultrassonografia" ? "sua" : "seu"}{" "}<span className="text-brand">{exam.shortTitle}</span></>,
          texto: "Entre em contato para agendar seu exame. Atendemos de segunda a sexta, das 7h30 às 18h.",
          botao: "Agendar pelo WhatsApp",
        };

  return (
    <PaginaServico
      assunto={assunto}
      nome={exam.title}
      rotulo={exam.subtitle}
      migalha={exam.shortTitle}
      conteudo={conteudo}
      faqs={exam.faqs}
      artigos={artigos}
      mensagem={mensagem}
      agendar={agendar}
      textoCta={laboratorio ? "Consultar preparo e orçamento" : "Agendar pelo WhatsApp"}
      telefone={{ topo: "exame_topo", rodape: "exame_rodape" }}
      agendarEmpresa={agendarEmpresa}
      extras={extras}
      ctaFinal={ctaFinal}
      laboratorio={laboratorio}
    />
  );
}

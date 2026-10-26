import fs from "node:fs";
import nodePath from "node:path";
/**
 * Conteúdo SEO pré-renderizado por rota.
 *
 * O site é uma SPA React: sem este módulo, o HTML inicial chega ao Google
 * com o <div id="root"> vazio e nenhum texto rastreável. Aqui geramos o
 * conteúdo real de cada página prioritária como HTML estático e o servidor
 * injeta dentro do #root antes de enviar a resposta. Quando o React monta,
 * createRoot().render() substitui esse conteúdo pela aplicação — o usuário
 * final vê a página normal, e o crawler vê o conteúdo completo no primeiro
 * rastreio, sem depender da fila de renderização de JavaScript.
 *
 * Fonte de conteúdo: client/src/lib/examesData.ts (mesmo texto exibido pelo
 * React em /exames/:slug), evitando duplicação de copy.
 */

import { examesData, type ExamData } from "../../client/src/lib/examesData";
import { especialidadesData, ESPECIALIDADES_BASE } from "../../client/src/lib/especialidadesData";
import { linkifyText } from "../../client/src/lib/internalLinkTargets";
import { blogLinksFor, examesDeSangueLista } from "../../client/src/lib/examBlogLinks";
import { CONVENIOS_FAQS } from "../../client/src/lib/conveniosData";
import { BAIRROS_TITULO, BAIRROS_INTRO, BAIRROS_GRUPOS, BAIRROS_PARAGRAFOS } from "../../client/src/lib/bairrosAtendidos";
import blogIndex from "../../client/src/content/blog/index.json";
import {
  AVISO_INFORMATIVO,
  blogModifiedIso,
  blogPostingLd,
  linhaRevisao,
  IDENTIFICACAO,
  CTA_MARKER,
  extractFaqs,
  headingId,
  isoToBr,
  isPublished,
  parseBlogDate,
  relatedPosts,
  tableOfContents,
  textoContato,
  tituloContato,
  mensagemContato,
  PAGINA_EXAME_LABEL,
  type BlogPost as BlogPostFull,
  type BlogPostMeta,
} from "../../client/src/lib/blogMeta";
import {
  anosDeAtuacao,
  HOME_H1,
  ANALISES_H1,
  ANALISES_TITLE,
  ANALISES_DESCRIPTION,
  CONVENIOS_TEXTO,
  whatsappUrl,
  BLOG_EXTERNO_URL,
  BLOG_EXTERNO_TEXTO,
} from "@shared/const";

type BlogPost = BlogPostFull;

/**
 * Corpo dos artigos lido do disco: os JSONs em client/src/content/blog sao a
 * fonte unica (o cliente carrega os mesmos arquivos sob demanda).
 */
/*
 * Do source (server/_core/) o diretorio do blog esta em ../../client/...;
 * do bundle de producao (dist/index.js) esta em ../client/... — o caminho
 * unico anterior fazia TODO artigo prerenderizar sem corpo em producao
 * (o catch devolvia content: [] em silencio). Testar os dois candidatos.
 */
const BLOG_CONTENT_DIR = [
  nodePath.resolve(import.meta.dirname, "../../client/src/content/blog"),
  nodePath.resolve(import.meta.dirname, "../client/src/content/blog"),
].find((dir) => fs.existsSync(dir));

function loadBlogPostFromDisk(slug: string): BlogPost | null {
  const meta = blogPosts.find((b) => b.slug === slug);
  if (!meta) return null;
  if (!BLOG_CONTENT_DIR) {
    console.error("[seo-content] diretorio de artigos do blog nao encontrado — prerender sem corpo");
    return { ...meta, content: [] } as BlogPost;
  }
  try {
    return JSON.parse(
      fs.readFileSync(nodePath.resolve(BLOG_CONTENT_DIR, `${slug}.json`), "utf-8")
    ) as BlogPost;
  } catch {
    return { ...meta, content: [] } as BlogPost;
  }
}

/** Todos os artigos, rascunhos inclusive (a URL do rascunho prerenderiza, com noindex). */
const blogPosts = blogIndex as BlogPostMeta[];

const NAP = {
  name: "Total Quality Laboratório e Medicina Diagnóstica",
  street: "Rua Padre Anchieta, 1010 – Centro",
  city: "Caraguatatuba – SP, 11660-010",
  phoneDisplay: "(12) 3887-3535",
  phoneHref: "tel:+551238873535",
  whatsappHref: whatsappUrl(),
  hours: "Segunda a sexta, das 7h30 às 18h · Sábado e domingo fechado",
};

/*
 * Identificação obrigatória — art. 5º da Resolução CFM nº 2.336/2023.
 *
 * A norma pede o nome do estabelecimento com o número de registro E o nome do
 * responsável técnico com o dele, em local visível, em TODA peça do
 * estabelecimento. Até out/2026 o site não trazia isso em nenhuma página: nem
 * no rodapé renderizado, nem no pré-render de nenhuma das rotas.
 *
 * Entra aqui, dentro do bloco de NAP, porque esse bloco acompanha todas as
 * rotas pré-renderizadas — assim a conformidade não depende de alguém lembrar
 * de repetir o texto a cada página nova. O equivalente que o visitante com
 * JavaScript vê está em client/src/components/Footer.tsx; os dois precisam
 * dizer a mesma coisa.
 *
 * Sem a sigla do conselho em texto renderizado: apenas os dígitos.
 */
const IDENTIFICACAO_CFM = {
  estabelecimento: "Total Quality Medicina Diagnóstica",
  registro: "970616",
  responsavelTecnico: "Alex Waltersdorf - 267.339",
};

function identificacaoHtml(): string {
  return `
    <p>
      <strong>${escapeHtml(IDENTIFICACAO_CFM.estabelecimento)}</strong> — Registro ${escapeHtml(IDENTIFICACAO_CFM.registro)} ·
      Responsável Técnico: ${escapeHtml(IDENTIFICACAO_CFM.responsavelTecnico)}
    </p>`;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

const SITE = "https://totalquality.med.br";
const BUSINESS_ID = `${SITE}/#medicalbusiness`;

/**
 * Emite blocos <script type="application/ld+json"> DENTRO do conteúdo
 * pré-renderizado. JSON-LD é válido em qualquer ponto do documento — o Google
 * lê o HTML servido antes de o React montar. Assim cada rota carrega o schema
 * DELA (MedicalWebPage/FAQPage/BreadcrumbList), em vez de todas as rotas
 * repetirem o FAQPage genérico da home, como acontecia com o bloco estático do
 * index.html (schema duplicado/conflitante nas páginas de exame).
 */
function jsonLd(objects: object[]): string {
  return objects
    .map(
      (obj) =>
        // `<` escapado: impede que um "</script>" em texto quebre o bloco.
        `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`
    )
    .join("\n");
}

type Faq = { q: string; a: string };

function faqPageLd(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
}

function breadcrumbLd(items: Array<[string, string]>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, url], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: `${SITE}${url}`,
    })),
  };
}

/** Seção visível de FAQ + schema FAQPage, gerados da MESMA fonte. */
function faqSectionHtml(faqs: Faq[]): string {
  const visible = faqs
    .map((faq) => `<h3>${escapeHtml(faq.q)}</h3><p>${escapeHtml(faq.a)}</p>`)
    .join("");
  return `<h2>Perguntas frequentes</h2>${visible}${jsonLd([faqPageLd(faqs)])}`;
}

function napHtml(ctaMessage: string): string {
  return `
    <h2>Onde fazer em Caraguatatuba</h2>
    <address>
      <strong>${escapeHtml(NAP.name)}</strong><br />
      ${escapeHtml(NAP.street)}<br />
      ${escapeHtml(NAP.city)}<br />
      Telefone: <a href="${NAP.phoneHref}">${escapeHtml(NAP.phoneDisplay)}</a> ·
      <a href="${NAP.whatsappHref}">Agende pelo WhatsApp</a><br />
      Horário de atendimento: ${escapeHtml(NAP.hours)}
    </address>
    <p>${escapeHtml(ctaMessage)}</p>
    ${identificacaoHtml()}`;
}

function internalLinksHtml(currentPath: string): string {
  const links: Array<[string, string]> = [
    ["/laboratorio-caraguatatuba", "Análises clínicas"],
    ["/exames/exames-de-sangue", "Exames de sangue"],
    ["/exames/tomografia-computadorizada", "Tomografia computadorizada"],
    ["/exames/ultrassonografia", "Ultrassonografia"],
    ["/exames/mapa", "MAPA 24h"],
    ["/exames/holter", "Holter 24h"],
    ["/exames/exame-toxicologico", "Exame toxicológico"],
    ["/exames/espirometria", "Espirometria"],
    ["/bioimpedancia", "Bioimpedância"],
    ["/checkup", "Check-up preventivo"],
    // Estas duas o Google conhecia mas nunca rastreou (auditoria do Search
    // Console): recebiam pouquissimos links internos.
    ["/exames/eletrocardiograma", "Eletrocardiograma (ECG)"],
    // Especialidades (24/10/2026): consultas e medicina do trabalho.
    ["/especialidades/endocrinologista", "Consulta com endocrinologista"],
    ["/especialidades/gastroenterologista", "Consulta com gastroenterologista"],
    ["/especialidades/medicina-do-trabalho", "Medicina do trabalho (PCMSO e ASO)"],
    ["/exames/exame-admissional", "Exame admissional e ASO"],
    ["/blog", "Blog: saúde e diagnóstico"],
  ];
  const items = links
    .filter(([href]) => href !== currentPath)
    .map(([href, label]) => `<li><a href="${href}">${escapeHtml(label)}</a></li>`)
    .join("");
  return `<h2>Outros exames na Total Quality</h2><ul>${items}</ul>`;
}

/** Mesmo bloco do ExamePage.tsx: lista de exames de sangue e artigos do blog. */
function examBlogSectionHtml(examSlug: string): string {
  const publicados = blogPosts.filter(isPublished);
  const lista =
    examSlug === "exames-de-sangue"
      ? `<h2>Exames de sangue que realizamos</h2><ul>${examesDeSangueLista(publicados)
          .map((i) => `<li>${i.href ? `<a href="${i.href}">${escapeHtml(i.nome)}</a>` : escapeHtml(i.nome)}</li>`)
          .join("")}</ul>`
      : "";
  const artigos = blogLinksFor(examSlug, publicados);
  const blog = artigos.length
    ? `<h2>Saiba mais no nosso blog</h2><ul>${artigos
        .map((p) => `<li><a href="/blog/${p.slug}">${escapeHtml(p.title)}</a></li>`)
        .join("")}</ul>`
    : "";
  return lista + blog;
}

/** Especialidade do schema.org por pagina de especialidade (sem enum para medicina do trabalho). */
const SCHEMA_SPECIALTY: Record<string, string> = {
  endocrinologista: "https://schema.org/Endocrine",
  gastroenterologista: "https://schema.org/Gastroenterologic",
};

function renderExamHtml(exam: ExamData, base = "/exames"): string {
  const h1 = exam.metaTitle.split("|")[0].trim();
  const canonical = `${SITE}${base}/${exam.slug}`;
  const isEspecialidade = base === ESPECIALIDADES_BASE;
  const indications = exam.indications
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");
  const preparations = exam.preparations
    .map((prep) => `<li>${escapeHtml(prep.text)}</li>`)
    .join("");

  // Schema proprio da pagina de exame: MedicalWebPage sobre um MedicalTest,
  // ancorado na mesma entidade canonica do index.html (#medicalbusiness) para
  // nao criar entidade duplicada, mais o breadcrumb ate o hub /exames.
  const pageLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "@id": `${canonical}#webpage`,
    url: canonical,
    name: exam.metaTitle,
    description: exam.metaDescription,
    about: {
      "@type": isEspecialidade ? "MedicalSpecialty" : "MedicalTest",
      name: exam.shortTitle,
      description: exam.whatIs,
    },
    ...(SCHEMA_SPECIALTY[exam.slug] && { specialty: SCHEMA_SPECIALTY[exam.slug] }),
    provider: { "@id": BUSINESS_ID },
  };
  const cta =
    exam.category === "laboratorio"
      ? `Faça ${exam.slug === "exames-de-sangue" ? "seus exames de sangue" : `seu exame de ${exam.shortTitle.toLowerCase()}`} sem agendamento: a coleta é por ordem de chegada, de segunda a sexta, das 7h30 às 18h. Dúvidas de preparo e convênio pelo WhatsApp.`
      : exam.category === "consulta"
        ? `Agende a consulta com ${exam.shortTitle.toLowerCase()} pelo WhatsApp ou telefone: dias e horários são confirmados no atendimento. Atendimento particular e pelos convênios ${CONVENIOS_TEXTO}.`
        : exam.category === "ocupacional"
          ? "Empresas e trabalhadores agendam pelo WhatsApp ou telefone. PCMSO, exames ocupacionais, ASO e exames complementares no mesmo endereço."
          : `Agende seu exame de ${exam.shortTitle.toLowerCase()} pelo WhatsApp ou telefone e faça em um só lugar todos os seus exames laboratoriais e de imagem.`;

  return `
    <h1>${escapeHtml(h1)}</h1>
    <p>${escapeHtml(exam.heroDescription)}</p>
    <h2>${exam.category === "consulta" ? `O que faz o ${exam.shortTitle.toLowerCase()}` : "O que é"}</h2>
    <p>${escapeHtml(exam.whatIs)}</p>
    <h2>${exam.category === "consulta" ? "Como é a consulta" : "Como funciona"}</h2>
    <p>${escapeHtml(exam.howItWorks)}</p>
    <h2>${isEspecialidade ? "Quando procurar" : "Indicações"}</h2>
    <ul>${indications}</ul>
    <h2>${isEspecialidade ? "O que levar" : "Preparo para o exame"}</h2>
    <ul>${preparations}</ul>
    ${examBlogSectionHtml(exam.slug)}
    ${faqSectionHtml(exam.faqs)}
    ${napHtml(cta)}
    ${internalLinksHtml(`${base}/${exam.slug}`)}
    ${jsonLd([
      pageLd,
      breadcrumbLd([
        ["Início", "/"],
        ...(isEspecialidade ? [] : ([["Exames", "/exames"]] as Array<[string, string]>)),
        [exam.shortTitle, `${base}/${exam.slug}`],
      ]),
    ])}`;
}

const laboratorioHtml = `
    <h1>${ANALISES_H1}</h1>
    <p>A Total Quality é um <a href="/">laboratório em Caraguatatuba</a> que reúne análises clínicas e medicina diagnóstica no Centro da cidade, com mais de ${anosDeAtuacao()} anos de atuação no Litoral Norte. Realizamos mais de 3.000 tipos de exames laboratoriais e de imagem em um só lugar, com equipamentos automatizados, equipe especializada e resultados disponíveis online.</p>
    <h2>Exames laboratoriais realizados</h2>
    <ul>
      <li><a href="/exames/hemograma">Hemograma completo</a> e <a href="/exames/exames-de-sangue">exames de sangue</a> em geral</li>
      <li>Glicemia, hemoglobina glicada e curva glicêmica</li>
      <li>Colesterol total e frações, triglicerídeos (perfil lipídico)</li>
      <li>Hormônios: TSH, T4 livre, testosterona, estradiol e outros</li>
      <li><a href="/blog/vitamina-d-importancia-saude">Vitamina D</a>, vitamina B12 e ferritina</li>
      <li>PSA e marcadores tumorais</li>
      <li>Exames de urina e fezes</li>
      <li><a href="/exames/sexagem-fetal">Sexagem fetal</a> (exame de sangue que identifica o sexo do bebê)</li>
      <li>Sorologias e <a href="/exames/exame-toxicologico">exames toxicológicos</a></li>
      <li><a href="/exames/exame-admissional">Exames ocupacionais</a> (admissional, periódico, demissional e ASO)</li>
    </ul>
    <h2>Exames de imagem e cardiológicos</h2>
    <ul>
      <li><a href="/exames/tomografia-computadorizada">Tomografia computadorizada multislice</a></li>
      <li><a href="/exames/ultrassonografia">Ultrassonografia geral e com Doppler</a></li>
      <li><a href="/exames/mamografia">Mamografia digital</a></li>
      <li><a href="/exames/raio-x">Raio-X digital</a></li>
      <li><a href="/exames/eletrocardiograma">Eletrocardiograma</a>, <a href="/exames/holter">Holter 24h</a> e <a href="/exames/mapa">MAPA 24h</a></li>
      <li><a href="/exames/eletroencefalograma">Eletroencefalograma</a></li>
      <li><a href="/exames/espirometria">Espirometria</a> e <a href="/bioimpedancia">bioimpedância</a></li>
    </ul>
    <h2>Por que escolher a Total Quality</h2>
    <ul>
      <li>Mais de ${anosDeAtuacao()} anos de experiência em Caraguatatuba</li>
      <li>Mais de 400 avaliações no Google</li>
      <li>Coleta rápida, ambiente confortável e estacionamento no Centro</li>
      <li>Resultados online em curto prazo para a maioria dos exames</li>
      <li>Atendimento particular, convênios e empresas de Caraguatatuba, Ubatuba, São Sebastião e Ilhabela</li>
    </ul>
    <h2>${BAIRROS_TITULO}</h2>
    <p>${BAIRROS_INTRO}</p>
    <ul>${BAIRROS_GRUPOS.map((g) => `<li><strong>${g.titulo}:</strong> ${g.bairros}</li>`).join("")}</ul>
    ${BAIRROS_PARAGRAFOS.map((t) => `<p>${t}</p>`).join("\n    ")}
    <h2>Perguntas frequentes</h2>
    <h3>Preciso agendar para fazer exames de sangue?</h3>
    <p>Para a maioria dos exames laboratoriais não é necessário agendamento: basta comparecer com o pedido médico e documento com foto. Veja as <a href="/blog/alimentacao-e-exames-laboratoriais">orientações de preparo e jejum</a> antes de vir. Exames de imagem e procedimentos especiais podem ser agendados pelo WhatsApp.</p>
    <h3>Quais convênios são aceitos?</h3>
    <p>Atendemos ${CONVENIOS_TEXTO}. Fora deles, o atendimento é particular, com tabela própria. Veja os <a href="/convenios">convênios aceitos</a> ou tire dúvidas pelo WhatsApp (12) 3887-3535.</p>
    <h3>Em quanto tempo sai o resultado?</h3>
    <p>A maioria dos exames de sangue tem resultado em curto prazo, disponível online. Exames específicos podem levar até 7 dias úteis.</p>
    <h3>Vocês fazem coleta domiciliar?</h3>
    <p>Sim. Realizamos coleta domiciliar de <a href="/exames/exames-de-sangue">exames laboratoriais</a> em Caraguatatuba. Agende pelo WhatsApp (12) 3887-3535 para confirmar disponibilidade, horários e valores.</p>
    ${napHtml("Venha fazer seus exames laboratoriais no Centro de Caraguatatuba, a poucos minutos da Praça Cândido Mota.")}
    ${internalLinksHtml("/laboratorio-caraguatatuba")}
    ${jsonLd([
      {
        "@context": "https://schema.org",
        "@type": "MedicalWebPage",
        "@id": `${SITE}/laboratorio-caraguatatuba#webpage`,
        url: `${SITE}/laboratorio-caraguatatuba`,
        name: ANALISES_TITLE,
        description: ANALISES_DESCRIPTION,
        about: { "@id": BUSINESS_ID },
        provider: { "@id": BUSINESS_ID },
      },
      faqPageLd([
        {
          q: "Preciso agendar para fazer exames de sangue?",
          a: "Para a maioria dos exames laboratoriais não é necessário agendamento: basta comparecer com o pedido médico e documento com foto, de segunda a sexta das 7h30 às 18h. Exames de imagem e procedimentos especiais podem ser agendados pelo WhatsApp (12) 3887-3535.",
        },
        {
          q: "Quais convênios são aceitos?",
          a: `Atendemos ${CONVENIOS_TEXTO}. Fora deles, o atendimento é particular, com tabela própria. Tire dúvidas pelo WhatsApp (12) 3887-3535.`,
        },
        {
          q: "Em quanto tempo sai o resultado?",
          a: "A maioria dos exames de sangue tem resultado em curto prazo, disponível online. Exames específicos podem levar até 7 dias úteis.",
        },
        {
          q: "Vocês fazem coleta domiciliar?",
          a: "Sim. Realizamos coleta domiciliar de exames laboratoriais em Caraguatatuba. Agende pelo WhatsApp (12) 3887-3535 para confirmar disponibilidade, horários e valores.",
        },
      ]),
      breadcrumbLd([
        ["Início", "/"],
        ["Análises clínicas", "/laboratorio-caraguatatuba"],
      ]),
    ])}`;

const bioimpedanciaHtml = `
    <h1>Bioimpedância em Caraguatatuba</h1>
    <p>A bioimpedância é um exame rápido e não invasivo que analisa a composição corporal: percentual de gordura, massa muscular, água corporal e taxa metabólica. Na Total Quality, o exame é realizado com equipamento profissional e laudo completo para acompanhamento nutricional, esportivo e clínico.</p>
    <h2>O que o exame avalia</h2>
    <ul>
      <li>Percentual de gordura corporal e gordura visceral</li>
      <li>Massa muscular esquelética</li>
      <li>Água corporal total</li>
      <li>Taxa metabólica basal</li>
      <li>Idade metabólica</li>
    </ul>
    <h2>Preparo para o exame</h2>
    <ul>
      <li>Jejum de 4 horas antes do exame</li>
      <li>Não praticar exercícios físicos intensos nas 12 horas anteriores</li>
      <li>Evitar álcool e cafeína nas 24 horas anteriores</li>
      <li>Estar bem hidratado no dia anterior</li>
    </ul>
    <h2>Perguntas frequentes</h2>
    <h3>Quanto tempo dura o exame de bioimpedância?</h3>
    <p>O exame dura poucos minutos e o resultado sai na hora, com laudo detalhado da composição corporal.</p>
    <h3>Preciso de pedido médico?</h3>
    <p>Não é obrigatório: a bioimpedância pode ser feita por indicação médica, nutricional ou por interesse próprio no acompanhamento da saúde.</p>
    <h3>Quem não deve fazer o exame?</h3>
    <p>A bioimpedância funciona com a passagem de uma corrente elétrica de baixa intensidade pelo corpo. Por isso, não é indicada para pessoas com marca-passo, desfibrilador implantável ou outros dispositivos eletrônicos internos. Gestantes devem consultar o médico antes de realizar o exame. Informe a nossa equipe no agendamento se algum desses casos se aplica a você.</p>
    <h3>Qual a diferença entre bioimpedância e IMC?</h3>
    <p>O IMC relaciona apenas peso e altura, sem distinguir do que o peso é feito. A bioimpedância separa esse total em gordura, massa muscular e água, o que permite acompanhar mudanças na composição corporal mesmo quando o peso na balança não muda.</p>
    <h3>De quanto em quanto tempo posso repetir?</h3>
    <p>O intervalo depende do objetivo do acompanhamento e de quem o conduz. Em geral, repetições muito próximas mostram variações pouco significativas, já que a composição corporal muda de forma gradual. O profissional que acompanha o seu caso é quem define a periodicidade adequada.</p>
    <h3>A bioimpedância substitui exames de sangue?</h3>
    <p>Não. Ela descreve a composição corporal e não investiga alterações metabólicas, hormonais ou nutricionais, que dependem de <a href="/exames/exames-de-sangue">exames laboratoriais</a>. Os dois se complementam, e a interpretação conjunta cabe ao profissional que acompanha você.</p>
    <h3>O resultado serve para diagnóstico?</h3>
    <p>O laudo da bioimpedância é um dado de acompanhamento, não um diagnóstico. Ele ganha sentido quando lido pelo médico ou nutricionista junto ao histórico e ao restante da avaliação clínica.</p>
    ${napHtml("Agende sua bioimpedância pelo WhatsApp e acompanhe sua composição corporal com precisão.")}
    ${internalLinksHtml("/bioimpedancia")}`;

/**
 * Pagina /convenios: "aceita meu convenio?" e o principal desempate local
 * entre laboratorios (lacuna verificada na auditoria de 01/08: as queries
 * transacionais de convenio caiam num post de blog). Esta pagina e o destino
 * transacional. O antigo post /blog/convenios-laboratorio-caraguatatuba foi
 * consolidado aqui com 301 em 22/10/2026 (uma URL por intencao).
 *
 * A lista vive tambem em client/src/lib/conveniosData.ts (o client nao pode
 * importar deste modulo, que usa node:fs). Ao mudar um convenio, mudar NOS
 * DOIS — o teste de paridade em seo-content.test.ts compara as duas listas.
 */
export const CONVENIOS = [
  "Cartão de Todos", "Solumedi", "Leader",
];


/** Link para o artigo de coleta domiciliar — so depois de publicado. */
function coletaDomiciliarLinkHtml(): string {
  const post = blogPosts.find((p) => p.slug === "coleta-domiciliar-exames-caraguatatuba");
  if (!post || !isPublished(post)) return "";
  return `<p>Não pode vir até a unidade? Veja como funciona a <a href="/blog/${post.slug}">coleta domiciliar de exames</a>.</p>`;
}

function conveniosHtml(): string {
  const lista = CONVENIOS.map((c) => `<li>${escapeHtml(c)}</li>`).join("");
  return `
    <h1>Convênios Aceitos no Laboratório em Caraguatatuba</h1>
    <p>A Total Quality Medicina Diagnóstica atende Cartão de Todos, Solumedi e Leader em Caraguatatuba – SP, para <a href="/exames/exames-de-sangue">exames de sangue</a>, <a href="/laboratorio-caraguatatuba">exames laboratoriais</a>, <a href="/exames/tomografia-computadorizada">tomografia</a>, <a href="/exames/ultrassonografia">ultrassonografia</a>, <a href="/exames/mamografia">mamografia</a> e <a href="/checkup">check-up</a>.</p>
    <h2>Convênios e cartões atendidos</h2>
    <ul>${lista}</ul>
    <p>Não trabalhamos com outros convênios ou planos de saúde: fora dessa lista, o atendimento é particular. Confirme condições e valores pelo WhatsApp <a href="${NAP.whatsappHref}">(12) 3887-3535</a> antes de vir.</p>
    ${coletaDomiciliarLinkHtml()}
    ${faqSectionHtml(CONVENIOS_FAQS)}
    ${napHtml("Confirme seu convênio pelo WhatsApp — a coleta laboratorial é sem agendamento, por ordem de chegada, de segunda a sexta, das 7h30 às 18h; exames de imagem com hora marcada.")}
    ${internalLinksHtml("/convenios")}
    ${jsonLd([
      breadcrumbLd([
        ["Início", "/"],
        ["Convênios", "/convenios"],
      ]),
    ])}`;
}

const homeHtml = `
    <h1>${HOME_H1}</h1>
    <p>Há mais de ${anosDeAtuacao()} anos no Litoral Norte, a Total Quality reúne em um só lugar <a href="/laboratorio-caraguatatuba">análises clínicas</a> e centro de diagnóstico por imagem em Caraguatatuba – SP: mais de 3.000 tipos de <a href="/exames/exames-de-sangue">exames de sangue</a>, <a href="/exames/tomografia-computadorizada">tomografia computadorizada</a>, <a href="/exames/ultrassonografia">ultrassonografia com Doppler</a>, <a href="/exames/mamografia">mamografia digital</a>, <a href="/exames/raio-x">raio-X</a>, <a href="/exames/mapa">MAPA</a>, <a href="/exames/holter">Holter 24h</a>, <a href="/exames/eletrocardiograma">eletrocardiograma</a>, <a href="/exames/eletroencefalograma">eletroencefalograma</a>, <a href="/exames/espirometria">espirometria</a>, <a href="/exames/exame-toxicologico">exame toxicológico</a>, <a href="/bioimpedancia">bioimpedância</a>, <a href="/checkup">check-up preventivo</a> e <a href="/exames/exame-admissional">medicina ocupacional</a>. Também oferece <a href="/especialidades/medicina-do-trabalho">medicina do trabalho</a> para empresas, com PCMSO e ASO, e consultas com <a href="/especialidades/endocrinologista">endocrinologista</a> e <a href="/especialidades/gastroenterologista">gastroenterologista</a>.</p>
    <ul>
      <li>Resultados online em curto prazo para a maioria dos exames</li>
      <li>Coleta laboratorial sem agendamento, por ordem de chegada — e coleta domiciliar mediante agendamento</li>
      <li>Atendimento particular, empresas e os convênios ${CONVENIOS_TEXTO}</li>
      <li>Mais de 400 avaliações no Google</li>
    </ul>
    <h2>Como funciona o laboratório</h2>
    <p>Para <a href="/exames/exames-de-sangue">exames de sangue</a> e demais exames laboratoriais, basta vir com o pedido médico e um documento com foto, de segunda a sexta, das 7h30 às 18h — o atendimento é por ordem de chegada. Antes, confira as <a href="/blog/alimentacao-e-exames-laboratoriais">orientações de preparo e jejum</a>. Quem não pode se deslocar pode pedir a coleta domiciliar pelo WhatsApp (12) 3887-3535, que confirma área atendida, horário e valor. Os resultados ficam disponíveis online.</p>
    <p>Exames de imagem e cardiológicos, como tomografia, ultrassonografia, MAPA e Holter, são agendados pelo WhatsApp ou telefone, porque dependem de horário com o médico e de preparo específico.</p>
    ${faqSectionHtml([
      {
        q: "Quais exames são realizados no laboratório em Caraguatatuba?",
        a: "A Total Quality realiza mais de 3.000 tipos de exames em Caraguatatuba - SP, incluindo exames de sangue (hemograma, glicemia, colesterol, hormônios), tomografia computadorizada, ultrassonografia, mamografia digital, raio-X, eletrocardiograma, holter 24h, MAPA, bioimpedância e check-up preventivo.",
      },
      {
        q: "Qual o endereço do laboratório em Caraguatatuba?",
        a: "O laboratório Total Quality está localizado na Rua Padre Anchieta, 1010 - Centro, Caraguatatuba - SP. Funcionamento de segunda a sexta, das 07h30 às 18h.",
      },
      {
        q: "Como agendar exames no laboratório em Caraguatatuba?",
        a: "Exames laboratoriais e de sangue não precisam de agendamento: o atendimento é por ordem de chegada, de segunda a sexta, das 07h30 às 18h. Exames de imagem e procedimentos especiais podem ser agendados pelo WhatsApp ou telefone (12) 3887-3535, ou pelo site totalquality.med.br.",
      },
      {
        q: "O laboratório em Caraguatatuba aceita convênios?",
        a: `Atendemos ${CONVENIOS_TEXTO}. Fora desses três, o atendimento é particular, com tabela própria. Tire dúvidas pelo WhatsApp (12) 3887-3535.`,
      },
    ])}
    ${napHtml("Agende seus exames pelo WhatsApp (12) 3887-3535 ou visite-nos no Centro de Caraguatatuba.")}
    ${internalLinksHtml("/")}`;

/**
 * Retorna o HTML SEO da rota, ou null para rotas sem pré-renderização.
 */
export function getSeoContentForPath(pathname: string): string | null {
  const path = pathname.split("?")[0].replace(/\/$/, "") || "/";

  if (path === "/") return wrap(homeHtml);
  if (path === "/laboratorio-caraguatatuba") return wrap(laboratorioHtml);
  if (path === "/bioimpedancia") return wrap(bioimpedanciaHtml);

  if (path === "/privacidade") return wrap(privacidadeHtml);
  if (path === "/checkup") return wrap(checkupHtml);
  if (path === "/convenios") return wrap(conveniosHtml());
  if (path === "/outubro-rosa") return wrap(outubroRosaHtml);
  if (path === "/exames") return wrap(examesHubHtml());

  const examMatch = path.match(/^\/exames\/([a-z0-9\-]+)$/);
  if (examMatch) {
    const exam = examesData.find((e) => e.slug === examMatch[1]);
    if (exam) return wrap(renderExamHtml(exam));
  }

  const espMatch = path.match(/^\/especialidades\/([a-z0-9\-]+)$/);
  if (espMatch) {
    const esp = especialidadesData.find((e) => e.slug === espMatch[1]);
    if (esp) return wrap(renderExamHtml(esp, ESPECIALIDADES_BASE));
  }

  if (path === "/blog") return wrap(blogIndexHtml());

  const blogMatch = path.match(/^\/blog\/([a-z0-9\-]+)$/);
  if (blogMatch) {
    const post = loadBlogPostFromDisk(blogMatch[1]);
    if (post) return wrap(renderBlogHtml(post));
  }

  return null;
}

/*
 * Campanha Check-up Outubro Rosa.
 *
 * O texto aqui e o que o robo le antes do React montar, entao precisa dizer o
 * mesmo que a pagina: os tres exames, os dois precos e a ressalva da
 * mamografia. Nada de "a partir de" nem de prazo que nao foi confirmado.
 *
 * Sazonal: sai junto com a rota quando a campanha encerrar.
 */
const outubroRosaHtml = `
    <h1>Check-up Outubro Rosa</h1>
    <p><strong>Cuidar de você é um gesto de amor.</strong> Conheça a condição especial da Total Quality para três exames voltados à saúde mamária e ginecológica, em Caraguatatuba.</p>
    <h2>Os três exames do Check-up Rosa</h2>
    <ul>
      <li><strong>Ultrassonografia das mamas</strong> — exame de imagem que auxilia na avaliação das mamas, conforme a indicação e o contexto clínico.</li>
      <li><strong>Ultrassonografia transvaginal</strong> — exame de imagem utilizado para avaliar estruturas ginecológicas, como útero e ovários, conforme indicação médica.</li>
      <li><strong>Preventivo — Papanicolau</strong> — exame que avalia células do colo do útero para identificar alterações que possam precisar de acompanhamento.</li>
    </ul>
    <p>De R$ 500,00 por <strong>R$ 399,90</strong>. Valor do conjunto dos três exames. Exames conforme indicação médica.</p>
    <p>A ultrassonografia das mamas não substitui a <a href="/exames/mamografia">mamografia</a> quando indicada. A escolha dos exames deve considerar a avaliação individual.</p>
    <h2>Como agendar</h2>
    <p>O agendamento começa por uma conversa: fale com a equipe pelo WhatsApp para verificar disponibilidade, documentos e preparo. A confirmação de data e horário é feita pela equipe.</p>
    <h2>Perguntas frequentes</h2>
    <h3>O que está incluído no valor de R$ 399,90?</h3>
    <p>O valor anunciado corresponde ao conjunto de ultrassonografia das mamas, ultrassonografia transvaginal e preventivo — Papanicolau.</p>
    <h3>A mamografia está incluída?</h3>
    <p>Não. A oferta apresentada contempla os três exames listados. A ultrassonografia das mamas não substitui a mamografia quando ela é indicada.</p>
    <h3>Esse pacote é indicado para qualquer pessoa?</h3>
    <p>A necessidade de cada exame depende da avaliação individual. Converse com o profissional que acompanha sua saúde e esclareça as orientações com nossa equipe.</p>
    <h3>Posso fazer os três exames no mesmo dia?</h3>
    <p>Essa possibilidade depende da disponibilidade dos profissionais e das orientações de cada exame. Confirme com a equipe pelo WhatsApp.</p>
    ${napHtml("Fale com a Total Quality e saiba como agendar seu Check-up Outubro Rosa.")}
    ${internalLinksHtml("/outubro-rosa")}`;

const privacidadeHtml = `
    <h1>Política de Privacidade</h1>
    <p>A Total Quality Medicina Diagnóstica trata dados pessoais e dados de saúde conforme a LGPD — Lei Geral de Proteção de Dados (Lei 13.709/2018). Esta página explica quais dados coletamos, como usamos, por quanto tempo guardamos e como você exerce seus direitos.</p>
    <h2>Quais dados coletamos</h2>
    <ul>
      <li>Dados de contato informados no formulário do site ou pelo WhatsApp: nome, telefone, e-mail e exame de interesse.</li>
      <li>Dados de navegação: páginas visitadas, origem do acesso e dispositivo, por meio de cookies e ferramentas de análise.</li>
      <li>Dados de saúde: coletados apenas no atendimento presencial. O site não coleta nem armazena resultados de exames.</li>
    </ul>
    <h2>Dados de saúde e sigilo profissional</h2>
    <p>Resultados de exames são dados pessoais sensíveis, protegidos pelo sigilo profissional, e entregues somente ao paciente, ao seu representante legal ou ao médico solicitante, mediante identificação.</p>
    <h2>Seus direitos</h2>
    <p>Você pode confirmar a existência de tratamento, acessar, corrigir, anonimizar ou excluir seus dados, revogar consentimento e solicitar portabilidade. Para exercer qualquer desses direitos, fale com a gente pelo telefone (12) 3887-3535 ou pelo e-mail contato@totalquality.med.br.</p>
    ${napHtml("Dúvidas sobre o tratamento dos seus dados? Fale com a nossa equipe.")}`;

const checkupHtml = `
    <h1>Check-up Preventivo em Caraguatatuba</h1>
    <p>O check-up preventivo da Total Quality reúne exames laboratoriais, cardiológicos e de imagem em pacotes por faixa etária — Básico, Select e Premium — realizados em um só lugar, no Centro de Caraguatatuba, com resultados online e orientação da nossa equipe. É o check-up completo para cada fase da vida, montado a partir do pedido do seu médico.</p>
    <h2>O que os pacotes incluem</h2>
    <ul>
      <li>Exames de sangue: hemograma completo, glicemia, perfil lipídico (colesterol e triglicerídeos), função renal e hepática</li>
      <li>Hormônios: TSH e T4 livre para avaliação da tireoide</li>
      <li>Vitamina D e vitamina B12</li>
      <li>Avaliação cardiológica: <a href="/exames/eletrocardiograma">eletrocardiograma</a> e, conforme o pacote, <a href="/exames/holter">Holter 24h</a> ou <a href="/exames/mapa">MAPA 24h</a></li>
      <li>PSA para homens e exames específicos por faixa etária</li>
      <li>Exame de urina e outros conforme o pacote escolhido</li>
    </ul>
    <h2>Para quem é indicado</h2>
    <ul>
      <li>Adultos de 20 a 35 anos: check-up a cada dois anos</li>
      <li>A partir dos 40 anos: check-up anual com marcadores adicionais</li>
      <li>A partir dos 50 anos: protocolo ampliado com rastreamentos específicos</li>
    </ul>
    <h2>Perguntas frequentes</h2>
    <h3>Preciso de pedido médico para fazer check-up?</h3>
    <p>Para os pacotes de check-up da Total Quality não é necessário pedido médico — nossa equipe orienta o pacote mais adequado ao seu perfil e histórico.</p>
    <h3>Quanto tempo demoram os resultados?</h3>
    <p>A maioria dos exames laboratoriais tem resultado em curto prazo, com acesso online. Exames de imagem têm laudo rápido, geralmente em poucos dias.</p>
    ${napHtml("Invista na sua saúde: agende seu check-up preventivo pelo WhatsApp e faça tudo em uma única visita.")}
    ${internalLinksHtml("/checkup")}`;

function examesHubHtml(): string {
  const categorias: Array<[string, string]> = [
    ["laboratorio", "Exames laboratoriais e análises clínicas"],
    ["imagem", "Diagnóstico por imagem"],
    ["cardiologia", "Exames cardiológicos"],
    ["neurologia", "Neurologia"],
    ["outros", "Medicina ocupacional e outros"],
  ];
  const sections = categorias
    .map(([cat, label]) => {
      const items = examesData
        .filter((e) => e.category === cat)
        .map((e) => `<li><a href="/exames/${e.slug}">${escapeHtml(e.shortTitle)}</a> — ${escapeHtml(e.description)}</li>`)
        .join("");
      return items ? `<h2>${escapeHtml(label)}</h2><ul>${items}</ul>` : "";
    })
    .join("");
  return `
    <h1>Exames Laboratoriais e de Imagem em Caraguatatuba</h1>
    <p>A Total Quality reúne em um só endereço, no Centro de Caraguatatuba, mais de 3.000 tipos de exames laboratoriais, exames de imagem, cardiológicos e ocupacionais — com resultados online em curto prazo para a maioria dos exames laboratoriais e equipe especializada há mais de ${anosDeAtuacao()} anos no Litoral Norte.</p>
    ${sections}
    <p><a href="/bioimpedancia">Bioimpedância</a> — análise completa de composição corporal.</p>
    <p><a href="/checkup">Check-up preventivo</a> — pacotes completos por faixa etária.</p>
    ${napHtml("Não encontrou o exame que procura? Fale com a gente pelo WhatsApp — realizamos mais de 3.000 tipos de exames.")}`;
}

function blogIndexHtml(): string {
  const items = blogPosts
    .filter(isPublished)
    .sort((a, b) => parseBlogDate(b.date) - parseBlogDate(a.date))
    .map((b) => `<li><a href="/blog/${b.slug}">${escapeHtml(b.title)}</a> — ${escapeHtml(b.excerpt)}</li>`)
    .join("");
  return `
    <h1>Blog Total Quality — Saúde e Diagnóstico</h1>
    <p>Artigos escritos pela equipe da Total Quality Medicina Diagnóstica sobre exames, prevenção e saúde no Litoral Norte.</p>
    <ul>${items}</ul>
    <h2>Mais artigos de saúde</h2>
    <p>Outros temas de prevenção e de exames, que não se repetem aqui, estão no blog externo da clínica: <a href="${BLOG_EXTERNO_URL}">${BLOG_EXTERNO_TEXTO}</a>.</p>
    ${identificacaoHtml()}
    ${internalLinksHtml("/blog")}`;
}

function parseMarkdownTableRow(line: string): string[] {
  return line.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
}

const SITE_ORIGIN = "https://totalquality.med.br";

function toRelativeHref(url: string): string {
  return url.startsWith(SITE_ORIGIN) ? url.slice(SITE_ORIGIN.length) || "/" : url;
}

/**
 * "[texto](url)" — link explicito no corpo do artigo. Registra o destino em
 * usedHrefs (quando interno) para o auto-linker nao duplicar outro link para
 * o mesmo alvo mais adiante no mesmo artigo.
 */
function renderInlineHtml(text: string, currentPath: string, usedHrefs: Set<string>): string {
  return text
    .split(/(\[[^\]]+\]\([^)]+\))/g)
    .filter((part) => part.length > 0)
    .map((part) => {
      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch) {
        const [, linkText, url] = linkMatch;
        const isInternal = url.startsWith(SITE_ORIGIN) || url.startsWith("/");
        const href = toRelativeHref(url);
        if (isInternal) usedHrefs.add(href);
        return isInternal
          ? `<a href="${href}">${escapeHtml(linkText)}</a>`
          : `<a href="${url}" target="_blank" rel="noopener noreferrer">${escapeHtml(linkText)}</a>`;
      }

      return part
        .split(/(\*\*[^*]+\*\*)/g)
        .filter((p) => p.length > 0)
        .map((bp) => {
          const isBold = bp.startsWith("**") && bp.endsWith("**");
          const raw = isBold ? bp.slice(2, -2) : bp;
          const html = linkifyText(raw, currentPath, usedHrefs)
            .map((s) => (s.href ? `<a href="${s.href}">${escapeHtml(s.text)}</a>` : escapeHtml(s.text)))
            .join("");
          return isBold ? `<strong>${html}</strong>` : html;
        })
        .join("");
    })
    .join("");
}

/**
 * Corpo do artigo em HTML: interpreta a formatacao markdown leve usada nos
 * textos (##/### para titulos, **negrito**, listas "- item" e tabelas
 * "| col |") e aplica a linkagem interna automatica (client/src/lib/
 * internalLinkTargets.ts, fonte unica — mesma logica usada pelo
 * renderBlogContent.tsx no cliente). Antes disso cada item do array virava
 * um <p> literal, entao o crawler via os caracteres ##, ** e | crus no HTML.
 */
function renderBlogBodyHtml(content: string[], currentPath: string, ctaHtml = ""): string {
  const usedHrefs = new Set<string>();

  return content
    .map((block) => {
      const trimmed = block.trimStart();

      if (trimmed.startsWith("### ")) {
        return `<h3>${renderInlineHtml(trimmed.slice(4), currentPath, usedHrefs)}</h3>`;
      }
      if (trimmed.trim() === CTA_MARKER) return ctaHtml;
      if (trimmed.startsWith("## ")) {
        return `<h2 id="${headingId(trimmed.slice(3))}">${renderInlineHtml(trimmed.slice(3), currentPath, usedHrefs)}</h2>`;
      }
      if (trimmed.startsWith("|")) {
        const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
        const [headerLine, separatorLine, ...bodyLines] = lines;
        const header = parseMarkdownTableRow(headerLine);
        const isSeparator = /^\|?[\s:|-]+\|?$/.test(separatorLine ?? "");
        const rows = (isSeparator ? bodyLines : [separatorLine, ...bodyLines].filter(Boolean)).map(parseMarkdownTableRow);
        const thead = `<tr>${header.map((c) => `<th>${renderInlineHtml(c, currentPath, usedHrefs)}</th>`).join("")}</tr>`;
        const tbody = rows
          .map((r) => `<tr>${r.map((c) => `<td>${renderInlineHtml(c, currentPath, usedHrefs)}</td>`).join("")}</tr>`)
          .join("");
        return `<table><thead>${thead}</thead><tbody>${tbody}</tbody></table>`;
      }
      if (trimmed.startsWith("- ")) {
        const items = block
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l.startsWith("- "))
          .map((l) => l.slice(2));
        return `<ul>${items.map((it) => `<li>${renderInlineHtml(it, currentPath, usedHrefs)}</li>`).join("")}</ul>`;
      }

      return `<p>${renderInlineHtml(block, currentPath, usedHrefs)}</p>`;
    })
    .join("");
}

/**
 * Quadro de contato do artigo de exame — mesmo texto do ExamCTA.tsx. A coleta
 * laboratorial e sem agendamento (decisao de 01/08/2026); o WhatsApp tira
 * duvidas e combina a coleta domiciliar.
 */
function examCtaHtml(examName: string, horaMarcada?: boolean, examPages: string[] = []): string {
  const paragrafos = textoContato(horaMarcada).map((t) => `<p>${escapeHtml(t)}</p>`).join("\n      ");
  const paginas = examPages
    .filter((href) => PAGINA_EXAME_LABEL[href])
    .map((href) => `<a href="${href}">${escapeHtml(PAGINA_EXAME_LABEL[href])}</a>`)
    .join(" · ");
  const whats = whatsappUrl(mensagemContato(examName, horaMarcada));
  return `
    <aside>
      <p><strong>${escapeHtml(tituloContato(examName))}</strong></p>
      ${paragrafos}
      <p><a href="${escapeHtml(whats)}" target="_blank" rel="noopener noreferrer">${horaMarcada ? "Agendar pelo WhatsApp" : "Tirar dúvidas pelo WhatsApp"}</a>${paginas ? ` · ${paginas}` : ""}</p>
    </aside>`;
}

/** Rodape do artigo — mesmo texto do MedicalFooter.tsx. */
function blogFooterHtml(post: BlogPost): string {
  const revisao = post.lastReviewed
    ? `<p>Última revisão médica: ${isoToBr(post.lastReviewed)}</p>`
    : isPublished(post)
      ? ""
      : "<p>Rascunho — revisão médica pendente.</p>";
  return `
    <footer>
      <p><strong>${AVISO_INFORMATIVO}</strong></p>
      <p>${IDENTIFICACAO.join("<br>")}</p>
      <p>Última atualização: ${isoToBr(blogModifiedIso(post))}</p>
      ${revisao}
    </footer>`;
}

function renderBlogHtml(post: BlogPost): string {
  const currentPath = `/blog/${post.slug}`;
  const cta = post.examName ? examCtaHtml(post.examName, post.horaMarcada, post.examPages) : "";
  const bodyHtml = renderBlogBodyHtml(post.content, currentPath, cta);
  const toc = tableOfContents(post.content);
  const tocHtml = toc.length
    ? `<nav aria-label="Sumário"><p>Neste artigo</p><ol>${toc
        .map((t) => `<li><a href="#${t.id}">${escapeHtml(t.text)}</a></li>`)
        .join("")}</ol></nav>`
    : "";
  const related = relatedPosts(post, blogPosts);
  const relatedHtml = related.length
    ? `<h2>Artigos relacionados</h2><ul>${related
        .map((r) => `<li><a href="/blog/${r.slug}">${escapeHtml(r.title)}</a></li>`)
        .join("")}</ul>`
    : "";
  const faqs = extractFaqs(post.content);
  return `
    <article>
      <h1>${escapeHtml(post.title)}</h1>
      <p><em>${escapeHtml(post.subtitle)}</em></p>
      <p>${escapeHtml(post.author)} · ${escapeHtml(post.authorRole)} · ${escapeHtml(post.readTime)} de leitura</p>
      <p>${escapeHtml(linhaRevisao(post))}</p>
      ${tocHtml}
      ${bodyHtml}
      ${cta}
      ${blogFooterHtml(post)}
    </article>
    ${relatedHtml}
    ${napHtml("Coleta laboratorial sem agendamento, por ordem de chegada, e resultados online. Dúvidas de preparo e convênio pelo WhatsApp.")}
    ${internalLinksHtml("/blog/" + post.slug)}
    ${jsonLd([
      blogPostingLd(post),
      breadcrumbLd([
        ["Início", "/"],
        ["Blog", "/blog"],
        [post.title, currentPath],
      ]),
      ...(faqs.length ? [faqPageLd(faqs)] : []),
    ])}`;
}

function wrap(inner: string): string {
  // Markup semântico simples; o React substitui este bloco ao montar.
  return `<main class="seo-prerender">${inner}</main>`;
}

/**
 * Injeta o conteúdo SEO dentro do <div id="root"> do HTML.
 */
export function injectSeoContent(html: string, content: string): string {
  return html.replace(
    /(<div id="root">)(\s*)(<\/div>)/,
    (_m, open, _ws, close) => `${open}${content}${close}`
  );
}

// Rotas exatas registradas no router do cliente (App.tsx)
const CLIENT_ROUTES = new Set([
  "/",
  "/exames",
  "/checkup",
  "/convenios",
  "/privacidade",
  "/bioimpedancia",
  "/blog",
  "/laboratorio-caraguatatuba",
  "/ligar",
  "/obrigado-chamada",
  "/formulario-sucesso",
  "/cartao",
  "/404",
  // Esquecer uma rota de primeiro nivel aqui NAO quebra a pagina: o servidor
  // entrega o documento inteiro, so que com status 404. O Google nao indexa
  // pagina servida assim, e um anuncio pago leva o clique para uma URL
  // marcada como inexistente. Foi o que aconteceu com /outubro-rosa entre
  // 18 e 19/10/2026, numa pagina de campanha com preco anunciado.
  "/outubro-rosa",
]);

const VALID_EXAM_SLUGS = new Set(examesData.map((exam) => exam.slug));
const VALID_ESPECIALIDADE_SLUGS = new Set(especialidadesData.map((e) => e.slug));

/**
 * Resolve o status HTTP correto para uma rota de página.
 *
 * Antes, qualquer URL devolvia 200 com a homepage (soft-404). Agora:
 * - rotas conhecidas → 200
 * - /exames/:slug ou /blog/:slug desconhecidos → 404
 * - caminhos profundos sem correspondência → 404
 * - slugs de primeiro nível desconhecidos → 200 (artigos dinâmicos do
 *   AutoSEO são servidos pelo catch-all /:slug do cliente)
 */
export function resolveHttpStatus(
  pathname: string,
  knownBlogSlugs: Set<string>,
  knownAutoSeoSlugs?: Set<string> | null
): number {
  const path = pathname.split("?")[0].replace(/\/$/, "") || "/";

  // Rotas do painel administrativo removido: 404 explicito, senao caem na regra
  // de slug de primeiro nivel (artigos AutoSEO) e voltariam 200.
  if (path === "/admin" || path.startsWith("/admin/") || path === "/dashboard") {
    return 404;
  }

  if (CLIENT_ROUTES.has(path)) return 200;

  const examMatch = path.match(/^\/exames\/([a-z0-9\-]+)$/);
  if (examMatch) return VALID_EXAM_SLUGS.has(examMatch[1]) ? 200 : 404;

  const espMatch = path.match(/^\/especialidades\/([a-z0-9\-]+)$/);
  if (espMatch) return VALID_ESPECIALIDADE_SLUGS.has(espMatch[1]) ? 200 : 404;

  const blogMatch = path.match(/^\/blog\/([a-z0-9\-]+)$/);
  if (blogMatch) return knownBlogSlugs.has(blogMatch[1]) ? 200 : 404;

  // Slug de primeiro nivel: rota catch-all dos artigos AutoSEO. So devolve 200
  // se o slug existir de fato. Quando a lista ainda nao carregou (banco fora do
  // ar, boot em andamento) `knownAutoSeoSlugs` vem null e mantemos o 200 antigo
  // — melhor um soft 404 transitorio que 404 num artigo real.
  if (/^\/[a-z0-9\-]+$/i.test(path)) {
    if (!knownAutoSeoSlugs) return 200;
    return knownAutoSeoSlugs.has(path.slice(1)) ? 200 : 404;
  }

  return 404;
}

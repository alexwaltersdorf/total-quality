/*
 * Modelo unico de pagina de exame e de consulta (SEO nov/2026, Fase 3).
 *
 * Usado por /exames/*, /especialidades/* (ExamePage), /laboratorio-caraguatatuba,
 * /checkup e /bioimpedancia. Ordem dos blocos (plano §5.2):
 *   H1 "[Nome] em Caraguatatuba" → resposta curta → WhatsApp + Ligar →
 *   Resumo rapido → Nesta pagina → foto real → H2 em pergunta → tipos →
 *   blocos proprios da pagina → empresas → Onde fazer → FAQ → Saiba mais +
 *   Exames relacionados → "Revisado por ... · Atualizado em <time>" → CTA final.
 *
 * Bloco sem dado verificado nao e renderizado (o dado tem um TODO(alex)).
 * Renderizado no servidor e hidratado: nada aqui pode depender de window no
 * primeiro render.
 *
 * Rastreamento: os CTAs recebem as MESMAS funcoes que cada pagina ja usava
 * (mesmos eventos, mesmas origens de lead e de telefone). O bloco para
 * empresas usa os mesmos eventos com uma origem de lead propria.
 */
import type { ReactNode } from "react";
import { Link } from "wouter";
import { ArrowUpRight, CheckCircle, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFAB from "@/components/WhatsAppFAB";
import OndeFazer from "@/components/OndeFazer";
import CtaWhatsApp from "@/components/CtaWhatsApp";
import ResponsiveImage from "@/components/ResponsiveImage";
import { AssuntoPagina } from "@/contexts/AssuntoPagina";
import { useTelefoneRedirect } from "@/contexts/ContatoLeadContext";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { blogPosts } from "@/lib/blogPublicados";
import { cartaoDaRota } from "@/lib/paginasCatalogo";
import {
  CAMPOS_RESUMO,
  FOTO_FACHADA,
  REVISOR_PAGINAS,
  dataBr,
  type ConteudoPagina,
} from "@/lib/modeloPagina";

export type Faq = { q: string; a: string };

/** Bloco proprio de uma pagina (lista de exames do laboratorio, planos do check-up...). */
export interface BlocoExtra {
  id: string;
  /** entrada do "Nesta pagina" */
  rotulo: string;
  node: ReactNode;
}

export interface PaginaServicoProps {
  /** assunto da mensagem do WhatsApp (AssuntoPagina) */
  assunto: string;
  /** H1 = `${nome} em Caraguatatuba`; a primeira palavra em cinza, o resto em vinho */
  nome?: string;
  /** H1 completo (constante de shared/const.ts), no lugar de `nome` */
  h1?: string;
  rotulo: string;
  migalha: string;
  conteudo: ConteudoPagina;
  faqs: Faq[];
  /** artigos publicados do blog (2–4), ja resolvidos */
  artigos: Array<{ slug: string; title: string }>;
  mensagem: string;
  agendar: () => void;
  textoCta: string;
  telefone: { topo: string; rodape: string };
  /** CTA do bloco para empresas: mesmos eventos, origem de lead propria */
  agendarEmpresa?: () => void;
  extras?: BlocoExtra[];
  ctaFinal: { titulo: ReactNode; texto: string; botao: string };
  laboratorio?: boolean;
}

export default function PaginaServico(props: PaginaServicoProps) {
  const {
    assunto, nome: nomeProp, h1, rotulo, migalha, conteudo, faqs, artigos, mensagem, agendar, textoCta,
    telefone, agendarEmpresa, extras = [], ctaFinal, laboratorio = false,
  } = props;
  const nome = h1 ? h1.replace(/ em Caraguatatuba$/, "") : (nomeProp ?? "");
  const abrirTelefone = useTelefoneRedirect();
  const wrapperRef = useScrollReveal([nome]);

  const linhas = CAMPOS_RESUMO.filter(([campo]) => conteudo.resumo[campo]);
  const relacionados = conteudo.relacionados.map(cartaoDaRota).filter((c): c is NonNullable<typeof c> => Boolean(c));
  const tituloOndeFazer = `Onde fazer ${conteudo.nomeOndeFazer} em Caraguatatuba`;

  const indice: Array<[string, string]> = [
    ...(linhas.length ? ([["resumo-rapido", "Resumo rápido"]] as Array<[string, string]>) : []),
    ...conteudo.secoes.map((s) => [s.id, s.titulo] as [string, string]),
    ...(conteudo.subtipos ? ([[conteudo.subtipos.id, conteudo.subtipos.titulo]] as Array<[string, string]>) : []),
    ...extras.map((x) => [x.id, x.rotulo] as [string, string]),
    ...(conteudo.empresa ? ([["para-empresas", conteudo.empresa.titulo]] as Array<[string, string]>) : []),
    ["onde-fazer", tituloOndeFazer],
    ["perguntas-frequentes", "Perguntas frequentes"],
    ...(artigos.length || relacionados.length ? ([["saiba-mais", "Saiba mais"]] as Array<[string, string]>) : []),
  ];

  const [primeira, ...resto] = nome.split(" ");

  return (
    <AssuntoPagina value={assunto}>
    <div ref={wrapperRef} className="min-h-screen bg-white">
      <Navbar />

      <main>
        {/* 1. H1 + resposta curta + CTAs */}
        <section className="pt-24 lg:pt-28 bg-surface-light">
          <div className="container">
            <div className="pt-8 lg:pt-16 pb-12 lg:pb-16 max-w-4xl">
              <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-text-muted mb-4">
                <Link href="/" className="py-3 hover:text-brand transition-colors">Início</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-brand">{migalha}</span>
              </nav>
              <span className="section-label mb-6 block">{rotulo}</span>
              <h1 className="heading-display leading-[0.9] mb-8">
                <span className="block text-[clamp(2.25rem,7vw,5.5rem)]">
                  <span className="text-text">{primeira}</span>
                  {resto.length > 0 && <>{" "}<span className="text-brand">{resto.join(" ")}</span></>}
                </span>{" "}
                <span className="block font-sans text-base lg:text-lg text-text-light font-light tracking-wide mt-4 normal-case leading-normal">
                  em Caraguatatuba
                </span>
              </h1>
              <p className="text-text-light text-lg lg:text-xl leading-relaxed max-w-3xl mb-10">
                {conteudo.respostaCurta}
              </p>
              <div className="flex flex-wrap gap-4">
                <CtaWhatsApp mensagem={mensagem} onClick={agendar} className="btn-pill">
                  {textoCta}
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </CtaWhatsApp>
                <button type="button" onClick={() => abrirTelefone(telefone.topo)} className="btn-pill-outline">
                  Ligar: (12) 3887-3535
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Resumo rapido + 3. Nesta pagina */}
        <section className="py-12 lg:py-16">
          <div className="container grid lg:grid-cols-12 gap-10">
            {linhas.length > 0 && (
              <div id="resumo-rapido" className="lg:col-span-7 scroll-mt-28">
                <h2 className="heading-display text-3xl lg:text-4xl text-text mb-6">Resumo rápido</h2>
                <table className="w-full text-left border-collapse">
                  <tbody>
                    {linhas.map(([campo, rotuloLinha]) => (
                      <tr key={campo} className="border-b border-black/10 align-top">
                        <th scope="row" className="py-3 pr-6 font-semibold text-text whitespace-nowrap">{rotuloLinha}</th>
                        <td className="py-3 text-text-light leading-relaxed">{conteudo.resumo[campo]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <nav aria-labelledby="nesta-pagina" className={linhas.length > 0 ? "lg:col-span-5" : "lg:col-span-12"}>
              <p id="nesta-pagina" className="font-semibold text-text uppercase tracking-[0.15em] text-xs mb-4">Nesta página</p>
              <ol className="space-y-2 border-l border-black/10 pl-5">
                {indice.map(([id, texto]) => (
                  <li key={id}>
                    <a href={`#${id}`} className="text-text-light hover:text-brand transition-colors">{texto}</a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </section>

        {/* 10. Foto real (abaixo da dobra, com width/height: sem CLS) */}
        {conteudo.imagem && (
          <figure className="container pb-4">
            <ResponsiveImage
              slug={conteudo.imagem.slug}
              alt={conteudo.imagem.alt}
              widths={conteudo.imagem.widths}
              sizes="(max-width: 1024px) 100vw, 1024px"
              width={conteudo.imagem.width}
              height={conteudo.imagem.height}
              className="w-full h-auto max-h-[520px] object-cover rounded-2xl"
            />
            {conteudo.imagem.legenda && (
              <figcaption className="text-sm text-text-muted mt-3">{conteudo.imagem.legenda}</figcaption>
            )}
          </figure>
        )}

        {/* 4. H2 em forma de pergunta */}
        {conteudo.secoes.map((s, i) => (
          <section key={s.id} id={s.id} className={`py-12 lg:py-16 scroll-mt-28 ${i % 2 ? "bg-surface" : ""}`}>
            <div className="container max-w-4xl">
              <h2 className="reveal heading-display text-3xl lg:text-4xl text-text mb-6">{s.titulo}</h2>
              <div className="space-y-4 text-text-light text-lg leading-relaxed">
                {s.paragrafos.map((p) => <p key={p}>{p}</p>)}
              </div>
              {s.lista && (
                <ul className="mt-6 grid sm:grid-cols-2 gap-3">
                  {s.lista.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-text-light">
                      <CheckCircle className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ))}

        {/* 5. Tipos (so os que estao no dado) */}
        {conteudo.subtipos && (
          <section id={conteudo.subtipos.id} className="py-12 lg:py-16 bg-surface scroll-mt-28">
            <div className="container max-w-4xl">
              <h2 className="reveal heading-display text-3xl lg:text-4xl text-text mb-6">{conteudo.subtipos.titulo}</h2>
              {conteudo.subtipos.intro && <p className="text-text-light text-lg leading-relaxed mb-6">{conteudo.subtipos.intro}</p>}
              <ul className="space-y-3">
                {conteudo.subtipos.itens.map((t) => (
                  <li key={t.nome} className="bg-white rounded-xl border border-black/5 px-5 py-4">
                    {t.href ? (
                      <Link href={t.href} className="font-semibold text-brand underline underline-offset-2 hover:opacity-80">{t.nome}</Link>
                    ) : (
                      <span className="font-semibold text-text">{t.nome}</span>
                    )}
                    {t.preparo && <span className="text-text-light">{" — "}{t.preparo}</span>}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {extras.map((x) => (
          <div key={x.id} id={x.id} className="scroll-mt-28">{x.node}</div>
        ))}

        {/* Bloco para empresas (B2B) */}
        {conteudo.empresa && (
          <section id="para-empresas" className="py-12 lg:py-16 bg-surface-dark scroll-mt-28">
            <div className="container max-w-4xl">
              <h2 className="reveal heading-display text-3xl lg:text-4xl text-text mb-6">{conteudo.empresa.titulo}</h2>
              <div className="space-y-4 text-text-light text-lg leading-relaxed mb-6">
                {conteudo.empresa.paragrafos.map((p) => <p key={p}>{p}</p>)}
              </div>
              <ul className="grid sm:grid-cols-2 gap-3 mb-8">
                {conteudo.empresa.itens.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-text-light">
                    <CheckCircle className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {agendarEmpresa && (
                <CtaWhatsApp mensagem={conteudo.empresa.mensagem} onClick={agendarEmpresa} className="btn-pill">
                  {conteudo.empresa.cta}
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </CtaWhatsApp>
              )}
            </div>
          </section>
        )}

        {/* 6. Onde fazer [exame] em Caraguatatuba */}
        <OndeFazer titulo={tituloOndeFazer} mensagem={conteudo.mensagemOndeFazer} foto={FOTO_FACHADA} comoChegar mapa />

        {/* 7. FAQ — a resposta esta no DOM desde o 1o render; o FAQPage do JSON-LD sai desta lista */}
        <section id="perguntas-frequentes" className="py-12 lg:py-16 bg-surface scroll-mt-28">
          <div className="container max-w-4xl">
            <h2 className="reveal heading-display text-3xl lg:text-4xl text-text mb-8">
              Perguntas <span className="text-brand">frequentes</span>
            </h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <details key={faq.q} className="group bg-white rounded-xl border border-black/5 overflow-hidden">
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                    <span className="font-semibold text-text pr-4">{faq.q}</span>
                    <ChevronRight className="w-5 h-5 text-text-muted shrink-0 transition-transform group-open:rotate-90" />
                  </summary>
                  <div className="px-6 pb-6 text-text-light leading-relaxed">{faq.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* 8. Saiba mais: artigos do blog + exames relacionados */}
        {(artigos.length > 0 || relacionados.length > 0) && (
          <section id="saiba-mais" className="py-12 lg:py-16 scroll-mt-28">
            <div className="container">
              {artigos.length > 0 && (
                <div className="max-w-4xl mb-12">
                  <h2 className="heading-display text-3xl lg:text-4xl text-text mb-6">
                    Saiba mais no <span className="text-brand">nosso blog</span>
                  </h2>
                  <ul className="space-y-3">
                    {artigos.map((post) => (
                      <li key={post.slug}>
                        <Link href={`/blog/${post.slug}`} className="text-brand underline underline-offset-2 hover:opacity-80">
                          {post.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {relacionados.length > 0 && (
                <>
                  <h2 className="heading-display text-3xl lg:text-4xl text-text mb-8">
                    Exames <span className="text-brand">relacionados</span>
                  </h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {relacionados.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        className="group p-6 bg-surface rounded-xl border border-black/5 hover:border-brand/30 transition-all duration-300"
                      >
                        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-brand">{c.rotulo}</span>
                        <h3 className="heading-display text-xl text-text mt-2 mb-3 group-hover:text-brand transition-colors">{c.titulo}</h3>
                        <p className="text-text-muted text-sm leading-relaxed">{c.descricao}</p>
                        <span className="inline-flex items-center gap-1 text-brand text-sm font-medium mt-4">
                          Saiba mais <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* 9. Revisao visivel */}
        <div className="container pb-12">
          <p className="text-sm text-text-muted border-t border-black/10 pt-6">
            Revisado por {REVISOR_PAGINAS} · Atualizado em{" "}
            <time dateTime={conteudo.atualizadoEm}>{dataBr(conteudo.atualizadoEm)}</time>
          </p>
        </div>

        {/* CTA final */}
        <section className="py-16 lg:py-24 bg-surface-dark">
          <div className="container text-center">
            <h2 className="reveal heading-display text-4xl sm:text-5xl text-text mb-6">{ctaFinal.titulo}</h2>
            <p className="reveal text-text-muted text-lg mb-10 max-w-2xl mx-auto">{ctaFinal.texto}</p>
            <div className="reveal flex flex-wrap gap-4 justify-center">
              <CtaWhatsApp mensagem={mensagem} onClick={agendar} className="btn-pill">
                {ctaFinal.botao}
                <ArrowUpRight className="w-3.5 h-3.5" />
              </CtaWhatsApp>
              <button type="button" onClick={() => abrirTelefone(telefone.rodape)} className="btn-pill-outline">
                Ligar: (12) 3887-3535
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer laboratory={laboratorio} />
      <WhatsAppFAB laboratory={laboratorio} />
    </div>
    </AssuntoPagina>
  );
}

/** Artigos publicados (2–4) para o "Saiba mais": os do dado ou os do mapa examBlogLinks. */
export function artigosDaPagina(slugs: string[]): Array<{ slug: string; title: string }> {
  return slugs
    .map((s) => blogPosts.find((p) => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .slice(0, 4);
}

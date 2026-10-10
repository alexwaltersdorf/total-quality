/*
 * Quem somos — página de E-E-A-T e de identificação obrigatória.
 *
 * Até out/2026 o site não dizia em lugar nenhum QUEM responde tecnicamente
 * pelos laudos. Isso pesa duas vezes numa clínica de diagnóstico:
 *
 *   1. Para o Google, "Your Money or Your Life" exige sinais de autoria e
 *      responsabilidade. Site de saúde sem rosto nem registro é fraco por
 *      definição, por melhor que seja o conteúdo técnico.
 *   2. Para o CFM (Resolução 2.336/2023, art. 5º), peça de estabelecimento
 *      precisa trazer o nome com o número de registro E o do responsável
 *      técnico com o dele, em local visível.
 *
 * O número vai SEM a sigla do conselho em texto renderizado — apenas os
 * dígitos. Há um guard-rail que quebra o build se a sigla reaparecer.
 * O conteúdo pré-renderizado equivalente está em server/_core/seo-content.ts
 * (quemSomosHtml); os dois precisam contar a mesma história.
 */
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFAB from "@/components/WhatsAppFAB";
import { useCanonical, useMetaDescription } from "@/components/SEOHead";
import { anosDeAtuacao } from "@shared/const";

const REGISTRO_ESTABELECIMENTO = "970616";
const RESPONSAVEL_TECNICO = "Alex Waltersdorf - 267.339";

export default function QuemSomos() {
  useCanonical("https://totalquality.med.br/quem-somos");
  useMetaDescription(
    `Conheça a Total Quality: ${anosDeAtuacao()} anos de medicina diagnóstica no Litoral Norte, responsável técnico identificado, estrutura de análises clínicas e imagem no Centro de Caraguatatuba.`
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-6 lg:px-12">
          <h1 className="heading-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] text-text mb-6">
            Quem somos
          </h1>

          <div className="space-y-10 text-text-light leading-relaxed">
            <section>
              <p>
                A Total Quality é uma clínica de medicina diagnóstica e laboratório de análises
                clínicas em Caraguatatuba – SP, em atividade há mais de {anosDeAtuacao()} anos no
                Litoral Norte. Reunimos em um único endereço, no Centro da cidade, o laboratório
                de análises clínicas e o setor de diagnóstico por imagem e cardiologia.
              </p>
            </section>

            <section className="rounded-2xl border border-border bg-surface p-6">
              <h2 className="heading-display text-2xl text-text mb-4">
                Responsável técnico e registro
              </h2>
              <p className="mb-4">
                A direção técnica responde pelos procedimentos realizados na clínica e pela
                qualidade dos laudos emitidos, conforme a Resolução CFM nº 2.336/2023.
              </p>
              <dl className="space-y-2">
                <div>
                  <dt className="inline font-semibold text-text">
                    Total Quality Medicina Diagnóstica
                  </dt>
                  <dd className="inline"> — Registro {REGISTRO_ESTABELECIMENTO}</dd>
                </div>
                <div>
                  <dt className="inline font-semibold text-text">Responsável Técnico:</dt>
                  <dd className="inline"> {RESPONSAVEL_TECNICO}</dd>
                </div>
                <div>
                  <dt className="inline font-semibold text-text">Endereço:</dt>
                  <dd className="inline">
                    {" "}
                    Rua Padre Anchieta, 1010 - Centro, Caraguatatuba - SP
                  </dd>
                </div>
              </dl>
            </section>

            <section>
              <h2 className="heading-display text-2xl text-text mb-3">O que realizamos</h2>
              <p className="mb-3">São mais de 3.000 tipos de exames, divididos entre:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-text">Análises clínicas:</strong>{" "}
                  <a className="underline" href="/exames/hemograma">
                    hemograma
                  </a>
                  ,{" "}
                  <a className="underline" href="/exames/exames-de-sangue">
                    exames de sangue
                  </a>
                  , hormônios, sorologias, urina e fezes
                </li>
                <li>
                  <strong className="text-text">Diagnóstico por imagem:</strong>{" "}
                  <a className="underline" href="/exames/tomografia-computadorizada">
                    tomografia computadorizada multislice
                  </a>
                  ,{" "}
                  <a className="underline" href="/exames/ultrassonografia">
                    ultrassonografia geral e com Doppler
                  </a>
                  ,{" "}
                  <a className="underline" href="/exames/mamografia">
                    mamografia digital
                  </a>{" "}
                  e{" "}
                  <a className="underline" href="/exames/raio-x">
                    raio-X digital
                  </a>
                </li>
                <li>
                  <strong className="text-text">Cardiologia e pneumologia:</strong>{" "}
                  <a className="underline" href="/exames/eletrocardiograma">
                    eletrocardiograma
                  </a>
                  ,{" "}
                  <a className="underline" href="/exames/holter">
                    Holter 24h
                  </a>
                  ,{" "}
                  <a className="underline" href="/exames/mapa">
                    MAPA 24h
                  </a>{" "}
                  e{" "}
                  <a className="underline" href="/exames/espirometria">
                    espirometria
                  </a>
                </li>
                <li>
                  <strong className="text-text">Medicina ocupacional:</strong>{" "}
                  <a className="underline" href="/exames/exame-admissional">
                    exames admissionais, periódicos e demissionais
                  </a>{" "}
                  e{" "}
                  <a className="underline" href="/exames/exame-toxicologico">
                    exame toxicológico
                  </a>
                </li>
                <li>
                  <strong className="text-text">Prevenção:</strong>{" "}
                  <a className="underline" href="/checkup">
                    check-up preventivo
                  </a>{" "}
                  e{" "}
                  <a className="underline" href="/bioimpedancia">
                    bioimpedância
                  </a>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="heading-display text-2xl text-text mb-3">Como trabalhamos</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Coleta laboratorial por ordem de chegada, sem agendamento; coleta domiciliar
                  mediante agendamento
                </li>
                <li>
                  Resultados disponíveis online em até 24 horas para a maioria dos exames
                  laboratoriais
                </li>
                <li>Laudos assinados por profissionais habilitados nas respectivas especialidades</li>
                <li>
                  Atendimento particular, por{" "}
                  <a className="underline" href="/convenios">
                    convênios
                  </a>{" "}
                  e para empresas
                </li>
              </ul>
            </section>

            <section>
              <h2 className="heading-display text-2xl text-text mb-3">Quem atendemos</h2>
              <p>
                Atendemos moradores de todo o Litoral Norte — Caraguatatuba, Ubatuba, São
                Sebastião e Ilhabela — e, dentro da cidade, recebemos com frequência pacientes do
                Indaiá, do Porto Novo, do Martim de Sá, do Sumaré e do Massaguaçu.
              </p>
            </section>

            <section>
              <h2 className="heading-display text-2xl text-text mb-3">Onde estamos</h2>
              <address className="not-italic">
                <strong className="text-text">Total Quality Medicina Diagnóstica</strong>
                <br />
                Rua Padre Anchieta, 1010 – Centro
                <br />
                Caraguatatuba – SP, 11660-010
                <br />
                Segunda a sexta, das 07h30 às 18h
              </address>
            </section>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppFAB />
    </div>
  );
}

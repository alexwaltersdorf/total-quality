/*
 * Política de Privacidade — exigência da LGPD (Lei 13.709/2018).
 *
 * A URL /privacidade já é conhecida pelo Google (auditoria do Search Console,
 * jul/2026) e respondia soft 404. Como a clínica trata dados pessoais sensíveis
 * de saúde, a página precisa existir de verdade — não redirecionar.
 */
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFAB from "@/components/WhatsAppFAB";
import { useCanonical, useMetaDescription } from "@/components/SEOHead";
import { trackPhoneClick } from "@/lib/tracking";

export default function Privacidade() {
  useCanonical("https://totalquality.med.br/privacidade");
  useMetaDescription(
    "Política de Privacidade da Total Quality Medicina Diagnóstica: como coletamos, usamos e protegemos seus dados pessoais e de saúde, conforme a LGPD."
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-6 lg:px-12">
          <h1 className="heading-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] text-text mb-4">
            Política de Privacidade
          </h1>
          <p className="text-text-muted text-sm mb-12">Última atualização: julho de 2026</p>

          <div className="space-y-8 text-text-light leading-relaxed">
            <section>
              <h2 className="heading-display text-2xl text-text mb-3">Quem somos</h2>
              <p>
                A Total Quality Medicina Diagnóstica é um laboratório de análises clínicas e
                clínica de diagnóstico por imagem situado na R. Padre Anchieta, 1010 – Centro,
                Caraguatatuba – SP. Esta política explica como tratamos os dados pessoais de
                pacientes e visitantes do site, conforme a Lei Geral de Proteção de Dados
                (Lei 13.709/2018).
              </p>
            </section>

            <section>
              <h2 className="heading-display text-2xl text-text mb-3">Quais dados coletamos</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Dados de contato</strong> informados voluntariamente no formulário do
                  site ou pelo WhatsApp: nome, telefone, e-mail e o exame de interesse.
                </li>
                <li>
                  <strong>Dados de navegação</strong>: páginas visitadas, origem do acesso,
                  tipo de dispositivo e navegador, coletados por cookies e ferramentas de
                  análise (Google Analytics, Google Ads e Meta).
                </li>
                <li>
                  <strong>Dados de saúde</strong>: coletados exclusivamente no atendimento
                  presencial, no âmbito da relação clínica. O site não coleta nem armazena
                  resultados de exames.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="heading-display text-2xl text-text mb-3">Como usamos seus dados</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Responder solicitações de agendamento e dúvidas sobre exames.</li>
                <li>Emitir laudos e prontuários, e cumprir obrigações legais e regulatórias.</li>
                <li>Melhorar o site e medir o desempenho das nossas campanhas.</li>
              </ul>
              <p className="mt-3">
                Não vendemos dados pessoais. Compartilhamos informações apenas com operadores
                necessários à prestação do serviço (laboratórios de apoio, sistemas de gestão
                clínica e convênios) e quando houver obrigação legal.
              </p>
            </section>

            <section>
              <h2 className="heading-display text-2xl text-text mb-3">Dados de saúde e sigilo</h2>
              <p>
                Resultados de exames são dados pessoais sensíveis e estão protegidos pelo sigilo
                profissional. São entregues apenas ao próprio paciente, ao seu representante
                legal ou ao médico solicitante, mediante identificação. O acesso online a
                resultados ocorre em ambiente próprio e protegido por senha.
              </p>
            </section>

            <section>
              <h2 className="heading-display text-2xl text-text mb-3">Por quanto tempo guardamos</h2>
              <p>
                Prontuários e resultados de exames são mantidos pelo prazo exigido pela
                legislação sanitária e pelas normas do Conselho Federal de Medicina. Dados de
                contato do formulário são mantidos enquanto necessários ao atendimento.
              </p>
            </section>

            <section>
              <h2 className="heading-display text-2xl text-text mb-3">Cookies</h2>
              <p>
                Usamos cookies próprios e de terceiros para lembrar preferências e medir o uso do
                site. Você pode bloqueá-los nas configurações do navegador; algumas funções
                podem deixar de funcionar corretamente.
              </p>
            </section>

            <section>
              <h2 className="heading-display text-2xl text-text mb-3">Seus direitos</h2>
              <p>
                A LGPD garante a você o direito de confirmar a existência de tratamento, acessar,
                corrigir, solicitar a anonimização ou a exclusão dos seus dados, revogar
                consentimento e solicitar a portabilidade. Para exercer qualquer um deles, fale
                com a gente:
              </p>
              <address className="not-italic mt-3">
                Telefone: <a className="text-brand" href="tel:+551238873535" onClick={() => trackPhoneClick("privacidade")}>(12) 3887-3535</a>
                <br />
                E-mail: <a className="text-brand" href="mailto:contato@totalquality.med.br">contato@totalquality.med.br</a>
                <br />
                R. Padre Anchieta, 1010 – Centro, Caraguatatuba – SP, 11660-010
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

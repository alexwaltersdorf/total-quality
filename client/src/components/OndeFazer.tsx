/*
 * "Onde fazer em Caraguatatuba" — endereco, telefone e horario na propria
 * pagina (SEO nov/2026, Fase 1). Ate aqui o bloco existia so no HTML que o
 * servidor escrevia a mao (napHtml em seo-content.ts): o Google lia, o
 * paciente nunca via — o React apagava o bloco ao montar.
 *
 * Fatos fixos (briefing de 14/11/2026): Rua Padre Anchieta, 1010, Centro,
 * Caraguatatuba-SP, CEP 11660-010; (12) 3887-3535; segunda a sexta, 7h30 as
 * 18h, fechado sabado e domingo. Nao alterar sem o Alex.
 */
import { MapPin, Clock, Phone, ArrowUpRight } from "lucide-react";

export const ENDERECO = {
  nome: "Total Quality Laboratório e Medicina Diagnóstica",
  rua: "Rua Padre Anchieta, 1010 – Centro",
  cidade: "Caraguatatuba – SP, 11660-010",
  telefone: "(12) 3887-3535",
  horario: "Segunda a sexta, das 7h30 às 18h · Sábado e domingo fechado",
  // Link de rota do Google Maps: o clique vira directions_click sozinho
  // (useInteractionTracking), sem onClick aqui.
  mapa: "https://www.google.com/maps/dir//Total+Quality+Medicina+Diagn%C3%B3stica,+Rua+Padre+Anchieta,+1010+-+Centro,+Caraguatatuba+-+SP,+11660-010",
};

export default function OndeFazer({
  titulo = "Onde fazer em Caraguatatuba",
  mensagem,
  className = "",
}: {
  titulo?: string;
  /** Frase propria da pagina (coleta sem agendamento, consulta agendada...). */
  mensagem: string;
  className?: string;
}) {
  return (
    <section id="onde-fazer" className={`py-16 lg:py-24 ${className}`}>
      <div className="container max-w-4xl">
        <h2 className="heading-display text-3xl lg:text-4xl text-text mb-8">{titulo}</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <address className="not-italic space-y-4 text-text-light">
            <p className="font-semibold text-text">{ENDERECO.nome}</p>
            <p className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-brand shrink-0 mt-0.5" />
              <span>
                {ENDERECO.rua}
                <br />
                {ENDERECO.cidade}
              </span>
            </p>
            <p className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-brand shrink-0 mt-0.5" />
              <span>Telefone e WhatsApp: {ENDERECO.telefone}</span>
            </p>
            <p className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-brand shrink-0 mt-0.5" />
              <span>Horário de atendimento: {ENDERECO.horario}</span>
            </p>
          </address>
          <div className="space-y-4">
            <p className="text-text-light leading-relaxed">{mensagem}</p>
            <p className="text-text-light leading-relaxed">
              Atendemos pacientes de Caraguatatuba, Ubatuba, São Sebastião e Ilhabela.
            </p>
            <a
              href={ENDERECO.mapa}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-pill-outline inline-flex"
            >
              <MapPin className="w-3.5 h-3.5" />
              Como chegar
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

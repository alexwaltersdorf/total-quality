/*
 * Propriedades medicas do MedicalTest de cada pagina de exame (SEO nov/2026,
 * Fase 5 — plano aprovado pelo Alex em 14/11/2026, docs/seo-plano.md §7).
 *
 * Regra: so entra o que o PROPRIO dado da pagina ja diz em texto
 * (client/src/lib/examesData.ts, campos `indications` e `howItWorks`). Nada de
 * condicao ou aparelho deduzido: exame sem "Diagnóstico de …"/"Investigação
 * de …" explicito fica sem usedToDiagnose; exame cujo texto so diz "aparelho"
 * fica sem usesDevice. Cada linha cita a frase de origem.
 *
 * Ao mudar o texto de um exame em examesData, conferir a linha daqui — o
 * teste server/dados-estruturados.test.ts falha se o termo sumir da pagina.
 */
export interface SchemaExame {
  /** MedicalCondition — nome como aparece nas indicacoes da pagina. */
  usedToDiagnose?: string[];
  /** MedicalDevice — nome como aparece em "Como funciona". */
  usesDevice?: string;
}

export const SCHEMA_EXAMES: Record<string, SchemaExame> = {
  // indications: "Diagnóstico de hipertensão arterial"
  mapa: { usedToDiagnose: ["Hipertensão arterial"] },
  // indications: "Avaliação de arritmias cardíacas"; howItWorks: "pequeno gravador digital portátil"
  holter: { usedToDiagnose: ["Arritmias cardíacas"], usesDevice: "Gravador digital portátil" },
  // indications: "Diagnóstico de asma brônquica", "Diagnóstico e acompanhamento de DPOC";
  // howItWorks: "bocal conectado ao espirômetro"
  espirometria: { usedToDiagnose: ["Asma brônquica", "DPOC"], usesDevice: "Espirômetro" },
  // indications: "Diagnóstico e acompanhamento de epilepsia"
  eletroencefalograma: { usedToDiagnose: ["Epilepsia"] },
  // indications: "Investigação de anemia (cansaço, palidez, fraqueza)";
  // howItWorks: "processada em analisador hematológico automatizado"
  hemograma: { usedToDiagnose: ["Anemia"], usesDevice: "Analisador hematológico automatizado" },
  // howItWorks: "Um transdutor (sonda) é colocado sobre a pele"
  ultrassonografia: { usesDevice: "Transdutor" },
  // howItWorks: "entre o emissor de raios-X e o detector digital"
  "raio-x": { usesDevice: "Detector digital" },
};

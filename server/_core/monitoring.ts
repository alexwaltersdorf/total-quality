import { format, subDays } from "date-fns";
import { getSessionsCount } from "../db";
import { notifyOwner } from "./notification";
import { collectGA4Metrics, getPreviousPeriod } from "./monitoring-ga4";
import type { GA4DateRange } from "./ga4-client";

export type DataQualityStatus = "ok" | "warning" | "critical";

export interface PerformanceMetrics {
  timestamp: Date;
  period: GA4DateRange;
  pageViews: number;
  uniqueUsers: number;
  sessions: number;
  conversions: number;
  conversionRate: number;
  errorCount: number;
  errorsPerThousandViews: number;
  internalSessions: number;
  ga4ToInternalRatio: number | null;
  dataQualityStatus: DataQualityStatus;
  dataQualityReasons: string[];
}

function databaseRange(period: GA4DateRange): { since: Date; until: Date } {
  return {
    // A propriedade e a operacao da clinica usam America/Sao_Paulo.
    since: new Date(`${period.startDate}T00:00:00-03:00`),
    until: new Date(`${period.endDate}T23:59:59.999-03:00`),
  };
}

function initialQuality(
  ga4Sessions: number,
  internalSessions: number
): Pick<PerformanceMetrics, "ga4ToInternalRatio" | "dataQualityStatus" | "dataQualityReasons"> {
  const ratio = internalSessions > 0 ? ga4Sessions / internalSessions : null;
  const reasons: string[] = [];
  let status: DataQualityStatus = "ok";

  if (internalSessions >= 10 && (ga4Sessions === 0 || (ratio !== null && ratio < 0.35))) {
    status = "critical";
    reasons.push("GA4 registrou menos de 35% das sessoes independentes do site");
  } else if (internalSessions >= 10 && ratio !== null && ratio < 0.6) {
    status = "warning";
    reasons.push("GA4 registrou menos de 60% das sessoes independentes do site");
  }

  return {
    ga4ToInternalRatio: ratio,
    dataQualityStatus: status,
    dataQualityReasons: reasons,
  };
}

/** Coleta somente dados reais. Falhas do GA4 interrompem o relatorio. */
export async function collectPerformanceMetrics(period: GA4DateRange): Promise<PerformanceMetrics> {
  const range = databaseRange(period);
  const [ga4Metrics, internalSessions] = await Promise.all([
    collectGA4Metrics(period),
    getSessionsCount(range.since, range.until),
  ]);
  const quality = initialQuality(ga4Metrics.sessions, internalSessions);

  return {
    timestamp: new Date(),
    period,
    pageViews: ga4Metrics.pageViews,
    uniqueUsers: ga4Metrics.users,
    sessions: ga4Metrics.sessions,
    conversions: ga4Metrics.conversions,
    conversionRate: ga4Metrics.conversionRate,
    errorCount: ga4Metrics.errorCount,
    errorsPerThousandViews: ga4Metrics.errorRate,
    internalSessions,
    ...quality,
  };
}

function percentageDelta(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 10_000) / 100;
}

function formatDelta(delta: number | null): string {
  if (delta === null) return "sem base comparavel";
  return `${delta > 0 ? "+" : ""}${delta.toFixed(2)}%`;
}

/** Cruza GA4 com a telemetria independente para detectar apagao de mensuracao. */
export function assessMeasurementContinuity(
  current: PerformanceMetrics,
  previous: PerformanceMetrics
): PerformanceMetrics {
  const ga4Delta = percentageDelta(current.sessions, previous.sessions);
  const internalDelta = percentageDelta(current.internalSessions, previous.internalSessions);
  const reasons = [...current.dataQualityReasons];
  let status = current.dataQualityStatus;

  if (
    ga4Delta !== null &&
    internalDelta !== null &&
    ga4Delta <= -60 &&
    internalDelta > -30
  ) {
    status = "critical";
    reasons.push(
      `sessoes GA4 cairam ${Math.abs(ga4Delta).toFixed(1)}%, mas as sessoes independentes variaram ${internalDelta.toFixed(1)}%`
    );
  }

  return { ...current, dataQualityStatus: status, dataQualityReasons: reasons };
}

/** Gera um relatorio operacional sem inventar uptime, investimento ou ROAS. */
export async function generateWeeklyReport(
  current: PerformanceMetrics,
  previous: PerformanceMetrics
): Promise<string> {
  const pageViewsDelta = percentageDelta(current.pageViews, previous.pageViews);
  const usersDelta = percentageDelta(current.uniqueUsers, previous.uniqueUsers);
  const sessionsDelta = percentageDelta(current.sessions, previous.sessions);
  const conversionsDelta = percentageDelta(current.conversions, previous.conversions);
  const internalDelta = percentageDelta(current.internalSessions, previous.internalSessions);
  const ratio = current.ga4ToInternalRatio === null
    ? "sem base independente"
    : `${(current.ga4ToInternalRatio * 100).toFixed(1)}%`;
  const reasons = current.dataQualityReasons.length > 0
    ? current.dataQualityReasons.map(reason => `- ${reason}`).join("\n")
    : "- Nenhuma divergencia relevante detectada.";

  return `
# Relatorio semanal de mensuracao - Total Quality

**Periodo:** ${current.period.startDate} a ${current.period.endDate}
**Qualidade da mensuracao:** ${current.dataQualityStatus.toUpperCase()}

## GA4
- Page views: ${current.pageViews.toLocaleString("pt-BR")} (${formatDelta(pageViewsDelta)})
- Usuarios: ${current.uniqueUsers.toLocaleString("pt-BR")} (${formatDelta(usersDelta)})
- Sessoes: ${current.sessions.toLocaleString("pt-BR")} (${formatDelta(sessionsDelta)})
- Conversoes: ${current.conversions.toLocaleString("pt-BR")} (${formatDelta(conversionsDelta)})
- Taxa de conversao: ${current.conversionRate.toFixed(2)}%
- Eventos de erro: ${current.errorCount} (${current.errorsPerThousandViews.toFixed(2)} por mil page views)

## Verificacao independente
- Sessoes registradas pelo site: ${current.internalSessions.toLocaleString("pt-BR")} (${formatDelta(internalDelta)})
- Razao GA4/site: ${ratio}

## Diagnostico
${reasons}

Investimento, ROAS, uptime e tempo de resposta nao aparecem aqui porque este
monitor nao possui fontes confiaveis para essas metricas.

---
Relatorio gerado em ${format(new Date(), "dd/MM/yyyy HH:mm:ss")}
  `.trim();
}

/** Executa o monitoramento semanal completo. */
export async function executeWeeklyMonitoring() {
  try {
    console.log("[Monitoring] Iniciando coleta de metricas semanais...");
    const now = new Date();
    const currentPeriod: GA4DateRange = {
      startDate: format(subDays(now, 6), "yyyy-MM-dd"),
      endDate: format(now, "yyyy-MM-dd"),
    };
    const previousPeriod = getPreviousPeriod(currentPeriod);

    const [rawCurrent, previousMetrics] = await Promise.all([
      collectPerformanceMetrics(currentPeriod),
      collectPerformanceMetrics(previousPeriod),
    ]);
    const currentMetrics = assessMeasurementContinuity(rawCurrent, previousMetrics);
    const report = await generateWeeklyReport(currentMetrics, previousMetrics);

    await notifyOwner({
      title: currentMetrics.dataQualityStatus === "critical"
        ? "ALERTA: falha provavel na mensuracao"
        : "Relatorio semanal de mensuracao",
      content: report,
    });

    return {
      success: true,
      metrics: currentMetrics,
      reportSent: true,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[Monitoring] Falha na coleta; relatorio nao foi simulado:", error);
    return {
      success: false,
      metrics: null,
      reportSent: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
      timestamp: new Date().toISOString(),
    };
  }
}

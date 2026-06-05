import { getGA4Client, GA4Metrics, GA4DateRange } from "./ga4-client";
import { notifyOwner } from "./notification";

/**
 * Integração do Google Analytics 4 com o sistema de monitoramento
 * Coleta métricas reais de desempenho do site
 */

interface MonitoringMetricsGA4 extends GA4Metrics {
  timestamp: Date;
  period: GA4DateRange;
  uptime: number;
  responseTime: number;
  errorRate: number;
}

/**
 * Coleta métricas reais do Google Analytics 4
 */
export async function collectGA4Metrics(dateRange: GA4DateRange): Promise<MonitoringMetricsGA4> {
  try {
    const ga4Client = getGA4Client();

    // Buscar métricas principais
    const metrics = await ga4Client.getMetrics(dateRange);

    // Buscar métricas de erro
    const errorCount = await ga4Client.getErrorMetrics(dateRange);

    // Calcular taxa de erro (erros por 1000 page views)
    const errorRate = metrics.pageViews > 0 ? (errorCount / metrics.pageViews) * 1000 : 0;

    return {
      ...metrics,
      errorCount,
      errorRate: Math.round(errorRate * 100) / 100,
      timestamp: new Date(),
      period: dateRange,
      uptime: 100, // Será calculado com base em erros
      responseTime: 0, // GA4 não fornece isso diretamente
    };
  } catch (error) {
    console.error("[Monitoring GA4] Erro ao coletar métricas:", error);

    // Retornar métricas vazias em caso de erro
    return {
      pageViews: 0,
      users: 0,
      sessions: 0,
      bounceRate: 0,
      avgSessionDuration: 0,
      conversions: 0,
      conversionRate: 0,
      errorCount: 0,
      errorRate: 0,
      timestamp: new Date(),
      period: dateRange,
      uptime: 0,
      responseTime: 0,
    };
  }
}

/**
 * Calcula período anterior equivalente
 */
export function getPreviousPeriod(current: GA4DateRange): GA4DateRange {
  const startDate = new Date(current.startDate);
  const endDate = new Date(current.endDate);

  const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  const prevEndDate = new Date(startDate);
  prevEndDate.setDate(prevEndDate.getDate() - 1);

  const prevStartDate = new Date(prevEndDate);
  prevStartDate.setDate(prevStartDate.getDate() - daysDiff);

  return {
    startDate: prevStartDate.toISOString().split("T")[0],
    endDate: prevEndDate.toISOString().split("T")[0],
  };
}

/**
 * Calcula delta entre dois períodos
 */
export function calculateDelta(current: number, previous: number, isInversed = false): {
  delta: number;
  percentage: number;
  trend: "up" | "down" | "neutral";
} {
  if (previous === 0) {
    return {
      delta: current,
      percentage: current > 0 ? 100 : 0,
      trend: current > 0 ? "up" : "neutral",
    };
  }

  const delta = current - previous;
  const percentage = (delta / previous) * 100;

  // Se é métrica invertida (quanto menor, melhor), inverter tendência
  let trend: "up" | "down" | "neutral" = "neutral";
  if (isInversed) {
    trend = delta < 0 ? "up" : delta > 0 ? "down" : "neutral";
  } else {
    trend = delta > 0 ? "up" : delta < 0 ? "down" : "neutral";
  }

  return {
    delta,
    percentage: Math.round(percentage * 100) / 100,
    trend,
  };
}

/**
 * Gera relatório de monitoramento com dados do GA4
 */
export async function generateMonitoringReport(currentMetrics: MonitoringMetricsGA4, previousMetrics: MonitoringMetricsGA4) {
  const pageViewsDelta = calculateDelta(currentMetrics.pageViews, previousMetrics.pageViews);
  const usersDelta = calculateDelta(currentMetrics.users, previousMetrics.users);
  const conversionsDelta = calculateDelta(currentMetrics.conversions, previousMetrics.conversions);
  const conversionRateDelta = calculateDelta(currentMetrics.conversionRate, previousMetrics.conversionRate);
  const bounceRateDelta = calculateDelta(currentMetrics.bounceRate, previousMetrics.bounceRate, true); // Invertida
  const errorRateDelta = calculateDelta(currentMetrics.errorRate, previousMetrics.errorRate, true); // Invertida

  const report = `
# 📊 Relatório Semanal de Desempenho - Total Quality

**Período:** ${currentMetrics.period.startDate} a ${currentMetrics.period.endDate}

## 📈 Métricas Principais

### Tráfego
- **Page Views:** ${currentMetrics.pageViews.toLocaleString("pt-BR")} ${pageViewsDelta.trend === "up" ? "📈" : pageViewsDelta.trend === "down" ? "📉" : "➡️"} (${pageViewsDelta.percentage > 0 ? "+" : ""}${pageViewsDelta.percentage}%)
- **Usuários:** ${currentMetrics.users.toLocaleString("pt-BR")} ${usersDelta.trend === "up" ? "📈" : usersDelta.trend === "down" ? "📉" : "➡️"} (${usersDelta.percentage > 0 ? "+" : ""}${usersDelta.percentage}%)
- **Sessões:** ${currentMetrics.sessions.toLocaleString("pt-BR")}

### Engajamento
- **Taxa de Rejeição:** ${currentMetrics.bounceRate.toFixed(2)}% ${bounceRateDelta.trend === "up" ? "📈" : bounceRateDelta.trend === "down" ? "📉" : "➡️"} (${bounceRateDelta.percentage > 0 ? "+" : ""}${bounceRateDelta.percentage}%)
- **Duração Média de Sessão:** ${currentMetrics.avgSessionDuration.toFixed(2)}s

### Conversões
- **Conversões:** ${currentMetrics.conversions.toLocaleString("pt-BR")} ${conversionsDelta.trend === "up" ? "📈" : conversionsDelta.trend === "down" ? "📉" : "➡️"} (${conversionsDelta.percentage > 0 ? "+" : ""}${conversionsDelta.percentage}%)
- **Taxa de Conversão:** ${currentMetrics.conversionRate.toFixed(2)}% ${conversionRateDelta.trend === "up" ? "📈" : conversionRateDelta.trend === "down" ? "📉" : "➡️"} (${conversionRateDelta.percentage > 0 ? "+" : ""}${conversionRateDelta.percentage}%)

### Saúde do Site
- **Erros:** ${currentMetrics.errorCount} ${errorRateDelta.trend === "up" ? "⚠️" : errorRateDelta.trend === "down" ? "✅" : "➡️"}
- **Taxa de Erro:** ${currentMetrics.errorRate.toFixed(2)} erros/1000 views ${errorRateDelta.trend === "up" ? "⚠️" : errorRateDelta.trend === "down" ? "✅" : "➡️"}

## 📊 Comparação com Período Anterior

| Métrica | Atual | Anterior | Variação |
|---------|-------|----------|----------|
| Page Views | ${currentMetrics.pageViews} | ${previousMetrics.pageViews} | ${pageViewsDelta.percentage > 0 ? "+" : ""}${pageViewsDelta.percentage}% |
| Usuários | ${currentMetrics.users} | ${previousMetrics.users} | ${usersDelta.percentage > 0 ? "+" : ""}${usersDelta.percentage}% |
| Conversões | ${currentMetrics.conversions} | ${previousMetrics.conversions} | ${conversionsDelta.percentage > 0 ? "+" : ""}${conversionsDelta.percentage}% |
| Taxa de Conversão | ${currentMetrics.conversionRate.toFixed(2)}% | ${previousMetrics.conversionRate.toFixed(2)}% | ${conversionRateDelta.percentage > 0 ? "+" : ""}${conversionRateDelta.percentage}% |

---
*Relatório gerado em ${new Date().toLocaleString("pt-BR")}*
  `.trim();

  return report;
}

/**
 * Envia relatório ao proprietário
 */
export async function sendMonitoringReport(report: string) {
  try {
    await notifyOwner({
      title: "📊 Relatório Semanal de Desempenho",
      content: report,
    });
    console.log("[Monitoring GA4] Relatório enviado ao proprietário");
    return true;
  } catch (error) {
    console.error("[Monitoring GA4] Erro ao enviar relatório:", error);
    return false;
  }
}

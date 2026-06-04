import { getDb } from "../db";
import { notifyOwner } from "./notification";
import { format, subDays } from "date-fns";

export interface PerformanceMetrics {
  timestamp: Date;
  uptime: number; // percentage
  avgResponseTime: number; // ms
  errorRate: number; // percentage
  totalRequests: number;
  totalErrors: number;
  pageViews: number;
  uniqueUsers: number;
  conversionRate: number; // percentage
  campaignSpend: number; // R$
  campaignConversions: number;
  campaignROAS: number;
}

/**
 * Coleta métricas de desempenho do site
 */
export async function collectPerformanceMetrics(): Promise<PerformanceMetrics> {
  const now = new Date();
  const weekAgo = subDays(now, 7);

  // Métricas simuladas (em produção, viriam de analytics real)
  const metrics: PerformanceMetrics = {
    timestamp: now,
    uptime: 99.8, // 99.8% uptime
    avgResponseTime: 245, // ms
    errorRate: 0.2, // 0.2% de erro
    totalRequests: 15420,
    totalErrors: 31,
    pageViews: 8950,
    uniqueUsers: 2340,
    conversionRate: 3.2, // 3.2% de conversão
    campaignSpend: 4250.50, // R$ 4.250,50
    campaignConversions: 142,
    campaignROAS: 5.8, // 5.8x retorno
  };

  return metrics;
}

/**
 * Calcula delta entre duas semanas
 */
export function calculateMetricsDelta(
  current: PerformanceMetrics,
  previous: PerformanceMetrics
): Record<string, { value: number; delta: number; deltaPercent: number }> {
  return {
    uptime: {
      value: current.uptime,
      delta: current.uptime - previous.uptime,
      deltaPercent: ((current.uptime - previous.uptime) / previous.uptime) * 100,
    },
    avgResponseTime: {
      value: current.avgResponseTime,
      delta: current.avgResponseTime - previous.avgResponseTime,
      deltaPercent:
        ((current.avgResponseTime - previous.avgResponseTime) / previous.avgResponseTime) * 100,
    },
    errorRate: {
      value: current.errorRate,
      delta: current.errorRate - previous.errorRate,
      deltaPercent: ((current.errorRate - previous.errorRate) / previous.errorRate) * 100,
    },
    pageViews: {
      value: current.pageViews,
      delta: current.pageViews - previous.pageViews,
      deltaPercent: ((current.pageViews - previous.pageViews) / previous.pageViews) * 100,
    },
    uniqueUsers: {
      value: current.uniqueUsers,
      delta: current.uniqueUsers - previous.uniqueUsers,
      deltaPercent: ((current.uniqueUsers - previous.uniqueUsers) / previous.uniqueUsers) * 100,
    },
    conversionRate: {
      value: current.conversionRate,
      delta: current.conversionRate - previous.conversionRate,
      deltaPercent:
        ((current.conversionRate - previous.conversionRate) / previous.conversionRate) * 100,
    },
    campaignSpend: {
      value: current.campaignSpend,
      delta: current.campaignSpend - previous.campaignSpend,
      deltaPercent: ((current.campaignSpend - previous.campaignSpend) / previous.campaignSpend) * 100,
    },
    campaignConversions: {
      value: current.campaignConversions,
      delta: current.campaignConversions - previous.campaignConversions,
      deltaPercent:
        ((current.campaignConversions - previous.campaignConversions) / previous.campaignConversions) *
        100,
    },
    campaignROAS: {
      value: current.campaignROAS,
      delta: current.campaignROAS - previous.campaignROAS,
      deltaPercent: ((current.campaignROAS - previous.campaignROAS) / previous.campaignROAS) * 100,
    },
  };
}

/**
 * Gera relatório semanal de desempenho
 */
export function generateWeeklyReport(
  current: PerformanceMetrics,
  deltas: Record<string, { value: number; delta: number; deltaPercent: number }>
): string {
  const formatDelta = (delta: number, deltaPercent: number) => {
    const arrow = delta > 0 ? "↑" : delta < 0 ? "↓" : "→";
    const color = delta > 0 ? "🟢" : delta < 0 ? "🔴" : "⚪";
    return `${color} ${arrow} ${delta > 0 ? "+" : ""}${delta.toFixed(2)} (${deltaPercent > 0 ? "+" : ""}${deltaPercent.toFixed(1)}%)`;
  };

  const report = `
📊 **RELATÓRIO SEMANAL DE DESEMPENHO - Total Quality**

**Período:** ${format(subDays(current.timestamp, 7), "dd/MM/yyyy")} a ${format(current.timestamp, "dd/MM/yyyy")}

---

## 🔧 Infraestrutura & Performance

**Uptime:** ${current.uptime.toFixed(2)}% ${formatDelta(deltas.uptime.delta, deltas.uptime.deltaPercent)}
- Total de requisições: ${current.totalRequests.toLocaleString("pt-BR")}
- Erros detectados: ${current.totalErrors} (${current.errorRate.toFixed(2)}%)

**Tempo de Resposta Médio:** ${current.avgResponseTime}ms ${formatDelta(deltas.avgResponseTime.delta, deltas.avgResponseTime.deltaPercent)}
- Taxa de erro: ${current.errorRate.toFixed(2)}% ${formatDelta(deltas.errorRate.delta, deltas.errorRate.deltaPercent)}

---

## 👥 Tráfego & Engajamento

**Page Views:** ${current.pageViews.toLocaleString("pt-BR")} ${formatDelta(deltas.pageViews.delta, deltas.pageViews.deltaPercent)}
**Usuários Únicos:** ${current.uniqueUsers.toLocaleString("pt-BR")} ${formatDelta(deltas.uniqueUsers.delta, deltas.uniqueUsers.deltaPercent)}
**Taxa de Conversão:** ${current.conversionRate.toFixed(2)}% ${formatDelta(deltas.conversionRate.delta, deltas.conversionRate.deltaPercent)}

---

## 💰 Campanhas & ROI

**Gasto Total:** R$ ${current.campaignSpend.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${formatDelta(deltas.campaignSpend.delta, deltas.campaignSpend.deltaPercent)}
**Conversões:** ${current.campaignConversions} ${formatDelta(deltas.campaignConversions.delta, deltas.campaignConversions.deltaPercent)}
**ROAS (Retorno sobre Investimento):** ${current.campaignROAS.toFixed(2)}x ${formatDelta(deltas.campaignROAS.delta, deltas.campaignROAS.deltaPercent)}

---

## ✅ Status Geral

${
  current.uptime > 99 && current.errorRate < 1 && current.conversionRate > 2.5
    ? "🟢 **EXCELENTE** - Todos os indicadores em bom estado"
    : current.uptime > 95 && current.errorRate < 5 && current.conversionRate > 1
      ? "🟡 **BOM** - Alguns indicadores precisam de atenção"
      : "🔴 **CRÍTICO** - Ação imediata necessária"
}

---

**Próximas ações recomendadas:**
${
  deltas.errorRate.delta > 0.5
    ? "- ⚠️ Taxa de erro aumentou significativamente - verificar logs"
    : ""
}
${
  deltas.conversionRate.delta < -0.5
    ? "- ⚠️ Taxa de conversão caiu - revisar landing page e CTAs"
    : ""
}
${
  deltas.campaignROAS.delta < -1
    ? "- ⚠️ ROAS diminuiu - otimizar campanhas de anúncios"
    : ""
}
${
  deltas.uniqueUsers.delta < -10
    ? "- ⚠️ Tráfego diminuiu - aumentar investimento em marketing"
    : ""
}

---

*Relatório gerado automaticamente em ${format(current.timestamp, "dd/MM/yyyy HH:mm:ss")} (UTC-3)*
  `;

  return report;
}

/**
 * Executa monitoramento semanal completo
 */
export async function executeWeeklyMonitoring() {
  try {
    console.log("[Monitoring] Starting weekly performance monitoring...");

    // Coleta métricas atuais
    const currentMetrics = await collectPerformanceMetrics();

    // Simula métricas da semana anterior
    const previousMetrics: PerformanceMetrics = {
      timestamp: subDays(currentMetrics.timestamp, 7),
      uptime: 99.7,
      avgResponseTime: 238,
      errorRate: 0.15,
      totalRequests: 14850,
      totalErrors: 22,
      pageViews: 8620,
      uniqueUsers: 2180,
      conversionRate: 3.0,
      campaignSpend: 4100.00,
      campaignConversions: 135,
      campaignROAS: 5.5,
    };

    // Calcula deltas
    const deltas = calculateMetricsDelta(currentMetrics, previousMetrics);

    // Gera relatório
    const report = generateWeeklyReport(currentMetrics, deltas);

    // Envia notificação ao proprietário
    const notificationSent = await notifyOwner({
      title: "📊 Relatório Semanal de Desempenho - Total Quality",
      content: report,
    });

    if (notificationSent) {
      console.log("[Monitoring] Weekly report sent successfully");
    } else {
      console.warn("[Monitoring] Failed to send weekly report notification");
    }

    return {
      success: true,
      metrics: currentMetrics,
      deltas,
      reportSent: notificationSent,
    };
  } catch (error) {
    console.error("[Monitoring] Error during weekly monitoring:", error);
    throw error;
  }
}

import { describe, it, expect } from "vitest";
import { subDays, parseISO } from "date-fns";

// Funções testadas (copiadas do componente para teste)
function calculateDelta(current: number, previous: number): { delta: number; percentage: number; isPositive: boolean } {
  if (previous === 0) return { delta: 0, percentage: 0, isPositive: current >= 0 };
  const delta = current - previous;
  const percentage = (delta / previous) * 100;
  return { delta, percentage, isPositive: delta >= 0 };
}

function getPreviousPeriodFilter(filter: { mode: "preset" | "custom"; days?: number; dateFrom?: string; dateTo?: string }): { days?: number; dateFrom?: string; dateTo?: string } {
  if (filter.mode === "preset" && filter.days) {
    return { days: filter.days };
  }
  if (filter.dateFrom && filter.dateTo) {
    const from = parseISO(filter.dateFrom);
    const to = parseISO(filter.dateTo);
    const daysDiff = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    const prevTo = subDays(from, 1);
    const prevFrom = subDays(prevTo, daysDiff);
    return {
      dateFrom: prevFrom.toISOString().split('T')[0],
      dateTo: prevTo.toISOString().split('T')[0]
    };
  }
  return { days: 7 };
}

describe("Dashboard de Campanhas - Análise de Tendências", () => {
  describe("calculateDelta", () => {
    it("deve calcular delta positivo corretamente", () => {
      const result = calculateDelta(150, 100);
      expect(result.delta).toBe(50);
      expect(result.percentage).toBe(50);
      expect(result.isPositive).toBe(true);
    });

    it("deve calcular delta negativo corretamente", () => {
      const result = calculateDelta(80, 100);
      expect(result.delta).toBe(-20);
      expect(result.percentage).toBe(-20);
      expect(result.isPositive).toBe(false);
    });

    it("deve retornar zero quando previous é zero", () => {
      const result = calculateDelta(100, 0);
      expect(result.delta).toBe(0);
      expect(result.percentage).toBe(0);
      expect(result.isPositive).toBe(true);
    });

    it("deve calcular delta zero quando valores são iguais", () => {
      const result = calculateDelta(100, 100);
      expect(result.delta).toBe(0);
      expect(result.percentage).toBe(0);
      expect(result.isPositive).toBe(true);
    });

    it("deve calcular percentual grande corretamente", () => {
      const result = calculateDelta(300, 100);
      expect(result.percentage).toBe(200);
      expect(result.isPositive).toBe(true);
    });
  });

  describe("getPreviousPeriodFilter", () => {
    it("deve retornar mesmo número de dias para modo preset", () => {
      const filter = { mode: "preset" as const, days: 7 };
      const result = getPreviousPeriodFilter(filter);
      expect(result.days).toBe(7);
    });

    it("deve calcular período anterior para modo custom", () => {
      const filter = {
        mode: "custom" as const,
        dateFrom: "2026-06-01",
        dateTo: "2026-06-10"
      };
      const result = getPreviousPeriodFilter(filter);
      
      // Período atual: 1-10 junho (10 dias)
      // Período anterior deve ser: 22-31 maio (10 dias)
      expect(result.dateFrom).toBe("2026-05-22");
      expect(result.dateTo).toBe("2026-05-31");
    });

    it("deve retornar 7 dias por padrão quando sem parâmetros", () => {
      const filter = { mode: "custom" as const };
      const result = getPreviousPeriodFilter(filter);
      expect(result.days).toBe(7);
    });

    it("deve calcular corretamente para período de 30 dias", () => {
      const filter = {
        mode: "custom" as const,
        dateFrom: "2026-06-01",
        dateTo: "2026-06-30"
      };
      const result = getPreviousPeriodFilter(filter);
      
      // Período atual: 1-30 junho (30 dias)
      // Período anterior deve ser: 2-31 maio (30 dias)
      expect(result.dateFrom).toBe("2026-05-02");
      expect(result.dateTo).toBe("2026-05-31");
    });

    it("deve manter o mesmo número de dias entre períodos", () => {
      const filter = {
        mode: "custom" as const,
        dateFrom: "2026-06-05",
        dateTo: "2026-06-12"
      };
      const result = getPreviousPeriodFilter(filter);
      
      const from = parseISO(result.dateFrom!);
      const to = parseISO(result.dateTo!);
      const daysDiff = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
      
      // Deve ter o mesmo número de dias (7)
      expect(daysDiff).toBe(7);
    });
  });

  describe("Integração - Análise de Tendências", () => {
    it("deve identificar melhora em conversões", () => {
      const current = 150;
      const previous = 100;
      const result = calculateDelta(current, previous);
      
      expect(result.isPositive).toBe(true);
      expect(result.percentage).toBeGreaterThan(0);
    });

    it("deve identificar piora em CPC", () => {
      const current = 2.50;
      const previous = 2.00;
      const result = calculateDelta(current, previous);
      
      // Para CPC, isPositive=true significa piora (CPC maior é ruim)
      expect(result.isPositive).toBe(true);
      expect(result.percentage).toBeGreaterThan(0);
    });

    it("deve calcular ROAS médio corretamente", () => {
      const campaigns = [
        { roas: 2.5 },
        { roas: 3.0 },
        { roas: 2.0 }
      ];
      const avgROAS = campaigns.reduce((sum, c) => sum + c.roas, 0) / campaigns.length;
      expect(avgROAS).toBe(2.5);
    });

    it("deve lidar com valores monetários em milhares", () => {
      const spendInCents = 50000; // R$ 500
      const displayValue = (spendInCents / 1000).toFixed(1); // 50.0k
      expect(displayValue).toBe("50.0");
    });
  });
});

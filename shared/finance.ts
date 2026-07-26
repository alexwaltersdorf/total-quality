// Constantes compartilhadas do módulo de controle financeiro pessoal.
// Usadas tanto no servidor (validação/OCR) quanto no cliente (UI).

export const EXPENSE_CATEGORIES = [
  "Alimentação",
  "Mercado",
  "Transporte",
  "Moradia",
  "Saúde",
  "Educação",
  "Lazer",
  "Compras",
  "Contas & Serviços",
  "Assinaturas",
  "Viagem",
  "Outros",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const PAYMENT_METHODS = [
  "Dinheiro",
  "Débito",
  "Crédito",
  "Pix",
  "Boleto",
  "Outro",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

// Cores por categoria (usadas nos gráficos do dashboard).
export const CATEGORY_COLORS: Record<string, string> = {
  "Alimentação": "#EF4444",
  "Mercado": "#22C55E",
  "Transporte": "#F59E0B",
  "Moradia": "#6366F1",
  "Saúde": "#10B981",
  "Educação": "#3B82F6",
  "Lazer": "#EC4899",
  "Compras": "#8B5CF6",
  "Contas & Serviços": "#14B8A6",
  "Assinaturas": "#A855F7",
  "Viagem": "#0EA5E9",
  "Outros": "#6B7280",
};

export function getCategoryColor(category: string | null | undefined): string {
  return CATEGORY_COLORS[category || "Outros"] || "#6B7280";
}

// Normaliza uma categoria sugerida pela IA para uma das categorias válidas.
export function normalizeCategory(raw: string | null | undefined): ExpenseCategory {
  if (!raw) return "Outros";
  const found = EXPENSE_CATEGORIES.find(
    (c) => c.toLowerCase() === raw.trim().toLowerCase()
  );
  return found ?? "Outros";
}

export function normalizePaymentMethod(raw: string | null | undefined): PaymentMethod {
  if (!raw) return "Outro";
  const found = PAYMENT_METHODS.find(
    (m) => m.toLowerCase() === raw.trim().toLowerCase()
  );
  return found ?? "Outro";
}

import { invokeLLM } from "./llm";
import { storagePut } from "../storage";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@shared/finance";

export type ReceiptItem = {
  name: string;
  quantity?: number;
  total?: number;
};

export type ReceiptExtraction = {
  merchant: string | null;
  description: string;
  amount: number;
  category: string;
  paymentMethod: string;
  expenseDate: string | null; // YYYY-MM-DD
  items: ReceiptItem[];
  confidence: number; // 0-1
  currency: string | null;
};

export type ReceiptAnalysisResult = {
  receiptImageUrl: string | null;
  extraction: ReceiptExtraction;
};

const RESULT_SCHEMA = {
  name: "receipt_extraction",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      merchant: {
        type: ["string", "null"],
        description: "Nome do estabelecimento/loja onde a compra foi feita.",
      },
      description: {
        type: "string",
        description:
          "Descrição curta do gasto em português (ex.: 'Compra no supermercado', 'Almoço', 'Abastecimento de combustível').",
      },
      amount: {
        type: "number",
        description: "Valor TOTAL pago, como número (ex.: 42.90). Sem símbolo de moeda.",
      },
      category: {
        type: "string",
        enum: [...EXPENSE_CATEGORIES],
        description: "Categoria do gasto, escolhida ESTRITAMENTE da lista fornecida.",
      },
      paymentMethod: {
        type: "string",
        enum: [...PAYMENT_METHODS],
        description: "Forma de pagamento identificada, ou 'Outro' se não for possível determinar.",
      },
      expenseDate: {
        type: ["string", "null"],
        description: "Data da compra no formato YYYY-MM-DD. Null se não estiver visível.",
      },
      currency: {
        type: ["string", "null"],
        description: "Código da moeda (ex.: BRL). Null se desconhecido.",
      },
      items: {
        type: "array",
        description: "Itens individuais listados na nota (máx. 30). Vazio se não houver.",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            name: { type: "string" },
            quantity: { type: ["number", "null"] },
            total: { type: ["number", "null"] },
          },
          required: ["name", "quantity", "total"],
        },
      },
      confidence: {
        type: "number",
        description: "Confiança da extração de 0 a 1.",
      },
    },
    required: [
      "merchant",
      "description",
      "amount",
      "category",
      "paymentMethod",
      "expenseDate",
      "currency",
      "items",
      "confidence",
    ],
  },
} as const;

const SYSTEM_PROMPT = `Você é um assistente financeiro especialista em ler comprovantes, notas fiscais, cupons fiscais e recibos brasileiros a partir de fotos.

Sua tarefa é extrair os dados do gasto da imagem enviada e devolvê-los de forma estruturada.

Regras:
- O valor "amount" deve ser SEMPRE o valor TOTAL pago (o total final da nota), como número decimal (use ponto como separador decimal).
- A "category" DEVE ser exatamente uma das categorias permitidas.
- Use "Mercado" para supermercados/compras de mercado e "Alimentação" para restaurantes, lanchonetes, delivery e cafés.
- A "expenseDate" deve estar no formato YYYY-MM-DD. Se a nota não mostrar a data, retorne null.
- Extraia os itens individuais quando forem legíveis (nome, quantidade e valor). Se não houver itens legíveis, retorne uma lista vazia.
- Se a imagem não for um comprovante legível, retorne amount 0, description "Não foi possível ler o comprovante" e confidence 0.
- Responda SOMENTE com o objeto estruturado, em português.`;

function parseDataUrl(dataUrl: string): { mime: string; buffer: Buffer } | null {
  const match = /^data:([^;]+);base64,([\s\S]+)$/.exec(dataUrl);
  if (!match) return null;
  return { mime: match[1], buffer: Buffer.from(match[2], "base64") };
}

function extForMime(mime: string): string {
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("heic")) return "heic";
  if (mime.includes("pdf")) return "pdf";
  return "jpg";
}

/**
 * Persiste a imagem do comprovante no storage. Retorna a URL pública ou null em falha.
 * A persistência é "best-effort": se falhar, a análise ainda prossegue.
 */
async function persistReceipt(dataUrl: string): Promise<string | null> {
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) return null;
  try {
    const ext = extForMime(parsed.mime);
    // Chave única sem depender de Date.now()/Math.random (indisponíveis em alguns contextos):
    const key = `financas/comprovantes/${new Date().toISOString().replace(/[:.]/g, "-")}-${parsed.buffer.length}.${ext}`;
    const { url } = await storagePut(key, parsed.buffer, parsed.mime);
    return url;
  } catch (err) {
    console.warn("[receiptAnalysis] Falha ao salvar comprovante no storage:", err);
    return null;
  }
}

/**
 * Analisa a foto de um comprovante e extrai os dados do gasto usando visão + IA.
 * @param imageDataUrl data URL da imagem (data:image/jpeg;base64,...)
 */
export async function analyzeReceipt(imageDataUrl: string): Promise<ReceiptAnalysisResult> {
  if (!imageDataUrl || !imageDataUrl.startsWith("data:")) {
    throw new Error("Imagem inválida: envie um data URL base64.");
  }

  // Persiste a imagem em paralelo com a análise.
  const [receiptImageUrl, llmResult] = await Promise.all([
    persistReceipt(imageDataUrl),
    invokeLLM({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: "Extraia os dados deste comprovante de gasto." },
            { type: "image_url", image_url: { url: imageDataUrl, detail: "high" } },
          ],
        },
      ],
      responseFormat: { type: "json_schema", json_schema: RESULT_SCHEMA },
      maxTokens: 4096,
    }),
  ]);

  const raw = llmResult.choices?.[0]?.message?.content;
  const text = typeof raw === "string" ? raw : Array.isArray(raw) ? raw.map(p => ("text" in p ? p.text : "")).join("") : "";

  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Não foi possível interpretar a resposta da análise do comprovante.");
  }

  const extraction: ReceiptExtraction = {
    merchant: parsed.merchant ?? null,
    description: parsed.description || "Gasto",
    amount: typeof parsed.amount === "number" ? parsed.amount : parseFloat(parsed.amount) || 0,
    category: parsed.category || "Outros",
    paymentMethod: parsed.paymentMethod || "Outro",
    expenseDate: parsed.expenseDate ?? null,
    items: Array.isArray(parsed.items)
      ? parsed.items.slice(0, 30).map((it: any) => ({
          name: String(it.name ?? ""),
          quantity: it.quantity ?? undefined,
          total: it.total ?? undefined,
        }))
      : [],
    confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.5,
    currency: parsed.currency ?? "BRL",
  };

  return { receiptImageUrl, extraction };
}

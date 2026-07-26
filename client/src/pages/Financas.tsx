import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation, useParams } from "wouter";
import { useState, useMemo, useRef, useCallback } from "react";
import {
  format, startOfMonth, endOfMonth, subMonths, addMonths, parseISO, isSameMonth,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Wallet, LayoutDashboard, Camera, ReceiptText, CalendarRange, Target,
  ChevronLeft, LogOut, Lock, Mail, Eye, EyeOff, Loader2, Upload, Sparkles,
  Trash2, Pencil, Plus, Search, X, ArrowUp, ArrowDown, TrendingUp, TrendingDown,
  CircleDollarSign, Hash, CalendarDays, Tag as TagIcon, CreditCard, Store,
  ChevronRight, Save, ImageIcon, Check, FileDown, PiggyBank, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend, LineChart, Line,
} from "recharts";
import { toast } from "sonner";
import {
  EXPENSE_CATEGORIES, PAYMENT_METHODS, getCategoryColor,
} from "@shared/finance";

const BRAND = "#9B212B";

// ===================== Helpers =====================
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
function fmtBRL(n: number | null | undefined): string {
  return brl.format(Number(n ?? 0));
}
function fmtShortBRL(n: number): string {
  if (Math.abs(n) >= 1000) return `R$ ${(n / 1000).toFixed(1)}k`;
  return `R$ ${n.toFixed(0)}`;
}
function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}
function fmtDate(iso: string): string {
  try {
    return format(parseISO(iso), "dd/MM/yyyy");
  } catch {
    return iso;
  }
}

type ExpenseItem = { name: string; quantity?: number | null; total?: number | null };
type ExpenseForm = {
  description: string;
  merchant: string;
  amount: string;
  category: string;
  paymentMethod: string;
  expenseDate: string;
  notes: string;
  items: ExpenseItem[];
  receiptImageUrl: string | null;
  source: "manual" | "photo";
};

const EMPTY_FORM: ExpenseForm = {
  description: "",
  merchant: "",
  amount: "",
  category: "Outros",
  paymentMethod: "Outro",
  expenseDate: todayISO(),
  notes: "",
  items: [],
  receiptImageUrl: null,
  source: "manual",
};

const PERIOD_PRESETS = [
  { value: "thisMonth", label: "Este mês" },
  { value: "30", label: "Últimos 30 dias" },
  { value: "90", label: "Últimos 90 dias" },
  { value: "180", label: "Últimos 180 dias" },
  { value: "365", label: "Último ano" },
];

function periodToQuery(period: string): { days?: number; dateFrom?: string; dateTo?: string } {
  if (period === "thisMonth") {
    return {
      dateFrom: format(startOfMonth(new Date()), "yyyy-MM-dd"),
      dateTo: format(endOfMonth(new Date()), "yyyy-MM-dd"),
    };
  }
  return { days: Number(period) };
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ===================== KPI Card =====================
function KpiCard({ icon: Icon, label, value, sub, accent }: {
  icon: any; label: string; value: string; sub?: string; accent?: string;
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4 md:p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
          </div>
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${accent || BRAND}15` }}
          >
            <Icon className="h-5 w-5" style={{ color: accent || BRAND }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const color = getCategoryColor(category);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `${color}18`, color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {category}
    </span>
  );
}

// ===================== Chart tooltip =====================
function MoneyTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-white px-3 py-2 shadow-md text-sm">
      {label && <p className="font-medium mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-muted-foreground">
          <span className="font-semibold" style={{ color: p.color || p.fill }}>
            {fmtBRL(p.value)}
          </span>
        </p>
      ))}
    </div>
  );
}

// ===================== DASHBOARD TAB =====================
function DashboardTab({ period }: { period: string }) {
  const query = trpc.finance.dashboard.useQuery(periodToQuery(period));
  const data = query.data;

  if (query.isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        <Skeleton className="h-72 col-span-2 rounded-xl" />
        <Skeleton className="h-72 col-span-2 rounded-xl" />
      </div>
    );
  }

  if (!data) return <p className="text-muted-foreground">Não foi possível carregar os dados.</p>;

  const { summary, byCategory, byDay, byPaymentMethod, topMerchants, byMonth, budgets } = data;
  const numDays = byDay.length || 1;
  const avgDaily = summary.total / Math.max(numDays, 1);
  const topCategory = byCategory[0];

  // Orçamento do mês atual (soma da categoria no mês corrente)
  const monthBudgets = budgets
    .filter((b) => b.monthlyLimit > 0)
    .map((b) => {
      const spent = byCategory.find((c) => c.category === b.category)?.total ?? 0;
      return { ...b, spent, pct: b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0 };
    });

  const dayChart = byDay.map((d) => ({ ...d, label: format(parseISO(d.day), "dd/MM") }));
  const monthChart = byMonth.map((m) => ({
    ...m,
    label: format(parseISO(`${m.month}-01`), "MMM/yy", { locale: ptBR }),
  }));

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={CircleDollarSign} label="Total gasto" value={fmtBRL(summary.total)} sub={`${data.byDay.length} dias com gastos`} />
        <KpiCard icon={Hash} label="Lançamentos" value={String(summary.count)} sub="no período" accent="#6366F1" />
        <KpiCard icon={ReceiptText} label="Ticket médio" value={fmtBRL(summary.avgTicket)} sub="por lançamento" accent="#F59E0B" />
        <KpiCard icon={CalendarDays} label="Média diária" value={fmtBRL(avgDaily)} sub={topCategory ? `Maior: ${topCategory.category}` : undefined} accent="#10B981" />
      </div>

      {summary.count === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center space-y-2">
            <Wallet className="h-10 w-10 mx-auto text-muted-foreground/50" />
            <p className="font-medium">Nenhum gasto neste período</p>
            <p className="text-sm text-muted-foreground">Use a aba <b>Lançar por Foto</b> para registrar seus gastos enviando fotos dos comprovantes.</p>
          </CardContent>
        </Card>
      )}

      {summary.count > 0 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Gastos por dia */}
            <Card className="border-0 shadow-sm lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Gastos por dia</CardTitle>
                <CardDescription>Evolução diária no período</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={dayChart} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={BRAND} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={BRAND} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={fmtShortBRL} />
                    <ReTooltip content={<MoneyTooltip />} />
                    <Area type="monotone" dataKey="total" stroke={BRAND} strokeWidth={2} fill="url(#gExp)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Por categoria */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Por categoria</CardTitle>
                <CardDescription>Distribuição dos gastos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={byCategory}
                      dataKey="total"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      paddingAngle={2}
                    >
                      {byCategory.map((c) => (
                        <Cell key={c.category} fill={getCategoryColor(c.category)} />
                      ))}
                    </Pie>
                    <ReTooltip content={<MoneyTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2 max-h-32 overflow-y-auto">
                  {byCategory.slice(0, 6).map((c) => (
                    <div key={c.category} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: getCategoryColor(c.category) }} />
                        {c.category}
                      </span>
                      <span className="font-medium">{fmtBRL(c.total)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Evolução mensal */}
            <Card className="border-0 shadow-sm lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Evolução mensal</CardTitle>
                <CardDescription>Total gasto nos últimos 12 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={monthChart} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={fmtShortBRL} />
                    <ReTooltip content={<MoneyTooltip />} />
                    <Line type="monotone" dataKey="total" stroke={BRAND} strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Forma de pagamento */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Forma de pagamento</CardTitle>
                <CardDescription>Como você pagou</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={byPaymentMethod} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                    <XAxis type="number" hide tickFormatter={fmtShortBRL} />
                    <YAxis type="category" dataKey="paymentMethod" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={70} />
                    <ReTooltip content={<MoneyTooltip />} />
                    <Bar dataKey="total" fill={BRAND} radius={[0, 6, 6, 0]} barSize={22} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top estabelecimentos + Orçamentos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><Store className="h-4 w-4" /> Onde você mais gastou</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {topMerchants.length === 0 && <p className="text-sm text-muted-foreground">Sem dados de estabelecimento.</p>}
                {topMerchants.map((m, i) => {
                  const max = topMerchants[0]?.total || 1;
                  return (
                    <div key={m.merchant + i} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="truncate font-medium">{i + 1}. {m.merchant}</span>
                        <span className="text-muted-foreground shrink-0 ml-2">{fmtBRL(m.total)}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(m.total / max) * 100}%`, backgroundColor: BRAND }} />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4" /> Orçamentos do mês</CardTitle>
                <CardDescription>Gasto vs. limite definido</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {monthBudgets.length === 0 && (
                  <p className="text-sm text-muted-foreground">Defina limites por categoria na aba <b>Orçamentos</b> para acompanhar aqui.</p>
                )}
                {monthBudgets.map((b) => {
                  const over = b.spent > b.monthlyLimit;
                  return (
                    <div key={b.category} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: getCategoryColor(b.category) }} />
                          {b.category}
                        </span>
                        <span className={over ? "text-red-600 font-medium" : "text-muted-foreground"}>
                          {fmtBRL(b.spent)} / {fmtBRL(b.monthlyLimit)}
                        </span>
                      </div>
                      <Progress value={Math.min(b.pct, 100)} className={over ? "[&>div]:bg-red-500" : ""} />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

// ===================== EXPENSE FORM (shared by photo + manual + edit) =====================
function ExpenseFields({ form, setForm, disabled }: {
  form: ExpenseForm; setForm: (f: ExpenseForm) => void; disabled?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-1.5 sm:col-span-2">
        <Label>Descrição *</Label>
        <Input value={form.description} disabled={disabled}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Ex.: Compra no supermercado" />
      </div>
      <div className="space-y-1.5">
        <Label>Estabelecimento</Label>
        <Input value={form.merchant} disabled={disabled}
          onChange={(e) => setForm({ ...form, merchant: e.target.value })}
          placeholder="Ex.: Supermercado Extra" />
      </div>
      <div className="space-y-1.5">
        <Label>Valor (R$) *</Label>
        <Input type="number" step="0.01" min="0" value={form.amount} disabled={disabled}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          placeholder="0,00" />
      </div>
      <div className="space-y-1.5">
        <Label>Categoria</Label>
        <Select value={form.category} disabled={disabled} onValueChange={(v) => setForm({ ...form, category: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {EXPENSE_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: getCategoryColor(c) }} />
                  {c}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Forma de pagamento</Label>
        <Select value={form.paymentMethod} disabled={disabled} onValueChange={(v) => setForm({ ...form, paymentMethod: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {PAYMENT_METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Data do gasto *</Label>
        <Input type="date" value={form.expenseDate} disabled={disabled}
          onChange={(e) => setForm({ ...form, expenseDate: e.target.value })} />
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <Label>Observações</Label>
        <Textarea value={form.notes} disabled={disabled} rows={2}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="Anotações opcionais" />
      </div>
      {form.items.length > 0 && (
        <div className="sm:col-span-2 space-y-1.5">
          <Label>Itens identificados na nota ({form.items.length})</Label>
          <div className="rounded-lg border max-h-40 overflow-y-auto divide-y">
            {form.items.map((it, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-1.5 text-sm">
                <span className="truncate">
                  {it.quantity ? <span className="text-muted-foreground mr-1">{it.quantity}x</span> : null}
                  {it.name}
                </span>
                {it.total != null && <span className="text-muted-foreground shrink-0">{fmtBRL(it.total)}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ===================== LAUNCH (PHOTO) TAB =====================
function LaunchTab({ onSaved }: { onSaved: () => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [form, setForm] = useState<ExpenseForm>(EMPTY_FORM);
  const [analyzed, setAnalyzed] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [confidence, setConfidence] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const analyzeMutation = trpc.finance.analyzeReceipt.useMutation();
  const createMutation = trpc.finance.create.useMutation();

  const reset = useCallback(() => {
    setPreview(null);
    setForm(EMPTY_FORM);
    setAnalyzed(false);
    setManualMode(false);
    setConfidence(null);
    if (fileRef.current) fileRef.current.value = "";
  }, []);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Envie um arquivo de imagem (foto do comprovante).");
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setPreview(dataUrl);
      setAnalyzed(false);
      setManualMode(false);
      // Dispara análise automaticamente
      await runAnalysis(dataUrl);
    } catch {
      toast.error("Falha ao ler a imagem.");
    }
  };

  const runAnalysis = async (dataUrl: string) => {
    try {
      const res = await analyzeMutation.mutateAsync({ imageBase64: dataUrl });
      const ex = res.extraction;
      setForm({
        description: ex.description || "",
        merchant: ex.merchant || "",
        amount: ex.amount ? String(ex.amount) : "",
        category: ex.category || "Outros",
        paymentMethod: ex.paymentMethod || "Outro",
        expenseDate: ex.expenseDate || todayISO(),
        notes: "",
        items: ex.items || [],
        receiptImageUrl: res.receiptImageUrl,
        source: "photo",
      });
      setConfidence(ex.confidence ?? null);
      setAnalyzed(true);
      if (ex.amount > 0) {
        toast.success("Comprovante analisado! Revise os dados e salve.");
      } else {
        toast.warning("Não consegui ler bem o comprovante. Preencha os dados manualmente.");
      }
    } catch (e: any) {
      toast.error(e?.message || "Erro ao analisar o comprovante.");
      setManualMode(true);
      setForm({ ...EMPTY_FORM, source: "photo", receiptImageUrl: null });
    }
  };

  const handleSave = async () => {
    const amount = parseFloat(form.amount.replace(",", "."));
    if (!form.description.trim()) return toast.error("Informe a descrição do gasto.");
    if (!amount || amount <= 0) return toast.error("Informe um valor válido.");
    if (!form.expenseDate) return toast.error("Informe a data do gasto.");
    try {
      await createMutation.mutateAsync({
        description: form.description.trim(),
        merchant: form.merchant.trim() || null,
        amount,
        category: form.category,
        paymentMethod: form.paymentMethod,
        expenseDate: form.expenseDate,
        notes: form.notes.trim() || null,
        items: form.items.length ? form.items : null,
        receiptImageUrl: form.receiptImageUrl,
        source: form.source,
      });
      toast.success("Gasto registrado com sucesso!");
      reset();
      onSaved();
    } catch (e: any) {
      toast.error(e?.message || "Erro ao salvar o gasto.");
    }
  };

  const analyzing = analyzeMutation.isPending;
  const showForm = analyzed || manualMode;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Coluna esquerda: upload / preview */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><Camera className="h-4 w-4" /> Foto do comprovante</CardTitle>
          <CardDescription>Tire uma foto ou selecione a imagem do recibo/nota. A IA extrai os dados automaticamente.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          {!preview ? (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed rounded-xl py-12 flex flex-col items-center gap-3 text-muted-foreground hover:border-[#9B212B]/50 hover:bg-[#9B212B]/[0.02] transition-colors"
            >
              <div className="h-14 w-14 rounded-2xl bg-[#9B212B]/10 flex items-center justify-center">
                <Upload className="h-7 w-7 text-[#9B212B]" />
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground">Enviar foto do comprovante</p>
                <p className="text-xs">Toque para tirar foto ou escolher da galeria</p>
              </div>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden border bg-muted/30">
                <img src={preview} alt="Comprovante" className="w-full max-h-[420px] object-contain" />
                {analyzing && (
                  <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-[#9B212B]" />
                    <p className="text-sm font-medium text-[#9B212B]">Analisando comprovante com IA...</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={reset} disabled={analyzing}>
                  <X className="h-4 w-4 mr-1" /> Trocar imagem
                </Button>
                {!analyzing && !analyzed && (
                  <Button className="flex-1 bg-[#9B212B] hover:bg-[#7a1a22]" onClick={() => preview && runAnalysis(preview)}>
                    <Sparkles className="h-4 w-4 mr-1" /> Analisar novamente
                  </Button>
                )}
              </div>
            </div>
          )}

          {!preview && (
            <Button variant="ghost" className="w-full" onClick={() => { setManualMode(true); setForm({ ...EMPTY_FORM, source: "manual" }); }}>
              <Pencil className="h-4 w-4 mr-1" /> Prefiro lançar manualmente
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Coluna direita: formulário */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><ReceiptText className="h-4 w-4" /> Dados do gasto</CardTitle>
          <CardDescription>
            {showForm ? "Revise e ajuste os dados antes de salvar." : "Envie um comprovante ou lance manualmente."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showForm ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-40" />
              Os dados extraídos do comprovante aparecerão aqui.
            </div>
          ) : (
            <>
              {analyzed && confidence !== null && (
                <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${confidence >= 0.6 ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                  {confidence >= 0.6 ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  {confidence >= 0.6 ? "Dados extraídos com boa confiança." : "Confira os dados: a leitura ficou com baixa confiança."}
                </div>
              )}
              <ExpenseFields form={form} setForm={setForm} disabled={analyzing} />
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={reset} className="flex-1">Cancelar</Button>
                <Button className="flex-1 bg-[#9B212B] hover:bg-[#7a1a22]" onClick={handleSave} disabled={createMutation.isPending}>
                  {createMutation.isPending ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Salvando...</> : <><Save className="h-4 w-4 mr-1" /> Salvar gasto</>}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ===================== EXPENSES LIST TAB =====================
function ExpensesTab() {
  const utils = trpc.useUtils();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [page, setPage] = useState(0);
  const pageSize = 25;

  const [editing, setEditing] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<ExpenseForm>(EMPTY_FORM);
  const [viewReceipt, setViewReceipt] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const listQuery = trpc.finance.list.useQuery({
    limit: pageSize,
    offset: page * pageSize,
    search: search || undefined,
    category: category === "all" ? undefined : category,
  });
  const updateMutation = trpc.finance.update.useMutation();
  const deleteMutation = trpc.finance.delete.useMutation();

  const items = listQuery.data?.items ?? [];
  const total = listQuery.data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  const openEdit = (exp: any) => {
    setEditing(exp);
    setEditForm({
      description: exp.description ?? "",
      merchant: exp.merchant ?? "",
      amount: String(exp.amount ?? ""),
      category: exp.category ?? "Outros",
      paymentMethod: exp.paymentMethod ?? "Outro",
      expenseDate: exp.expenseDate ?? todayISO(),
      notes: exp.notes ?? "",
      items: Array.isArray(exp.items) ? exp.items : [],
      receiptImageUrl: exp.receiptImageUrl ?? null,
      source: exp.source ?? "manual",
    });
  };

  const saveEdit = async () => {
    if (!editing) return;
    const amount = parseFloat(editForm.amount.replace(",", "."));
    if (!editForm.description.trim() || !amount || amount <= 0) {
      return toast.error("Preencha descrição e valor válidos.");
    }
    try {
      await updateMutation.mutateAsync({
        id: editing.id,
        description: editForm.description.trim(),
        merchant: editForm.merchant.trim() || null,
        amount,
        category: editForm.category,
        paymentMethod: editForm.paymentMethod,
        expenseDate: editForm.expenseDate,
        notes: editForm.notes.trim() || null,
      });
      toast.success("Gasto atualizado.");
      setEditing(null);
      utils.finance.list.invalidate();
      utils.finance.dashboard.invalidate();
    } catch (e: any) {
      toast.error(e?.message || "Erro ao atualizar.");
    }
  };

  const confirmDelete = async () => {
    if (deleteId == null) return;
    try {
      await deleteMutation.mutateAsync({ id: deleteId });
      toast.success("Gasto excluído.");
      setDeleteId(null);
      utils.finance.list.invalidate();
      utils.finance.dashboard.invalidate();
    } catch (e: any) {
      toast.error(e?.message || "Erro ao excluir.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por descrição ou estabelecimento..."
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
        </div>
        <Select value={category} onValueChange={(v) => { setCategory(v); setPage(0); }}>
          <SelectTrigger className="w-full sm:w-56"><SelectValue placeholder="Todas as categorias" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {EXPENSE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="hidden md:table-cell">Estabelecimento</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="hidden sm:table-cell">Pagamento</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-[110px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listQuery.isLoading && Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}><TableCell colSpan={7}><Skeleton className="h-6 w-full" /></TableCell></TableRow>
                ))}
                {!listQuery.isLoading && items.length === 0 && (
                  <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                    Nenhum gasto encontrado.
                  </TableCell></TableRow>
                )}
                {items.map((exp) => (
                  <TableRow key={exp.id}>
                    <TableCell className="whitespace-nowrap text-sm">{fmtDate(exp.expenseDate)}</TableCell>
                    <TableCell className="font-medium max-w-[220px] truncate">
                      {exp.description}
                      {exp.source === "photo" && <Camera className="inline h-3 w-3 ml-1.5 text-muted-foreground" />}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-[160px] truncate">{exp.merchant || "—"}</TableCell>
                    <TableCell><CategoryBadge category={exp.category} /></TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{exp.paymentMethod}</TableCell>
                    <TableCell className="text-right font-semibold whitespace-nowrap">{fmtBRL(exp.amount)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {exp.receiptImageUrl && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewReceipt(exp.receiptImageUrl)} title="Ver comprovante">
                            <ImageIcon className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(exp)} title="Editar">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700" onClick={() => setDeleteId(exp.id)} title="Excluir">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{total} lançamentos</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" /> Anterior
            </Button>
            <span className="text-sm">{page + 1} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Próxima <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Dialog editar */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar gasto</DialogTitle>
            <DialogDescription>Atualize as informações do lançamento.</DialogDescription>
          </DialogHeader>
          <ExpenseFields form={editForm} setForm={setEditForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
            <Button className="bg-[#9B212B] hover:bg-[#7a1a22]" onClick={saveEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog comprovante */}
      <Dialog open={!!viewReceipt} onOpenChange={(o) => !o && setViewReceipt(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Comprovante</DialogTitle></DialogHeader>
          {viewReceipt && <img src={viewReceipt} alt="Comprovante" className="w-full rounded-lg" />}
        </DialogContent>
      </Dialog>

      {/* Dialog excluir */}
      <Dialog open={deleteId != null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir gasto?</DialogTitle>
            <DialogDescription>Esta ação não pode ser desfeita.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===================== MONTHLY CLOSING TAB =====================
function ClosingTab() {
  const [monthDate, setMonthDate] = useState(() => new Date());
  const monthStr = format(monthDate, "yyyy-MM");
  const query = trpc.finance.monthlyClosing.useQuery({ month: monthStr });
  const data = query.data;

  const isCurrentMonth = isSameMonth(monthDate, new Date());

  const exportPdf = async () => {
    if (!data) return;
    try {
      const { default: jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;
      const doc = new jsPDF();
      const title = format(monthDate, "MMMM 'de' yyyy", { locale: ptBR });
      doc.setFontSize(18);
      doc.setTextColor(BRAND);
      doc.text("Fechamento Financeiro", 14, 20);
      doc.setFontSize(12);
      doc.setTextColor(80);
      doc.text(title.charAt(0).toUpperCase() + title.slice(1), 14, 28);

      doc.setFontSize(11);
      doc.setTextColor(0);
      doc.text(`Total gasto: ${fmtBRL(data.summary.total)}`, 14, 40);
      doc.text(`Lançamentos: ${data.summary.count}`, 14, 47);
      doc.text(`Ticket médio: ${fmtBRL(data.summary.avgTicket)}`, 14, 54);
      const diff = data.summary.total - data.previous.total;
      doc.text(`Comparado ao mês anterior: ${diff >= 0 ? "+" : ""}${fmtBRL(diff)}`, 14, 61);

      autoTable(doc, {
        startY: 70,
        head: [["Categoria", "Valor", "% do total", "Lançamentos"]],
        body: data.byCategory.map((c) => [
          c.category,
          fmtBRL(c.total),
          data.summary.total > 0 ? `${((c.total / data.summary.total) * 100).toFixed(1)}%` : "0%",
          String(c.count),
        ]),
        headStyles: { fillColor: [155, 33, 43] },
      });

      doc.save(`fechamento-${monthStr}.pdf`);
      toast.success("PDF exportado!");
    } catch (e: any) {
      toast.error("Erro ao gerar PDF.");
    }
  };

  const diff = data ? data.summary.total - data.previous.total : 0;
  const diffPct = data && data.previous.total > 0 ? (diff / data.previous.total) * 100 : null;
  const up = diff > 0;

  const budgetRows = useMemo(() => {
    if (!data) return [];
    return data.byCategory.map((c) => {
      const budget = data.budgets.find((b) => b.category === c.category)?.monthlyLimit ?? 0;
      return { ...c, budget, over: budget > 0 && c.total > budget };
    });
  }, [data]);

  return (
    <div className="space-y-5">
      {/* Navegação de mês */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setMonthDate((d) => subMonths(d, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-center min-w-[180px]">
            <p className="text-lg font-bold capitalize">{format(monthDate, "MMMM 'de' yyyy", { locale: ptBR })}</p>
          </div>
          <Button variant="outline" size="icon" disabled={isCurrentMonth} onClick={() => setMonthDate((d) => addMonths(d, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" onClick={exportPdf} disabled={!data || data.summary.count === 0}>
          <FileDown className="h-4 w-4 mr-1" /> Exportar PDF
        </Button>
      </div>

      {query.isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : !data || data.summary.count === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-10 text-center space-y-2">
            <CalendarRange className="h-10 w-10 mx-auto text-muted-foreground/50" />
            <p className="font-medium">Sem gastos neste mês</p>
            <p className="text-sm text-muted-foreground">Selecione outro mês ou registre gastos na aba Lançar por Foto.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* KPIs do mês */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard icon={CircleDollarSign} label="Total do mês" value={fmtBRL(data.summary.total)} />
            <KpiCard icon={Hash} label="Lançamentos" value={String(data.summary.count)} accent="#6366F1" />
            <KpiCard icon={ReceiptText} label="Ticket médio" value={fmtBRL(data.summary.avgTicket)} accent="#F59E0B" />
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 md:p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">vs. mês anterior</p>
                    <p className={`text-2xl font-bold tracking-tight ${up ? "text-red-600" : "text-green-600"}`}>
                      {up ? "+" : ""}{fmtBRL(diff)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {diffPct !== null ? `${up ? "+" : ""}${diffPct.toFixed(1)}% • ` : ""}
                      Anterior: {fmtBRL(data.previous.total)}
                    </p>
                  </div>
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${up ? "bg-red-50" : "bg-green-50"}`}>
                    {up ? <TrendingUp className="h-5 w-5 text-red-600" /> : <TrendingDown className="h-5 w-5 text-green-600" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Quebra por categoria com orçamento */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Gastos por categoria</CardTitle>
                <CardDescription>Detalhamento e comparação com orçamento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Categoria</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead className="text-right">%</TableHead>
                        <TableHead className="text-right hidden sm:table-cell">Orçamento</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {budgetRows.map((c) => (
                        <TableRow key={c.category}>
                          <TableCell><CategoryBadge category={c.category} /></TableCell>
                          <TableCell className="text-right font-medium">{fmtBRL(c.total)}</TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {((c.total / data.summary.total) * 100).toFixed(1)}%
                          </TableCell>
                          <TableCell className="text-right hidden sm:table-cell">
                            {c.budget > 0 ? (
                              <span className={c.over ? "text-red-600 font-medium" : "text-muted-foreground"}>
                                {fmtBRL(c.budget)}
                              </span>
                            ) : <span className="text-muted-foreground/50">—</span>}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Gráfico pizza + top estabelecimentos */}
            <div className="space-y-4">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="text-base">Distribuição</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={data.byCategory} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={(e: any) => e.category}>
                        {data.byCategory.map((c) => <Cell key={c.category} fill={getCategoryColor(c.category)} />)}
                      </Pie>
                      <ReTooltip content={<MoneyTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Store className="h-4 w-4" /> Top estabelecimentos</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {data.topMerchants.slice(0, 5).map((m, i) => (
                    <div key={m.merchant + i} className="flex items-center justify-between text-sm">
                      <span className="truncate">{i + 1}. {m.merchant}</span>
                      <span className="font-medium shrink-0 ml-2">{fmtBRL(m.total)}</span>
                    </div>
                  ))}
                  {data.topMerchants.length === 0 && <p className="text-sm text-muted-foreground">Sem dados.</p>}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ===================== BUDGETS TAB =====================
function BudgetsTab() {
  const utils = trpc.useUtils();
  const budgetsQuery = trpc.finance.budgets.list.useQuery();
  const setMutation = trpc.finance.budgets.set.useMutation();
  const [values, setValues] = useState<Record<string, string>>({});

  const budgets = budgetsQuery.data ?? [];
  const budgetMap = useMemo(() => {
    const m: Record<string, number> = {};
    budgets.forEach((b) => { m[b.category] = b.monthlyLimit; });
    return m;
  }, [budgets]);

  const getVal = (cat: string) => values[cat] ?? (budgetMap[cat] ? String(budgetMap[cat]) : "");

  const save = async (cat: string) => {
    const raw = getVal(cat);
    const num = parseFloat(String(raw).replace(",", "."));
    if (isNaN(num) || num < 0) return toast.error("Informe um valor válido.");
    try {
      await setMutation.mutateAsync({ category: cat, monthlyLimit: num });
      toast.success(`Orçamento de ${cat} salvo.`);
      utils.finance.budgets.list.invalidate();
      utils.finance.dashboard.invalidate();
    } catch (e: any) {
      toast.error(e?.message || "Erro ao salvar.");
    }
  };

  const totalBudget = budgets.reduce((s, b) => s + b.monthlyLimit, 0);

  return (
    <div className="max-w-2xl space-y-4">
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><PiggyBank className="h-4 w-4" /> Orçamento mensal por categoria</CardTitle>
          <CardDescription>
            Defina um limite de gasto mensal para cada categoria. O acompanhamento aparece no Dashboard e no Fechamento.
            {totalBudget > 0 && <> Orçamento total: <b>{fmtBRL(totalBudget)}</b>/mês.</>}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {budgetsQuery.isLoading && Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-11 w-full" />)}
          {!budgetsQuery.isLoading && EXPENSE_CATEGORIES.map((cat) => (
            <div key={cat} className="flex items-center gap-3">
              <span className="flex items-center gap-2 flex-1 text-sm font-medium">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: getCategoryColor(cat) }} />
                {cat}
              </span>
              <div className="relative w-40">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
                <Input
                  type="number" step="0.01" min="0"
                  className="pl-9"
                  placeholder="0,00"
                  value={getVal(cat)}
                  onChange={(e) => setValues({ ...values, [cat]: e.target.value })}
                />
              </div>
              <Button
                size="sm" variant="outline"
                onClick={() => save(cat)}
                disabled={setMutation.isPending}
              >
                <Save className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ===================== LOGIN GATE =====================
function LoginGate({ navigate }: { navigate: (to: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const loginMutation = trpc.auth.adminLogin.useMutation({
    onSuccess: () => { setError(""); window.location.reload(); },
    onError: (err) => setError(err.message || "Email ou senha incorretos"),
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fafafa] to-[#f0e8e9] p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardContent className="p-8 space-y-6">
          <div className="text-center space-y-3">
            <div className="h-16 w-16 mx-auto rounded-2xl bg-[#9B212B] flex items-center justify-center">
              <Wallet className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Controle Financeiro</h1>
            <p className="text-muted-foreground text-sm">Acesso restrito. Insira suas credenciais para continuar.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required autoFocus />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
            <Button type="submit" className="w-full bg-[#9B212B] hover:bg-[#7a1a22] h-11" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Entrando...</> : "Entrar"}
            </Button>
          </form>
          <Button variant="ghost" onClick={() => navigate("/")} className="w-full">
            <ChevronLeft className="h-4 w-4 mr-2" /> Voltar ao site
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ===================== MAIN PAGE =====================
export default function Financas() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const params = useParams<{ tab?: string }>();
  const [period, setPeriod] = useState("thisMonth");

  const activeTab = params.tab || "dashboard";
  const setTab = (t: string) => navigate(t === "dashboard" ? "/financas" : `/financas/${t}`);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 mx-auto border-4 border-muted border-t-[#9B212B] rounded-full animate-spin" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <LoginGate navigate={navigate} />;

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "lancar", label: "Lançar por Foto", icon: Camera },
    { id: "gastos", label: "Gastos", icon: ReceiptText },
    { id: "fechamento", label: "Fechamento Mensal", icon: CalendarRange },
    { id: "orcamentos", label: "Orçamentos", icon: Target },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container flex items-center justify-between h-16 px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Site
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-[#9B212B]" />
              <h1 className="text-lg font-bold hidden sm:block">Controle Financeiro</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {activeTab === "dashboard" && (
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[160px] h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PERIOD_PRESETS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
            <span className="text-sm text-muted-foreground hidden md:block">{user?.name || user?.email}</span>
            <Button variant="ghost" size="sm" onClick={() => logout()}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 md:px-6 py-6">
        <Tabs value={activeTab} onValueChange={setTab}>
          <TabsList className="mb-6 h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
            {tabs.map((t) => (
              <TabsTrigger
                key={t.id}
                value={t.id}
                className="data-[state=active]:bg-[#9B212B] data-[state=active]:text-white gap-2 rounded-lg border data-[state=active]:border-[#9B212B]"
              >
                <t.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{t.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="dashboard"><DashboardTab period={period} /></TabsContent>
          <TabsContent value="lancar"><LaunchTab onSaved={() => setTab("gastos")} /></TabsContent>
          <TabsContent value="gastos"><ExpensesTab /></TabsContent>
          <TabsContent value="fechamento"><ClosingTab /></TabsContent>
          <TabsContent value="orcamentos"><BudgetsTab /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

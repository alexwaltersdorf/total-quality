import { TooltipProvider } from "@radix-ui/react-tooltip";
/*
 * Style: Optik Editorial Dashboard — Dark theme analytics panel
 * Theme: Dark background #1A1A1A, white text, brand #9B212B accent
 * Typography: Bebas Neue display + DM Sans body
 */
import { useState, useEffect, useMemo } from "react";
import { Link } from "wouter";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  ArrowLeft, ArrowUpRight, ArrowDownRight, TrendingUp, Eye, Phone,
  MessageCircle, FileText, Users, Activity, Clock, MousePointerClick,
  BarChart3, RefreshCw, Trash2, Database, Map, Instagram, ChevronDown, LogOut,
} from "lucide-react";
import DashboardLogin, { logout } from "@/components/DashboardLogin";
import {
  getAllEvents, getEventsByPeriod, getTodayEvents, getSummaryMetrics,
  getDailyMetrics, getHourlyDistribution, getTopPages, getTopSections,
  getTopExamCategories, getLeadSources, getFunnelMetrics, generateDemoData,
  clearAllData, initAnalyticsCapture,
  type AnalyticsEvent,
} from "@/lib/analyticsStore";

// ============================================================
// CORES DO DASHBOARD
// ============================================================
const COLORS = {
  brand: "#9B212B",
  brandLight: "#C4343F",
  green: "#22C55E",
  greenDark: "#16A34A",
  blue: "#3B82F6",
  blueDark: "#2563EB",
  amber: "#F59E0B",
  amberDark: "#D97706",
  purple: "#8B5CF6",
  purpleDark: "#7C3AED",
  cyan: "#06B6D4",
  cyanDark: "#0891B2",
  rose: "#F43F5E",
  roseDark: "#E11D48",
  gray: "#6B7280",
  grayLight: "#9CA3AF",
  surface: "#1A1A1A",
  surfaceLight: "#242424",
  surfaceLighter: "#2E2E2E",
  border: "#3A3A3A",
  text: "#F5F5F5",
  textMuted: "#9CA3AF",
};

const CHART_COLORS = [COLORS.brand, COLORS.blue, COLORS.green, COLORS.amber, COLORS.purple, COLORS.cyan, COLORS.rose];

// ============================================================
// COMPONENTES AUXILIARES
// ============================================================

function MetricCard({
  title, value, icon: Icon, change, changeLabel, color = COLORS.brand,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  change?: number;
  changeLabel?: string;
  color?: string;
}) {
  const isPositive = change !== undefined && change >= 0;
  return (
    <div className="rounded-lg p-5 border" style={{ backgroundColor: COLORS.surfaceLight, borderColor: COLORS.border }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${isPositive ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10"}`}>
            {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-3xl font-bold mb-1" style={{ color: COLORS.text, fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.02em" }}>
        {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
      </p>
      <p className="text-xs uppercase tracking-wider" style={{ color: COLORS.textMuted }}>
        {title}
      </p>
      {changeLabel && (
        <p className="text-xs mt-1" style={{ color: COLORS.textMuted }}>{changeLabel}</p>
      )}
    </div>
  );
}

function SectionTitle({ children, icon: Icon }: { children: React.ReactNode; icon?: React.ElementType }) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: COLORS.textMuted }}>
      {Icon && <Icon className="w-4 h-4" style={{ color: COLORS.brand }} />}
      {children}
    </h3>
  );
}

function ChartCard({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg p-5 border ${className}`} style={{ backgroundColor: COLORS.surfaceLight, borderColor: COLORS.border }}>
      <h4 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: COLORS.textMuted }}>
        {title}
      </h4>
      {children}
    </div>
  );
}

function FunnelStep({ name, value, rate, maxValue, color }: { name: string; value: number; rate: number; maxValue: number; color: string }) {
  const width = maxValue > 0 ? Math.max((value / maxValue) * 100, 4) : 4;
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-medium" style={{ color: COLORS.text }}>{name}</span>
        <span className="text-xs" style={{ color: COLORS.textMuted }}>{value.toLocaleString("pt-BR")} ({rate}%)</span>
      </div>
      <div className="h-6 rounded-sm overflow-hidden" style={{ backgroundColor: COLORS.surfaceLighter }}>
        <div
          className="h-full rounded-sm transition-all duration-700 flex items-center justify-end pr-2"
          style={{ width: `${width}%`, backgroundColor: color }}
        >
          {width > 15 && <span className="text-[10px] font-bold text-white">{rate}%</span>}
        </div>
      </div>
    </div>
  );
}

function RankingItem({ rank, label, value, maxValue, color }: { rank: number; label: string; value: number; maxValue: number; color: string }) {
  const width = maxValue > 0 ? Math.max((value / maxValue) * 100, 2) : 2;
  return (
    <div className="flex items-center gap-3 mb-2.5">
      <span className="text-xs font-bold w-5 text-center" style={{ color: COLORS.textMuted }}>
        {rank}
      </span>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium truncate" style={{ color: COLORS.text }}>{label}</span>
          <span className="text-xs font-semibold ml-2" style={{ color }}>{value}</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: COLORS.surfaceLighter }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${width}%`, backgroundColor: color }} />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// TOOLTIP CUSTOMIZADO
// ============================================================
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg p-3 border shadow-xl" style={{ backgroundColor: COLORS.surfaceLighter, borderColor: COLORS.border }}>
      <p className="text-xs font-semibold mb-2" style={{ color: COLORS.text }}>{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs mb-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span style={{ color: COLORS.textMuted }}>{entry.name}:</span>
          <span className="font-semibold" style={{ color: COLORS.text }}>{entry.value.toLocaleString("pt-BR")}</span>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// COMPONENTE PRINCIPAL: DASHBOARD
// ============================================================
function DashboardContent() {
  const [period, setPeriod] = useState<7 | 14 | 30>(7);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    initAnalyticsCapture();
    loadEvents();
  }, []);

  useEffect(() => {
    loadEvents();
  }, [period, refreshKey]);

  function loadEvents() {
    const allEvents = getEventsByPeriod(period);
    if (allEvents.length === 0) {
      // Gerar dados de demonstração se não houver dados reais
      generateDemoData();
      setEvents(getEventsByPeriod(period));
    } else {
      setEvents(allEvents);
    }
  }

  function handleRefresh() {
    setRefreshKey((k) => k + 1);
  }

  function handleClearData() {
    if (window.confirm("Tem certeza que deseja limpar todos os dados de analytics? Esta ação não pode ser desfeita.")) {
      clearAllData();
      setEvents([]);
    }
  }

  function handleLoadDemo() {
    generateDemoData();
    setRefreshKey((k) => k + 1);
  }

  // Métricas calculadas
  const summary = useMemo(() => getSummaryMetrics(events), [events]);
  const dailyData = useMemo(() => getDailyMetrics(period), [period, refreshKey]);
  const hourlyData = useMemo(() => getHourlyDistribution(events), [events]);
  const topPages = useMemo(() => getTopPages(events), [events]);
  const topSections = useMemo(() => getTopSections(events), [events]);
  const topExamCategories = useMemo(() => getTopExamCategories(events), [events]);
  const leadSources = useMemo(() => getLeadSources(events), [events]);
  const funnel = useMemo(() => getFunnelMetrics(events), [events]);

  // Dados formatados para gráficos
  const dailyChartData = useMemo(
    () =>
      dailyData.map((d) => ({
        ...d,
        date: new Date(d.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      })),
    [dailyData]
  );

  const hourlyChartData = useMemo(
    () => hourlyData.map((h) => ({ ...h, label: `${h.hour}h` })),
    [hourlyData]
  );

  const leadSourcesPie = useMemo(
    () => leadSources.map((s) => ({ name: formatSourceName(s.source), value: s.count })),
    [leadSources]
  );

  const examCategoriesPie = useMemo(
    () => topExamCategories.map((c) => ({ name: formatCategoryName(c.category), value: c.count })),
    [topExamCategories]
  );

  // Calcular variação percentual (simulada com base nos dados)
  const prevPeriodEvents = useMemo(() => getEventsByPeriod(period * 2).filter(
    (e) => new Date(e.timestamp) < new Date(Date.now() - period * 86400000)
  ), [period, refreshKey]);
  const prevSummary = useMemo(() => getSummaryMetrics(prevPeriodEvents), [prevPeriodEvents]);

  function calcChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.surface, color: COLORS.text }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b" style={{ backgroundColor: COLORS.surface, borderColor: COLORS.border }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-sm hover:opacity-70 transition-opacity" style={{ color: COLORS.textMuted }}>
              <ArrowLeft className="w-4 h-4" />
              Voltar ao site
            </Link>
            <div className="h-5 w-px" style={{ backgroundColor: COLORS.border }} />
            <h1 className="text-lg font-bold tracking-wider uppercase" style={{ fontFamily: "'Bebas Neue', sans-serif", color: COLORS.text }}>
              ANALYTICS <span style={{ color: COLORS.brand }}>DASHBOARD</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Period selector */}
            <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: COLORS.border }}>
              {([7, 14, 30] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors"
                  style={{
                    backgroundColor: period === p ? COLORS.brand : "transparent",
                    color: period === p ? "white" : COLORS.textMuted,
                  }}
                >
                  {p}d
                </button>
              ))}
            </div>

            <button onClick={handleRefresh} className="p-2 rounded-lg hover:opacity-70 transition-opacity" style={{ color: COLORS.textMuted }} title="Atualizar dados">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={handleLoadDemo} className="p-2 rounded-lg hover:opacity-70 transition-opacity" style={{ color: COLORS.textMuted }} title="Carregar dados demo">
              <Database className="w-4 h-4" />
            </button>
            <button onClick={handleClearData} className="p-2 rounded-lg hover:opacity-70 transition-opacity" style={{ color: COLORS.textMuted }} title="Limpar dados">
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="h-5 w-px" style={{ backgroundColor: COLORS.border }} />
            <button onClick={logout} className="p-2 rounded-lg hover:opacity-70 transition-opacity" style={{ color: COLORS.textMuted }} title="Sair">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* KPI Cards */}
        <section className="mb-8">
          <SectionTitle icon={Activity}>Indicadores Principais</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <MetricCard
              title="Visualizações"
              value={summary.pageViews}
              icon={Eye}
              color={COLORS.blue}
              change={calcChange(summary.pageViews, prevSummary.pageViews)}
              changeLabel={`vs. período anterior`}
            />
            <MetricCard
              title="Leads Totais"
              value={summary.leads}
              icon={Users}
              color={COLORS.green}
              change={calcChange(summary.leads, prevSummary.leads)}
              changeLabel="Agendamentos + Formulários"
            />
            <MetricCard
              title="WhatsApp"
              value={summary.whatsappClicks}
              icon={MessageCircle}
              color={COLORS.greenDark}
              change={calcChange(summary.whatsappClicks, prevSummary.whatsappClicks)}
            />
            <MetricCard
              title="Telefone"
              value={summary.phoneClicks}
              icon={Phone}
              color={COLORS.amber}
              change={calcChange(summary.phoneClicks, prevSummary.phoneClicks)}
            />
            <MetricCard
              title="Formulários"
              value={summary.formSubmits}
              icon={FileText}
              color={COLORS.purple}
              change={calcChange(summary.formSubmits, prevSummary.formSubmits)}
            />
            <MetricCard
              title="Taxa Conversão"
              value={`${funnel.conversionRate}%`}
              icon={TrendingUp}
              color={COLORS.brand}
              change={calcChange(
                parseFloat(funnel.conversionRate),
                prevSummary.pageViews > 0 ? parseFloat(((prevSummary.leads / prevSummary.pageViews) * 100).toFixed(1)) : 0
              )}
            />
          </div>
        </section>

        {/* Charts Row 1: Daily Trends + Hourly Distribution */}
        <section className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartCard title="Tendência Diária — Visualizações e Leads" className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={dailyChartData}>
                <defs>
                  <linearGradient id="gradPageViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.green} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.green} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis dataKey="date" tick={{ fill: COLORS.textMuted, fontSize: 10 }} axisLine={{ stroke: COLORS.border }} />
                <YAxis tick={{ fill: COLORS.textMuted, fontSize: 10 }} axisLine={{ stroke: COLORS.border }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: COLORS.textMuted }} />
                <Area type="monotone" dataKey="pageViews" name="Visualizações" stroke={COLORS.blue} fill="url(#gradPageViews)" strokeWidth={2} />
                <Area type="monotone" dataKey="leads" name="Leads" stroke={COLORS.green} fill="url(#gradLeads)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Distribuição por Hora do Dia">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={hourlyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis dataKey="label" tick={{ fill: COLORS.textMuted, fontSize: 9 }} axisLine={{ stroke: COLORS.border }} interval={2} />
                <YAxis tick={{ fill: COLORS.textMuted, fontSize: 10 }} axisLine={{ stroke: COLORS.border }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="events" name="Eventos" fill={COLORS.brand} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>

        {/* Charts Row 2: Contact channels + Funnel */}
        <section className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartCard title="Canais de Contato — Diário">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis dataKey="date" tick={{ fill: COLORS.textMuted, fontSize: 9 }} axisLine={{ stroke: COLORS.border }} />
                <YAxis tick={{ fill: COLORS.textMuted, fontSize: 10 }} axisLine={{ stroke: COLORS.border }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, color: COLORS.textMuted }} />
                <Bar dataKey="whatsappClicks" name="WhatsApp" fill={COLORS.green} radius={[2, 2, 0, 0]} />
                <Bar dataKey="phoneClicks" name="Telefone" fill={COLORS.amber} radius={[2, 2, 0, 0]} />
                <Bar dataKey="formSubmits" name="Formulário" fill={COLORS.purple} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Funil de Conversão">
            <div className="mt-2">
              {funnel.steps.map((step, i) => (
                <FunnelStep
                  key={step.name}
                  name={step.name}
                  value={step.value}
                  rate={step.rate}
                  maxValue={funnel.steps[0].value}
                  color={[COLORS.blue, COLORS.cyan, COLORS.amber, COLORS.green][i]}
                />
              ))}
            </div>
            <div className="mt-4 pt-4 border-t flex items-center justify-between" style={{ borderColor: COLORS.border }}>
              <span className="text-xs uppercase tracking-wider" style={{ color: COLORS.textMuted }}>Taxa de Conversão</span>
              <span className="text-2xl font-bold" style={{ fontFamily: "'Bebas Neue', sans-serif", color: COLORS.green }}>
                {funnel.conversionRate}%
              </span>
            </div>
          </ChartCard>

          <ChartCard title="Fontes de Leads">
            {leadSourcesPie.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={leadSourcesPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {leadSourcesPie.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: COLORS.surfaceLighter, border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 12 }}
                    itemStyle={{ color: COLORS.text }}
                  />
                  <Legend wrapperStyle={{ fontSize: 10, color: COLORS.textMuted }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] flex items-center justify-center">
                <p className="text-xs" style={{ color: COLORS.textMuted }}>Sem dados de leads</p>
              </div>
            )}
          </ChartCard>
        </section>

        {/* Charts Row 3: Rankings */}
        <section className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ChartCard title="Páginas Mais Visitadas">
            {topPages.length > 0 ? (
              topPages.slice(0, 5).map((p, i) => (
                <RankingItem
                  key={p.page}
                  rank={i + 1}
                  label={formatPageName(p.page)}
                  value={p.views}
                  maxValue={topPages[0].views}
                  color={COLORS.blue}
                />
              ))
            ) : (
              <p className="text-xs text-center py-8" style={{ color: COLORS.textMuted }}>Sem dados</p>
            )}
          </ChartCard>

          <ChartCard title="Seções Mais Visualizadas">
            {topSections.length > 0 ? (
              topSections.slice(0, 6).map((s, i) => (
                <RankingItem
                  key={s.section}
                  rank={i + 1}
                  label={formatSectionName(s.section)}
                  value={s.views}
                  maxValue={topSections[0].views}
                  color={COLORS.cyan}
                />
              ))
            ) : (
              <p className="text-xs text-center py-8" style={{ color: COLORS.textMuted }}>Sem dados</p>
            )}
          </ChartCard>

          <ChartCard title="Exames Mais Procurados">
            {examCategoriesPie.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={examCategoriesPie}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {examCategoriesPie.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: COLORS.surfaceLighter, border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 12 }}
                    itemStyle={{ color: COLORS.text }}
                  />
                  <Legend wrapperStyle={{ fontSize: 10, color: COLORS.textMuted }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-center py-8" style={{ color: COLORS.textMuted }}>Sem dados</p>
            )}
          </ChartCard>

          <ChartCard title="Detalhamento de Leads">
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: COLORS.border }}>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-3.5 h-3.5" style={{ color: COLORS.green }} />
                  <span className="text-xs" style={{ color: COLORS.text }}>Agendamento Exame</span>
                </div>
                <span className="text-sm font-bold" style={{ fontFamily: "'Bebas Neue', sans-serif", color: COLORS.green }}>{summary.scheduleExam}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: COLORS.border }}>
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5" style={{ color: COLORS.blue }} />
                  <span className="text-xs" style={{ color: COLORS.text }}>Check-Up</span>
                </div>
                <span className="text-sm font-bold" style={{ fontFamily: "'Bebas Neue', sans-serif", color: COLORS.blue }}>{summary.scheduleCheckup}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: COLORS.border }}>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-3.5 h-3.5" style={{ color: COLORS.purple }} />
                  <span className="text-xs" style={{ color: COLORS.text }}>Bioimpedância</span>
                </div>
                <span className="text-sm font-bold" style={{ fontFamily: "'Bebas Neue', sans-serif", color: COLORS.purple }}>{summary.scheduleBioimpedancia}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: COLORS.border }}>
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" style={{ color: COLORS.amber }} />
                  <span className="text-xs" style={{ color: COLORS.text }}>Formulário Contato</span>
                </div>
                <span className="text-sm font-bold" style={{ fontFamily: "'Bebas Neue', sans-serif", color: COLORS.amber }}>{summary.formSubmits}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" style={{ color: COLORS.brand }} />
                  <span className="text-xs" style={{ color: COLORS.text }}>Cartão Total Quality</span>
                </div>
                <span className="text-sm font-bold" style={{ fontFamily: "'Bebas Neue', sans-serif", color: COLORS.brand }}>{summary.cardInterest}</span>
              </div>
            </div>
          </ChartCard>
        </section>

        {/* Event Log */}
        <section className="mb-8">
          <SectionTitle icon={Clock}>Últimos Eventos</SectionTitle>
          <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: COLORS.surfaceLight, borderColor: COLORS.border }}>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ backgroundColor: COLORS.surfaceLighter }}>
                    <th className="text-left px-4 py-3 font-semibold uppercase tracking-wider" style={{ color: COLORS.textMuted }}>Horário</th>
                    <th className="text-left px-4 py-3 font-semibold uppercase tracking-wider" style={{ color: COLORS.textMuted }}>Evento</th>
                    <th className="text-left px-4 py-3 font-semibold uppercase tracking-wider" style={{ color: COLORS.textMuted }}>Categoria</th>
                    <th className="text-left px-4 py-3 font-semibold uppercase tracking-wider" style={{ color: COLORS.textMuted }}>Label</th>
                    <th className="text-left px-4 py-3 font-semibold uppercase tracking-wider" style={{ color: COLORS.textMuted }}>Página</th>
                  </tr>
                </thead>
                <tbody>
                  {events
                    .slice(-20)
                    .reverse()
                    .map((e, i) => (
                      <tr key={i} className="border-t" style={{ borderColor: COLORS.border }}>
                        <td className="px-4 py-2.5" style={{ color: COLORS.textMuted }}>
                          {new Date(e.timestamp).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="px-4 py-2.5">
                          <span
                            className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase"
                            style={{
                              backgroundColor: getEventColor(e.event) + "20",
                              color: getEventColor(e.event),
                            }}
                          >
                            {e.event}
                          </span>
                        </td>
                        <td className="px-4 py-2.5" style={{ color: COLORS.text }}>{e.event_category || "—"}</td>
                        <td className="px-4 py-2.5" style={{ color: COLORS.text }}>{e.event_label || "—"}</td>
                        <td className="px-4 py-2.5" style={{ color: COLORS.textMuted }}>{e.page_path}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            {events.length === 0 && (
              <div className="text-center py-12">
                <Database className="w-8 h-8 mx-auto mb-3" style={{ color: COLORS.textMuted }} />
                <p className="text-sm" style={{ color: COLORS.textMuted }}>Nenhum evento registrado.</p>
                <button onClick={handleLoadDemo} className="mt-3 text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-lg" style={{ backgroundColor: COLORS.brand, color: "white" }}>
                  Carregar Dados Demo
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Footer info */}
        <footer className="text-center py-8 border-t" style={{ borderColor: COLORS.border }}>
          <p className="text-xs" style={{ color: COLORS.textMuted }}>
            Total Quality Analytics Dashboard — Dados armazenados localmente no navegador via localStorage.
            <br />
            Para dados completos de produção, acesse o Google Analytics 4 ou o Meta Business Suite.
          </p>
        </footer>
      </main>
    </div>
  );
}

// ============================================================
// UTILITÁRIOS DE FORMATAÇÃO
// ============================================================

function formatPageName(path: string): string {
  const names: Record<string, string> = {
    "/": "Home",
    "/checkup": "Check-Up",
    "/bioimpedancia": "Bioimpedância",
    "/dashboard": "Dashboard",
  };
  return names[path] || path;
}

function formatSectionName(section: string): string {
  const names: Record<string, string> = {
    inicio: "Início (Hero)",
    diferenciais: "Diferenciais",
    exames: "Exames",
    cartao: "Cartão TQ",
    sobre: "Sobre Nós",
    contato: "Contato",
  };
  return names[section] || section;
}

function formatSourceName(source: string): string {
  const names: Record<string, string> = {
    hero_cta: "Hero CTA",
    exames_section: "Seção Exames",
    footer_cta: "Footer CTA",
    navbar_cta: "Navbar CTA",
    checkup_page: "Página Check-Up",
    bioimpedancia_page: "Página Bioimpedância",
    contact_form: "Formulário",
    cartao_section: "Cartão TQ",
    schedule_exam_whatsapp: "WhatsApp Exame",
    schedule_checkup: "Check-Up",
    schedule_bioimpedancia: "Bioimpedância",
    contact_form_submit: "Formulário",
    card_interest: "Cartão TQ",
  };
  return names[source] || source;
}

function formatCategoryName(category: string): string {
  const names: Record<string, string> = {
    imagem: "Diagnóstico por Imagem",
    cardiologia: "Cardiologia",
    laboratorio: "Laboratório",
  };
  return names[category] || category;
}

function getEventColor(event: string): string {
  const colors: Record<string, string> = {
    page_view: COLORS.blue,
    generate_lead: COLORS.green,
    whatsapp_click: COLORS.greenDark,
    phone_click: COLORS.amber,
    form_start: COLORS.purple,
    scroll: COLORS.gray,
    section_view: COLORS.cyan,
    select_content: COLORS.brand,
    nav_click: COLORS.grayLight,
    external_link_click: COLORS.rose,
    map_interaction: COLORS.amberDark,
    time_on_page: COLORS.purpleDark,
    results_online_click: COLORS.blueDark,
  };
  return colors[event] || COLORS.gray;
}


// ============================================================
// EXPORT COM PROTEÇÃO DE LOGIN
// ============================================================
function DashboardPage() {
  return (
    <DashboardLogin>
      <DashboardContent />
    </DashboardLogin>
  );
}

// O TooltipProvider fica aqui (e nao no App) para que o Radix Tooltip e o
// floating-ui (~100KB) carreguem apenas nesta rota, que e lazy — as paginas
// publicas nao usam tooltip e nao devem pagar por ele no chunk inicial.
export default function Dashboard() {
  return (
    <TooltipProvider>
      <DashboardPage />
    </TooltipProvider>
  );
}

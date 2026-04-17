import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useLocation, useParams } from "wouter";
import { useState, useMemo, useCallback } from "react";
import { format, subDays, startOfDay, endOfDay, differenceInDays, isAfter, isBefore, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import {
  BarChart3, Users, MousePointerClick, Eye, Clock, TrendingUp,
  ArrowUpRight, ArrowDownRight, Minus, Filter, CalendarIcon,
  LayoutDashboard, UserCheck, Megaphone, Activity, Target,
  ChevronLeft, LogOut, MessageSquare, Phone, Mail, MapPin,
  ExternalLink, Video, ScrollText, CalendarDays, X, Tag, Plus,
  Pencil, Trash2, Check, Tags, Link, Copy, Clipboard, Info,
  Globe, BookOpen, EyeOff, Loader2, Lock, Download, FileText, FileSpreadsheet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
  AreaChart, Area, Legend, Treemap
} from "recharts";

const COLORS = ["#9B212B", "#D4A574", "#2D5A3D", "#1E3A5F", "#8B5CF6", "#F59E0B", "#EF4444", "#10B981", "#6366F1", "#EC4899"];
const CHANNEL_COLORS: Record<string, string> = {
  "Facebook Ads": "#1877F2",
  "Facebook Orgânico": "#4267B2",
  "Instagram Ads": "#E4405F",
  "Instagram Orgânico": "#C13584",
  "Google Ads": "#4285F4",
  "Google Orgânico": "#34A853",
  "TikTok Ads": "#000000",
  "TikTok Orgânico": "#25F4EE",
  "YouTube Ads": "#FF0000",
  "YouTube Orgânico": "#FF4444",
  "Email Marketing": "#F59E0B",
  "WhatsApp": "#25D366",
  "Acesso Direto": "#6B7280",
  "Referência": "#8B5CF6",
};

function getChannelColor(channel: string | null): string {
  return CHANNEL_COLORS[channel || ""] || "#9B212B";
}

function formatDuration(ms: number): string {
  if (!ms || ms === 0) return "0s";
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

// ===================== Escape Helpers =====================
function escapeXml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ===================== Date Filter Types =====================
type DateFilterMode = "preset" | "custom";
interface DateFilter {
  mode: DateFilterMode;
  days?: number;
  dateFrom?: string;
  dateTo?: string;
  label: string;
}

function dateFilterToQuery(filter: DateFilter): { days?: number; dateFrom?: string; dateTo?: string } {
  if (filter.mode === "preset" && filter.days) {
    return { days: filter.days };
  }
  return { dateFrom: filter.dateFrom, dateTo: filter.dateTo };
}

const PRESET_OPTIONS = [
  { days: 7, label: "Últimos 7 dias" },
  { days: 14, label: "Últimos 14 dias" },
  { days: 30, label: "Últimos 30 dias" },
  { days: 60, label: "Últimos 60 dias" },
  { days: 90, label: "Últimos 90 dias" },
  { days: 180, label: "Últimos 180 dias" },
  { days: 365, label: "Último ano" },
];

// ===================== Date Range Picker Component =====================
function DateRangePicker({ filter, onFilterChange }: { filter: DateFilter; onFilterChange: (f: DateFilter) => void }) {
  const [open, setOpen] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange | undefined>(
    filter.dateFrom && filter.dateTo
      ? { from: new Date(filter.dateFrom), to: new Date(filter.dateTo) }
      : undefined
  );

  const handlePresetSelect = (days: number) => {
    const preset = PRESET_OPTIONS.find(p => p.days === days);
    onFilterChange({
      mode: "preset",
      days,
      label: preset?.label || `Últimos ${days} dias`,
    });
    setTempRange(undefined);
    setOpen(false);
  };

  const handleRangeSelect = (range: DateRange | undefined) => {
    setTempRange(range);
    if (range?.from && range?.to) {
      const daysDiff = differenceInDays(range.to, range.from);
      onFilterChange({
        mode: "custom",
        dateFrom: format(range.from, "yyyy-MM-dd"),
        dateTo: format(range.to, "yyyy-MM-dd"),
        label: `${format(range.from, "dd/MM/yy")} — ${format(range.to, "dd/MM/yy")}`,
      });
    }
  };

  const handleQuickRange = (label: string, from: Date, to: Date) => {
    const range = { from, to };
    setTempRange(range);
    onFilterChange({
      mode: "custom",
      dateFrom: format(from, "yyyy-MM-dd"),
      dateTo: format(to, "yyyy-MM-dd"),
      label,
    });
    setOpen(false);
  };

  const today = new Date();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-2 min-w-[180px] justify-start text-left font-normal">
          <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="truncate text-sm">{filter.label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end" sideOffset={8}>
        <div className="flex flex-col sm:flex-row">
          {/* Presets sidebar */}
          <div className="border-b sm:border-b-0 sm:border-r p-3 space-y-1 min-w-[160px]">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Período Rápido</p>
            {PRESET_OPTIONS.map(opt => (
              <button
                key={opt.days}
                onClick={() => handlePresetSelect(opt.days)}
                className={`w-full text-left text-sm px-2 py-1.5 rounded-md transition-colors hover:bg-accent ${
                  filter.mode === "preset" && filter.days === opt.days ? "bg-accent font-medium text-accent-foreground" : "text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
            <Separator className="my-2" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Atalhos</p>
            <button
              onClick={() => handleQuickRange("Hoje", startOfDay(today), endOfDay(today))}
              className="w-full text-left text-sm px-2 py-1.5 rounded-md hover:bg-accent text-foreground"
            >
              Hoje
            </button>
            <button
              onClick={() => handleQuickRange("Ontem", startOfDay(subDays(today, 1)), endOfDay(subDays(today, 1)))}
              className="w-full text-left text-sm px-2 py-1.5 rounded-md hover:bg-accent text-foreground"
            >
              Ontem
            </button>
            <button
              onClick={() => handleQuickRange("Este mês", startOfMonth(today), endOfDay(today))}
              className="w-full text-left text-sm px-2 py-1.5 rounded-md hover:bg-accent text-foreground"
            >
              Este mês
            </button>
            <button
              onClick={() => handleQuickRange("Mês passado", startOfMonth(subMonths(today, 1)), endOfMonth(subMonths(today, 1)))}
              className="w-full text-left text-sm px-2 py-1.5 rounded-md hover:bg-accent text-foreground"
            >
              Mês passado
            </button>
          </div>

          {/* Calendar */}
          <div className="p-3">
            <Calendar
              mode="range"
              selected={tempRange}
              onSelect={handleRangeSelect}
              numberOfMonths={2}
              locale={ptBR}
              disabled={{ after: today }}
              defaultMonth={subMonths(today, 1)}
              captionLayout="dropdown"
            />
            {tempRange?.from && tempRange?.to && (
              <div className="flex items-center justify-between mt-2 pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  {format(tempRange.from, "dd MMM yyyy", { locale: ptBR })} — {format(tempRange.to, "dd MMM yyyy", { locale: ptBR })}
                  <span className="ml-1">({differenceInDays(tempRange.to, tempRange.from) + 1} dias)</span>
                </p>
                <Button size="sm" variant="default" className="h-7 text-xs bg-[#9B212B] hover:bg-[#7a1a22]" onClick={() => setOpen(false)}>
                  Aplicar
                </Button>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ===================== KPI Card =====================
function KPICard({ title, value, subtitle, icon: Icon, trend, color = "text-primary" }: {
  title: string; value: string | number; subtitle?: string;
  icon: any; trend?: "up" | "down" | "neutral"; color?: string;
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-3xl font-bold tracking-tight ${color}`}>{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className={`rounded-xl p-3 bg-muted`}>
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
        {trend && (
          <div className="mt-3 flex items-center gap-1 text-xs">
            {trend === "up" && <ArrowUpRight className="h-3 w-3 text-green-600" />}
            {trend === "down" && <ArrowDownRight className="h-3 w-3 text-red-600" />}
            {trend === "neutral" && <Minus className="h-3 w-3 text-gray-400" />}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ===================== Lead Status Badge =====================
function LeadStatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    new: "bg-blue-100 text-blue-800",
    contacted: "bg-yellow-100 text-yellow-800",
    qualified: "bg-purple-100 text-purple-800",
    converted: "bg-green-100 text-green-800",
    lost: "bg-red-100 text-red-800",
  };
  const labels: Record<string, string> = {
    new: "Novo",
    contacted: "Contatado",
    qualified: "Qualificado",
    converted: "Convertido",
    lost: "Perdido",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[status] || "bg-gray-100 text-gray-800"}`}>
      {labels[status] || status}
    </span>
  );
}

// ===================== DASHBOARD TAB =====================
function DashboardTab({ filter }: { filter: DateFilter }) {
  const queryInput = useMemo(() => dateFilterToQuery(filter), [filter]);
  const { data: kpis, isLoading } = trpc.dashboard.kpis.useQuery(queryInput);
  const { data: leadStats } = trpc.lead.stats.useQuery(queryInput);

  if (isLoading) return <DashboardSkeleton />;
  if (!kpis) return <p className="text-muted-foreground p-8">Nenhum dado disponível.</p>;

  const channelData = (kpis.leadsByChannel || []).map((c: any) => ({
    name: c.channel || "Não identificado",
    value: c.total,
    fill: getChannelColor(c.channel),
  }));

  const dailyData = (kpis.leadsByDay || []).map((d: any) => ({
    date: new Date(d.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
    leads: d.total,
  }));

  const funnelData = (kpis.leadsStatus || []).map((s: any) => ({
    name: s.leadStatus === "new" ? "Novos" : s.leadStatus === "contacted" ? "Contatados" : s.leadStatus === "qualified" ? "Qualificados" : s.leadStatus === "converted" ? "Convertidos" : "Perdidos",
    value: s.total,
  }));

  const topPagesData = (kpis.topPages || []).map((p: any) => ({
    page: p.page === "/" ? "Home" : p.page,
    views: p.views,
    avgDuration: formatDuration(p.avgDuration || 0),
    avgScroll: `${Math.round(p.avgScroll || 0)}%`,
  }));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total de Leads" value={formatNumber(kpis.totalLeads)} subtitle={filter.label} icon={Users} color="text-[#9B212B]" />
        <KPICard title="Sessões" value={formatNumber(kpis.totalSessions)} subtitle="Visitantes únicos" icon={Eye} />
        <KPICard title="Taxa de Conversão" value={`${kpis.conversionRate}%`} subtitle="Sessões → Leads" icon={Target} color="text-green-600" />
        <KPICard title="Taxa de Rejeição" value={`${kpis.bounceRate}%`} subtitle="Sessões com 1 página" icon={TrendingUp} color={kpis.bounceRate > 60 ? "text-red-600" : "text-green-600"} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Tempo Médio na Sessão" value={formatDuration(kpis.avgSessionDuration)} icon={Clock} />
        <KPICard title="Engajamento 25%" value={formatNumber(kpis.engagementQuartiles?.q25 || 0)} subtitle="Visitantes que ficaram 25% do tempo" icon={Activity} />
        <KPICard title="Engajamento 75%" value={formatNumber(kpis.engagementQuartiles?.q75 || 0)} subtitle="Visitantes altamente engajados" icon={Activity} color="text-green-600" />
        <KPICard title="Engajamento 100%" value={formatNumber(kpis.engagementQuartiles?.q100 || 0)} subtitle="Visitantes que viram tudo" icon={Activity} color="text-[#9B212B]" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads por Dia */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Leads por Dia</CardTitle>
            <CardDescription>Evolução diária de captação de leads</CardDescription>
          </CardHeader>
          <CardContent>
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" fontSize={11} />
                  <YAxis fontSize={11} />
                  <ReTooltip />
                  <Area type="monotone" dataKey="leads" stroke="#9B212B" fill="#9B212B" fillOpacity={0.15} strokeWidth={2} name="Leads" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">Nenhum dado no período</div>
            )}
          </CardContent>
        </Card>

        {/* Leads por Canal */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Leads por Canal</CardTitle>
            <CardDescription>Distribuição de leads por fonte de tráfego</CardDescription>
          </CardHeader>
          <CardContent>
            {channelData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={channelData} cx="50%" cy="50%" outerRadius={100} dataKey="value" nameKey="name" label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={true} fontSize={11}>
                    {channelData.map((entry: any, i: number) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ReTooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">Nenhum dado no período</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Funil e Top Páginas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funil de Leads */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Funil de Leads</CardTitle>
            <CardDescription>Status dos leads no pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            {funnelData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={funnelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" fontSize={11} />
                  <YAxis dataKey="name" type="category" width={100} fontSize={12} />
                  <ReTooltip />
                  <Bar dataKey="value" name="Leads" radius={[0, 4, 4, 0]}>
                    {funnelData.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">Nenhum dado</div>
            )}
          </CardContent>
        </Card>

        {/* Top Páginas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Páginas Mais Visitadas</CardTitle>
            <CardDescription>Ranking de páginas por visualizações</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Página</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="text-right">Tempo Médio</TableHead>
                    <TableHead className="text-right">Scroll</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topPagesData.length > 0 ? topPagesData.map((p: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium text-sm max-w-[200px] truncate">{p.page}</TableCell>
                      <TableCell className="text-right">{p.views}</TableCell>
                      <TableCell className="text-right">{p.avgDuration}</TableCell>
                      <TableCell className="text-right">{p.avgScroll}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Nenhum dado</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ===================== LEADS TAB =====================
function LeadsTab({ filter }: { filter: DateFilter }) {
  const queryInput = useMemo(() => dateFilterToQuery(filter), [filter]);
  const { data: leadsData, isLoading } = trpc.lead.list.useQuery({ limit: 100, offset: 0, ...queryInput });
  const updateStatus = trpc.lead.updateStatus.useMutation();
  const utils = trpc.useUtils();
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<{ id: number; name: string } | null>(null);

  if (isLoading) return <DashboardSkeleton />;

  const items = leadsData?.items || [];

  const handleStatusChange = async (id: number, status: "new" | "contacted" | "qualified" | "converted" | "lost") => {
    await updateStatus.mutateAsync({ id, status });
    utils.lead.list.invalidate();
    utils.lead.stats.invalidate();
    utils.dashboard.kpis.invalidate();
  };

  const openAssignTags = (lead: any) => {
    setSelectedLead({ id: lead.id, name: lead.name || lead.phone || lead.email || "Lead" });
    setAssignDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" /> Leads Recentes
          </CardTitle>
          <CardDescription>{leadsData?.total || 0} leads no período ({filter.label})</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead>Campanha</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length > 0 ? items.map((lead: any) => (
                  <TableRow key={lead.id}>
                    <TableCell className="text-xs whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </TableCell>
                    <TableCell className="font-medium">{lead.name || "—"}</TableCell>
                    <TableCell>
                      {lead.phone ? (
                        <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-blue-600 hover:underline text-sm">
                          <Phone className="h-3 w-3" />{lead.phone}
                        </a>
                      ) : "—"}
                    </TableCell>
                    <TableCell>
                      {lead.email ? (
                        <a href={`mailto:${lead.email}`} className="flex items-center gap-1 text-blue-600 hover:underline text-sm">
                          <Mail className="h-3 w-3" />{lead.email}
                        </a>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {lead.city ? (
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{lead.city}{lead.state ? `/${lead.state}` : ""}</span>
                      ) : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" style={{ borderColor: getChannelColor(lead.channel), color: getChannelColor(lead.channel) }}>
                        {lead.channel || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs max-w-[150px] truncate">{lead.utmCampaign || "—"}</TableCell>
                    <TableCell className="text-xs">{lead.source}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <LeadTagsDisplay leadId={lead.id} />
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => openAssignTags(lead)}>
                          <Tag className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell><LeadStatusBadge status={lead.leadStatus} /></TableCell>
                    <TableCell>
                      <Select onValueChange={(v) => handleStatusChange(lead.id, v as any)} defaultValue={lead.leadStatus}>
                        <SelectTrigger className="h-7 w-[120px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Novo</SelectItem>
                          <SelectItem value="contacted">Contatado</SelectItem>
                          <SelectItem value="qualified">Qualificado</SelectItem>
                          <SelectItem value="converted">Convertido</SelectItem>
                          <SelectItem value="lost">Perdido</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-12 text-muted-foreground">
                      Nenhum lead registrado no período. Os leads aparecerão aqui conforme os visitantes interagirem com o site.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Assign Tags Dialog */}
      {selectedLead && (
        <AssignTagsDialog
          open={assignDialogOpen}
          onOpenChange={setAssignDialogOpen}
          leadId={selectedLead.id}
          leadName={selectedLead.name}
        />
      )}
    </div>
  );
}

// ===================== CAMPAIGNS TAB =====================
function CampaignsTab({ filter }: { filter: DateFilter }) {
  const queryInput = useMemo(() => dateFilterToQuery(filter), [filter]);
  const { data: leadStats, isLoading } = trpc.lead.stats.useQuery(queryInput);
  const { data: sessionStats } = trpc.session.stats.useQuery(queryInput);

  if (isLoading) return <DashboardSkeleton />;

  const campaignData = (leadStats?.byCampaign || []).map((c: any) => ({
    campaign: c.utmCampaign || "Sem campanha",
    source: c.utmSource || "—",
    channel: c.channel || "—",
    leads: c.total,
  }));

  const channelComparison = (leadStats?.byChannel || []).map((c: any) => ({
    name: c.channel || "Não identificado",
    leads: c.total,
    fill: getChannelColor(c.channel),
  }));

  const sessionsByChannel = (sessionStats?.byChannel || []).map((c: any) => ({
    name: c.channel || "Não identificado",
    sessions: c.total,
    fill: getChannelColor(c.channel),
  }));

  const mergedChannels = channelComparison.map((ch: any) => {
    const sess = sessionsByChannel.find((s: any) => s.name === ch.name);
    return {
      name: ch.name,
      leads: ch.leads,
      sessions: sess?.sessions || 0,
      convRate: sess?.sessions ? `${((ch.leads / sess.sessions) * 100).toFixed(1)}%` : "—",
    };
  });

  return (
    <div className="space-y-6">
      {/* Channel Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Megaphone className="h-5 w-5" /> Performance por Canal
          </CardTitle>
          <CardDescription>Comparação de sessões, leads e taxa de conversão por canal ({filter.label})</CardDescription>
        </CardHeader>
        <CardContent>
          {mergedChannels.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={mergedChannels}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" fontSize={10} angle={-20} textAnchor="end" height={80} />
                  <YAxis fontSize={11} />
                  <ReTooltip />
                  <Legend />
                  <Bar dataKey="sessions" name="Sessões" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="leads" name="Leads" fill="#9B212B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <Table className="mt-4">
                <TableHeader>
                  <TableRow>
                    <TableHead>Canal</TableHead>
                    <TableHead className="text-right">Sessões</TableHead>
                    <TableHead className="text-right">Leads</TableHead>
                    <TableHead className="text-right">Taxa de Conversão</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mergedChannels.map((ch: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Badge variant="outline" style={{ borderColor: getChannelColor(ch.name), color: getChannelColor(ch.name) }}>
                          {ch.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{ch.sessions}</TableCell>
                      <TableCell className="text-right font-medium">{ch.leads}</TableCell>
                      <TableCell className="text-right font-bold">{ch.convRate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              Nenhum dado de campanha no período. Configure UTM params nas suas campanhas para rastrear.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Campaign Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detalhamento por Campanha</CardTitle>
          <CardDescription>Leads gerados por cada campanha individual</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campanha</TableHead>
                  <TableHead>Fonte</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead className="text-right">Leads</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaignData.length > 0 ? campaignData.map((c: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium max-w-[250px] truncate">{c.campaign}</TableCell>
                    <TableCell>{c.source}</TableCell>
                    <TableCell>
                      <Badge variant="outline" style={{ borderColor: getChannelColor(c.channel), color: getChannelColor(c.channel) }}>
                        {c.channel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold">{c.leads}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Nenhuma campanha rastreada. Use UTM params nos links das suas campanhas.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// ===================== ENGAGEMENT TAB =====================
function EngagementTab({ filter }: { filter: DateFilter }) {
  const queryInput = useMemo(() => dateFilterToQuery(filter), [filter]);
  const { data: engagement, isLoading } = trpc.analytics.engagement.useQuery(queryInput);
  const { data: sessionStats } = trpc.session.stats.useQuery(queryInput);

  if (isLoading) return <DashboardSkeleton />;

  const quartiles = engagement?.quartiles || { total: 0, q25: 0, q50: 0, q75: 0, q100: 0 };
  const quartileData = [
    { name: "25%", value: quartiles.q25, fill: "#94a3b8" },
    { name: "50%", value: quartiles.q50, fill: "#D4A574" },
    { name: "75%", value: quartiles.q75, fill: "#2D5A3D" },
    { name: "100%", value: quartiles.q100, fill: "#9B212B" },
  ];

  const videoStats = (engagement?.videoStats || []).map((v: any) => ({
    videoId: v.videoId,
    title: v.videoTitle || v.videoId,
    views: v.views,
    avgWatchTime: formatDuration(v.avgWatchTime || 0),
    q25: v.q25 || 0,
    q50: v.q50 || 0,
    q75: v.q75 || 0,
    q100: v.q100 || 0,
  }));

  const sessionsByDay = (sessionStats?.byDay || []).map((d: any) => ({
    date: new Date(d.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
    sessions: d.total,
  }));

  return (
    <div className="space-y-6">
      {/* Engagement Quartiles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" /> Quartis de Tempo de Visualização
            </CardTitle>
            <CardDescription>
              Percentual de visitantes que permaneceram na página por cada quartil de tempo ({filter.label}).
              Essencial para audiências de remarketing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={quartileData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={11} />
                <ReTooltip formatter={(value: number) => [value, "Visitantes"]} />
                <Bar dataKey="value" name="Visitantes" radius={[4, 4, 0, 0]}>
                  {quartileData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
              {quartileData.map((q, i) => (
                <div key={i} className="p-2 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground">Quartil {q.name}</p>
                  <p className="text-lg font-bold" style={{ color: q.fill }}>{q.value}</p>
                  <p className="text-xs text-muted-foreground">
                    {quartiles.total > 0 ? `${((q.value / quartiles.total) * 100).toFixed(1)}%` : "0%"}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sessions by Day */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="h-5 w-5" /> Sessões por Dia
            </CardTitle>
            <CardDescription>Volume de visitantes ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
            {sessionsByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={sessionsByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" fontSize={11} />
                  <YAxis fontSize={11} />
                  <ReTooltip />
                  <Line type="monotone" dataKey="sessions" stroke="#1E3A5F" strokeWidth={2} dot={{ r: 3 }} name="Sessões" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">Nenhum dado no período</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Pages with Engagement */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ScrollText className="h-5 w-5" /> Engajamento por Página
          </CardTitle>
          <CardDescription>Tempo médio, profundidade de scroll e visualizações por página</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Página</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">Tempo Médio</TableHead>
                  <TableHead className="text-right">Scroll Médio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(engagement?.topPages || []).length > 0 ? (engagement?.topPages || []).map((p: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{p.page === "/" ? "Home" : p.page}</TableCell>
                    <TableCell className="text-right">{p.views}</TableCell>
                    <TableCell className="text-right">{formatDuration(p.avgDuration || 0)}</TableCell>
                    <TableCell className="text-right">{Math.round(p.avgScroll || 0)}%</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Nenhum dado de engajamento</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Video Stats */}
      {videoStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Video className="h-5 w-5" /> Visualizações de Vídeo
            </CardTitle>
            <CardDescription>Quartis de visualização de vídeo para remarketing</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vídeo</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">Tempo Médio</TableHead>
                  <TableHead className="text-right">25%</TableHead>
                  <TableHead className="text-right">50%</TableHead>
                  <TableHead className="text-right">75%</TableHead>
                  <TableHead className="text-right">100%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videoStats.map((v: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium max-w-[200px] truncate">{v.title}</TableCell>
                    <TableCell className="text-right">{v.views}</TableCell>
                    <TableCell className="text-right">{v.avgWatchTime}</TableCell>
                    <TableCell className="text-right">{v.q25}</TableCell>
                    <TableCell className="text-right">{v.q50}</TableCell>
                    <TableCell className="text-right">{v.q75}</TableCell>
                    <TableCell className="text-right">{v.q100}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ===================== CONTACTS TAB =====================
function ContactsTab({ filter }: { filter: DateFilter }) {
  const queryInput = useMemo(() => dateFilterToQuery(filter), [filter]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const listInput = useMemo(() => ({
    limit: 500,
    offset: 0,
    ...(queryInput.dateFrom ? { dateFrom: queryInput.dateFrom } : {}),
    ...(queryInput.dateTo ? { dateTo: queryInput.dateTo } : {}),
    ...(statusFilter !== "all" ? { status: statusFilter as any } : {}),
  }), [queryInput, statusFilter]);

  const { data: contactsData, isLoading } = trpc.contact.list.useQuery(listInput);
  const updateStatus = trpc.contact.updateStatus.useMutation();
  const utils = trpc.useUtils();

  const items = contactsData?.items || [];

  const handleStatusChange = async (id: number, status: "new" | "read" | "replied" | "archived") => {
    await updateStatus.mutateAsync({ id, status });
    utils.contact.list.invalidate();
  };

  // ===== EXPORT FUNCTIONS =====
  const exportCSV = useCallback(() => {
    if (!items.length) return;
    const headers = ["Data", "Nome", "Email", "Telefone", "Assunto", "Mensagem", "Status"];
    const statusLabels: Record<string, string> = { new: "Novo", read: "Lido", replied: "Respondido", archived: "Arquivado" };
    const rows = items.map((c: any) => [
      new Date(c.createdAt).toLocaleDateString("pt-BR"),
      c.name,
      c.email,
      c.phone || "",
      c.subject || "",
      `"${(c.message || "").replace(/"/g, '""')}"`,
      statusLabels[c.status] || c.status,
    ]);
    const bom = "\uFEFF";
    const csv = bom + [headers.join(";"), ...rows.map(r => r.join(";"))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contatos_totalquality_${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [items]);

  const exportExcel = useCallback(() => {
    if (!items.length) return;
    const statusLabels: Record<string, string> = { new: "Novo", read: "Lido", replied: "Respondido", archived: "Arquivado" };
    // Generate XML-based Excel (compatible with Excel without external libs)
    let xml = '<?xml version="1.0" encoding="UTF-8"?>';
    xml += '<?mso-application progid="Excel.Sheet"?>';
    xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">';
    xml += '<Styles><Style ss:ID="header"><Font ss:Bold="1" ss:Size="12"/><Interior ss:Color="#9B212B" ss:Pattern="Solid"/><Font ss:Color="#FFFFFF" ss:Bold="1"/></Style>';
    xml += '<Style ss:ID="date"><NumberFormat ss:Format="dd/mm/yyyy"/></Style></Styles>';
    xml += '<Worksheet ss:Name="Contatos"><Table>';
    xml += '<Row ss:StyleID="header"><Cell><Data ss:Type="String">Data</Data></Cell><Cell><Data ss:Type="String">Nome</Data></Cell><Cell><Data ss:Type="String">Email</Data></Cell><Cell><Data ss:Type="String">Telefone</Data></Cell><Cell><Data ss:Type="String">Assunto</Data></Cell><Cell><Data ss:Type="String">Mensagem</Data></Cell><Cell><Data ss:Type="String">Status</Data></Cell></Row>';
    items.forEach((c: any) => {
      xml += '<Row>';
      xml += `<Cell ss:StyleID="date"><Data ss:Type="String">${new Date(c.createdAt).toLocaleDateString("pt-BR")}</Data></Cell>`;
      xml += `<Cell><Data ss:Type="String">${escapeXml(c.name)}</Data></Cell>`;
      xml += `<Cell><Data ss:Type="String">${escapeXml(c.email)}</Data></Cell>`;
      xml += `<Cell><Data ss:Type="String">${escapeXml(c.phone || "")}</Data></Cell>`;
      xml += `<Cell><Data ss:Type="String">${escapeXml(c.subject || "")}</Data></Cell>`;
      xml += `<Cell><Data ss:Type="String">${escapeXml(c.message || "")}</Data></Cell>`;
      xml += `<Cell><Data ss:Type="String">${statusLabels[c.status] || c.status}</Data></Cell>`;
      xml += '</Row>';
    });
    xml += '</Table></Worksheet></Workbook>';
    const blob = new Blob([xml], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `contatos_totalquality_${format(new Date(), "yyyy-MM-dd")}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  }, [items]);

  const exportPDF = useCallback(() => {
    if (!items.length) return;
    const statusLabels: Record<string, string> = { new: "Novo", read: "Lido", replied: "Respondido", archived: "Arquivado" };
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Contatos - Total Quality</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; font-size: 11px; }
      h1 { color: #9B212B; font-size: 18px; margin-bottom: 5px; }
      h2 { color: #666; font-size: 12px; font-weight: normal; margin-bottom: 15px; }
      table { width: 100%; border-collapse: collapse; }
      th { background: #9B212B; color: white; padding: 8px 6px; text-align: left; font-size: 10px; }
      td { padding: 6px; border-bottom: 1px solid #eee; font-size: 10px; }
      tr:nth-child(even) { background: #f9f9f9; }
      .footer { margin-top: 20px; text-align: center; color: #999; font-size: 9px; }
      @media print { body { padding: 0; } }
    </style></head><body>
    <h1>Total Quality - Contatos</h1>
    <h2>Exportado em ${new Date().toLocaleDateString("pt-BR")} | ${items.length} contatos</h2>
    <table><thead><tr><th>Data</th><th>Nome</th><th>Email</th><th>Telefone</th><th>Assunto</th><th>Mensagem</th><th>Status</th></tr></thead><tbody>
    ${items.map((c: any) => `<tr>
      <td>${new Date(c.createdAt).toLocaleDateString("pt-BR")}</td>
      <td>${escapeHtml(c.name)}</td>
      <td>${escapeHtml(c.email)}</td>
      <td>${escapeHtml(c.phone || "—")}</td>
      <td>${escapeHtml(c.subject || "—")}</td>
      <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escapeHtml(c.message)}</td>
      <td>${statusLabels[c.status] || c.status}</td>
    </tr>`).join("")}
    </tbody></table>
    <div class="footer">Total Quality Medicina Diagnóstica - Relatório de Contatos</div>
    <script>setTimeout(() => { window.print(); }, 500);</script>
    </body></html>`;
    printWindow.document.write(html);
    printWindow.document.close();
  }, [items]);

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-4">
      {/* Header com filtros e exportação */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5" /> Mensagens de Contato
              </CardTitle>
              <CardDescription>{contactsData?.total || 0} mensagens recebidas no período</CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Filtro por status */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 w-[140px] text-xs">
                  <Filter className="h-3 w-3 mr-1" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="new">Novo</SelectItem>
                  <SelectItem value="read">Lido</SelectItem>
                  <SelectItem value="replied">Respondido</SelectItem>
                  <SelectItem value="archived">Arquivado</SelectItem>
                </SelectContent>
              </Select>
              {/* Botões de exportação */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 text-xs gap-1" disabled={!items.length}>
                    <Download className="h-3.5 w-3.5" /> Exportar
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2" align="end">
                  <div className="space-y-1">
                    <button onClick={exportExcel} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors">
                      <FileSpreadsheet className="h-4 w-4 text-green-600" /> Excel (.xls)
                    </button>
                    <button onClick={exportCSV} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors">
                      <FileText className="h-4 w-4 text-blue-600" /> CSV (.csv)
                    </button>
                    <button onClick={exportPDF} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors">
                      <FileText className="h-4 w-4 text-red-600" /> PDF (Imprimir)
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Assunto</TableHead>
                  <TableHead>Mensagem</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length > 0 ? items.map((c: any) => (
                  <TableRow key={c.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}>
                    <TableCell className="text-xs whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                      <div className="text-[10px] text-muted-foreground">
                        {new Date(c.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>
                      <a href={`mailto:${c.email}`} className="text-blue-600 hover:underline text-sm" onClick={(e) => e.stopPropagation()}>{c.email}</a>
                    </TableCell>
                    <TableCell>
                      {c.phone ? (
                        <a href={`tel:${c.phone}`} className="text-sm hover:underline" onClick={(e) => e.stopPropagation()}>{c.phone}</a>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-sm">{c.subject || "—"}</TableCell>
                    <TableCell className="text-xs max-w-[200px]">
                      {expandedId === c.id ? (
                        <div className="whitespace-pre-wrap break-words">{c.message}</div>
                      ) : (
                        <div className="truncate">{c.message}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.status === "new" ? "default" : "secondary"}>
                        {c.status === "new" ? "Novo" : c.status === "read" ? "Lido" : c.status === "replied" ? "Respondido" : "Arquivado"}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Select onValueChange={(v) => handleStatusChange(c.id, v as any)} defaultValue={c.status}>
                        <SelectTrigger className="h-7 w-[120px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Novo</SelectItem>
                          <SelectItem value="read">Lido</SelectItem>
                          <SelectItem value="replied">Respondido</SelectItem>
                          <SelectItem value="archived">Arquivado</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      Nenhuma mensagem de contato recebida no período selecionado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// ===================== TAG BADGE =====================
function TagBadge({ name, color, onRemove }: { name: string; color: string; onRemove?: () => void }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: color }}
    >
      {name}
      {onRemove && (
        <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="ml-0.5 hover:opacity-70">
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}

// ===================== TAG COLORS =====================
const TAG_COLORS = [
  "#9B212B", "#1877F2", "#E4405F", "#34A853", "#F59E0B",
  "#8B5CF6", "#EF4444", "#10B981", "#6366F1", "#EC4899",
  "#0EA5E9", "#D97706", "#059669", "#7C3AED", "#DC2626",
];

const TAG_CATEGORIES = [
  "Interesse", "Exame", "Perfil", "Campanha", "Prioridade", "Segmento", "Outro"
];

// ===================== CREATE/EDIT TAG DIALOG =====================
function TagDialog({ open, onOpenChange, editTag, onSave }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editTag?: { id: number; name: string; color: string; category: string | null; description: string | null } | null;
  onSave: (data: { name: string; color: string; category?: string; description?: string }) => void;
}) {
  const [name, setName] = useState(editTag?.name || "");
  const [color, setColor] = useState(editTag?.color || "#9B212B");
  const [category, setCategory] = useState(editTag?.category || "");
  const [description, setDescription] = useState(editTag?.description || "");

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      color,
      category: category || undefined,
      description: description || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editTag ? "Editar Tag" : "Nova Tag"}</DialogTitle>
          <DialogDescription>
            {editTag ? "Atualize as informações da tag." : "Crie uma nova tag para segmentar seus leads."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nome</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Check-up, Cardiologia, VIP" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Cor</label>
            <div className="flex flex-wrap gap-2">
              {TAG_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full border-2 transition-all ${color === c ? "border-foreground scale-110 ring-2 ring-offset-2 ring-foreground" : "border-transparent hover:scale-105"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Categoria</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger>
              <SelectContent>
                {TAG_CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição (opcional)</label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Breve descrição da tag" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!name.trim()} className="bg-[#9B212B] hover:bg-[#7a1a22]">
            {editTag ? "Salvar" : "Criar Tag"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ===================== ASSIGN TAGS DIALOG =====================
function AssignTagsDialog({ open, onOpenChange, leadId, leadName }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  leadId: number;
  leadName: string;
}) {
  const { data: allTags } = trpc.tag.list.useQuery();
  const { data: leadTagsList } = trpc.leadTag.getForLead.useQuery({ leadId });
  const bulkSet = trpc.leadTag.bulkSet.useMutation();
  const utils = trpc.useUtils();

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [initialized, setInitialized] = useState(false);

  // Initialize selected tags from lead's current tags
  if (leadTagsList && !initialized) {
    setSelectedIds(new Set(leadTagsList.map((t: any) => t.id)));
    setInitialized(true);
  }

  const toggleTag = (tagId: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(tagId)) next.delete(tagId);
      else next.add(tagId);
      return next;
    });
  };

  const handleSave = async () => {
    await bulkSet.mutateAsync({ leadId, tagIds: Array.from(selectedIds) });
    utils.leadTag.getForLead.invalidate({ leadId });
    utils.tag.stats.invalidate();
    onOpenChange(false);
    setInitialized(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setInitialized(false); }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tags do Lead</DialogTitle>
          <DialogDescription>
            Selecione as tags para <strong>{leadName || "este lead"}</strong>
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[300px] py-2">
          <div className="space-y-2">
            {allTags && allTags.length > 0 ? (
              (() => {
                const grouped = allTags.reduce((acc: Record<string, typeof allTags>, tag: any) => {
                  const cat = tag.category || "Sem categoria";
                  if (!acc[cat]) acc[cat] = [];
                  acc[cat].push(tag);
                  return acc;
                }, {} as Record<string, typeof allTags>);
                return Object.entries(grouped).map(([cat, catTags]) => (
                  <div key={cat} className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 pt-2">{cat}</p>
                    {(catTags as any[]).map((tag: any) => (
                      <label key={tag.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer">
                        <Checkbox
                          checked={selectedIds.has(tag.id)}
                          onCheckedChange={() => toggleTag(tag.id)}
                        />
                        <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }} />
                        <span className="text-sm">{tag.name}</span>
                        {tag.description && <span className="text-xs text-muted-foreground ml-auto">{tag.description}</span>}
                      </label>
                    ))}
                  </div>
                ));
              })()
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhuma tag criada ainda. Crie tags na aba "Tags" primeiro.</p>
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => { onOpenChange(false); setInitialized(false); }}>Cancelar</Button>
          <Button onClick={handleSave} disabled={bulkSet.isPending} className="bg-[#9B212B] hover:bg-[#7a1a22]">
            {bulkSet.isPending ? "Salvando..." : "Salvar Tags"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ===================== LEAD TAG DISPLAY =====================
function LeadTagsDisplay({ leadId }: { leadId: number }) {
  const { data: leadTagsList } = trpc.leadTag.getForLead.useQuery({ leadId });
  if (!leadTagsList || leadTagsList.length === 0) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {leadTagsList.map((tag: any) => (
        <TagBadge key={tag.id} name={tag.name} color={tag.color} />
      ))}
    </div>
  );
}

// ===================== TAGS TAB =====================
function TagsTab({ filter }: { filter: DateFilter }) {
  const queryInput = useMemo(() => dateFilterToQuery(filter), [filter]);
  const { data: allTags, isLoading } = trpc.tag.list.useQuery();
  const { data: tagStats } = trpc.tag.stats.useQuery(queryInput);
  const createTagMut = trpc.tag.create.useMutation();
  const updateTagMut = trpc.tag.update.useMutation();
  const deleteTagMut = trpc.tag.delete.useMutation();
  const utils = trpc.useUtils();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<any>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  if (isLoading) return <DashboardSkeleton />;

  const handleCreate = async (data: { name: string; color: string; category?: string; description?: string }) => {
    await createTagMut.mutateAsync(data);
    utils.tag.list.invalidate();
    utils.tag.stats.invalidate();
  };

  const handleUpdate = async (data: { name: string; color: string; category?: string; description?: string }) => {
    if (!editingTag) return;
    await updateTagMut.mutateAsync({ id: editingTag.id, ...data });
    utils.tag.list.invalidate();
    utils.tag.stats.invalidate();
    setEditingTag(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta tag? Ela será removida de todos os leads.")) return;
    await deleteTagMut.mutateAsync({ id });
    utils.tag.list.invalidate();
    utils.tag.stats.invalidate();
  };

  const filteredTags = filterCategory === "all"
    ? (allTags || [])
    : (allTags || []).filter((t: any) => (t.category || "Sem categoria") === filterCategory);

  const categories = Array.from(new Set((allTags || []).map((t: any) => t.category || "Sem categoria")));

  // Merge tag stats with tag data
  const tagStatsMap = new Map((tagStats || []).map((s: any) => [s.tagId, s.count]));

  // Chart data for tags distribution
  const chartData = (allTags || []).map((t: any) => ({
    name: t.name,
    leads: tagStatsMap.get(t.id) || 0,
    fill: t.color,
  })).filter((d: any) => d.leads > 0).sort((a: any, b: any) => b.leads - a.leads);

  return (
    <div className="space-y-6">
      {/* Header with create button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2"><Tags className="h-5 w-5" /> Gestão de Tags</h2>
          <p className="text-sm text-muted-foreground mt-1">{(allTags || []).length} tags criadas</p>
        </div>
        <Button onClick={() => { setEditingTag(null); setDialogOpen(true); }} className="bg-[#9B212B] hover:bg-[#7a1a22]">
          <Plus className="h-4 w-4 mr-2" /> Nova Tag
        </Button>
      </div>

      {/* Stats chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Leads por Tag</CardTitle>
            <CardDescription>Distribuição de leads por tag no período ({filter.label})</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                <ReTooltip formatter={(v: any) => [`${v} leads`, "Total"]} />
                <Bar dataKey="leads" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry: any, i: number) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Tags list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Todas as Tags</CardTitle>
              <CardDescription>Gerencie suas tags para segmentação de leads</CardDescription>
            </div>
            {categories.length > 1 && (
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredTags.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredTags.map((tag: any) => (
                <div key={tag.id} className="flex items-center gap-3 p-3 rounded-lg border hover:shadow-sm transition-shadow">
                  <span className="h-4 w-4 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{tag.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {tag.category && <span className="text-xs text-muted-foreground">{tag.category}</span>}
                      <span className="text-xs font-medium" style={{ color: tag.color }}>
                        {tagStatsMap.get(tag.id) || 0} leads
                      </span>
                    </div>
                    {tag.description && <p className="text-xs text-muted-foreground mt-1 truncate">{tag.description}</p>}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setEditingTag(tag); setDialogOpen(true); }}>
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-700" onClick={() => handleDelete(tag.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Tags className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Nenhuma tag criada ainda.</p>
              <p className="text-sm mt-1">Crie tags para organizar e segmentar seus leads.</p>
              <Button onClick={() => { setEditingTag(null); setDialogOpen(true); }} className="mt-4 bg-[#9B212B] hover:bg-[#7a1a22]">
                <Plus className="h-4 w-4 mr-2" /> Criar Primeira Tag
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suggested tags */}
      {(allTags || []).length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sugestões de Tags</CardTitle>
            <CardDescription>Tags recomendadas para uma clínica de medicina diagnóstica</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {[
                { name: "Check-up", color: "#34A853", category: "Exame" },
                { name: "Cardiologia", color: "#EF4444", category: "Exame" },
                { name: "Laboratorial", color: "#1877F2", category: "Exame" },
                { name: "Imagem", color: "#8B5CF6", category: "Exame" },
                { name: "VIP", color: "#F59E0B", category: "Perfil" },
                { name: "Convênio", color: "#10B981", category: "Perfil" },
                { name: "Particular", color: "#6366F1", category: "Perfil" },
                { name: "Retorno", color: "#EC4899", category: "Perfil" },
                { name: "Urgente", color: "#DC2626", category: "Prioridade" },
                { name: "Facebook", color: "#1877F2", category: "Campanha" },
                { name: "Instagram", color: "#E4405F", category: "Campanha" },
                { name: "Google", color: "#4285F4", category: "Campanha" },
              ].map(suggestion => (
                <Button
                  key={suggestion.name}
                  variant="outline"
                  className="justify-start gap-2 h-auto py-2"
                  onClick={async () => {
                    await createTagMut.mutateAsync(suggestion);
                    utils.tag.list.invalidate();
                  }}
                >
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: suggestion.color }} />
                  <span className="text-sm">{suggestion.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{suggestion.category}</span>
                  <Plus className="h-3 w-3 ml-1" />
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tag Dialog */}
      <TagDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editTag={editingTag}
        onSave={editingTag ? handleUpdate : handleCreate}
      />
    </div>
  );
}

// ===================== UTM BUILDER TAB =====================
const UTM_PLATFORMS = [
  {
    id: "facebook",
    name: "Facebook Ads",
    icon: "📘",
    defaults: { source: "facebook", medium: "paid" },
    instructions: [
      "Acesse o Gerenciador de Anúncios do Facebook (adsmanager.facebook.com)",
      "Selecione ou crie uma campanha",
      "No nível do Anúncio, vá até a seção 'Destino'",
      "Clique em 'Criar parâmetro de URL' ou 'Build a URL parameter'",
      "Cole os parâmetros UTM gerados abaixo no campo 'Parâmetros de URL'",
      "Ou cole o link completo no campo 'URL do site'",
    ],
  },
  {
    id: "instagram",
    name: "Instagram Ads",
    icon: "📸",
    defaults: { source: "instagram", medium: "paid" },
    instructions: [
      "Os anúncios do Instagram são gerenciados pelo mesmo Gerenciador de Anúncios do Facebook",
      "Selecione 'Instagram' como posicionamento na campanha",
      "No nível do Anúncio, vá até 'Destino' > 'Parâmetros de URL'",
      "Cole os parâmetros UTM gerados abaixo",
      "Para posts orgânicos com link na bio, use o link completo gerado",
    ],
  },
  {
    id: "google",
    name: "Google Ads",
    icon: "🔍",
    defaults: { source: "google", medium: "cpc" },
    instructions: [
      "Acesse ads.google.com e selecione a campanha",
      "Vá em Configurações da Campanha > Opções de URL da campanha",
      "No campo 'Modelo de acompanhamento', adicione: {lpurl}? seguido dos parâmetros UTM",
      "Ou use 'Sufixo de URL final' para adicionar os parâmetros automaticamente",
      "Dica: Use {campaignid} e {adgroupid} como valores dinâmicos do Google",
      "Para campanhas de pesquisa, o utm_medium recomendado é 'cpc'",
    ],
  },
  {
    id: "tiktok",
    name: "TikTok Ads",
    icon: "🎵",
    defaults: { source: "tiktok", medium: "paid" },
    instructions: [
      "Acesse ads.tiktok.com e selecione a campanha",
      "No nível do Anúncio, vá até 'Destino'",
      "No campo 'URL', cole o link completo com UTM params",
      "Ou use macros dinâmicas do TikTok: __CAMPAIGN_NAME__, __AID_NAME__",
      "Exemplo: utm_campaign=__CAMPAIGN_NAME__&utm_content=__AID_NAME__",
    ],
  },
  {
    id: "youtube",
    name: "YouTube Ads",
    icon: "▶️",
    defaults: { source: "youtube", medium: "video" },
    instructions: [
      "Os anúncios do YouTube são gerenciados pelo Google Ads",
      "Crie uma campanha de vídeo no Google Ads",
      "No campo 'URL final', use o link do seu site com UTM params",
      "Adicione os parâmetros no 'Modelo de acompanhamento' ou 'Sufixo de URL final'",
      "Para links orgânicos na descrição do vídeo, cole o link completo gerado",
    ],
  },
  {
    id: "email",
    name: "Email Marketing",
    icon: "✉️",
    defaults: { source: "email", medium: "email" },
    instructions: [
      "Adicione os parâmetros UTM a todos os links dentro do email",
      "Use o utm_campaign para identificar cada disparo (ex: newsletter-abril-2026)",
      "Use utm_content para diferenciar links dentro do mesmo email (ex: botao-cta, link-texto)",
      "A maioria das ferramentas de email (Mailchimp, RD Station) tem campo próprio para UTM",
    ],
  },
  {
    id: "organico",
    name: "Orgânico / Outros",
    icon: "🌐",
    defaults: { source: "direto", medium: "organico" },
    instructions: [
      "Use para links compartilhados em redes sociais sem anúncio pago",
      "Ideal para posts orgânicos, stories, bio do Instagram, WhatsApp, etc.",
      "Mude o utm_source para a rede específica (ex: whatsapp, linkedin)",
      "O utm_medium 'organico' indica que não é tráfego pago",
    ],
  },
];

function UTMBuilderTab() {
  const [baseUrl, setBaseUrl] = useState("https://www.totalquality.med.br");
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [utmTerm, setUtmTerm] = useState("");
  const [utmContent, setUtmContent] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedParams, setCopiedParams] = useState(false);
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);

  const selectPlatform = (platformId: string) => {
    const platform = UTM_PLATFORMS.find(p => p.id === platformId);
    if (platform) {
      setSelectedPlatform(platformId);
      setUtmSource(platform.defaults.source);
      setUtmMedium(platform.defaults.medium);
    }
  };

  const utmParams = useMemo(() => {
    const params = new URLSearchParams();
    if (utmSource) params.set("utm_source", utmSource);
    if (utmMedium) params.set("utm_medium", utmMedium);
    if (utmCampaign) params.set("utm_campaign", utmCampaign);
    if (utmTerm) params.set("utm_term", utmTerm);
    if (utmContent) params.set("utm_content", utmContent);
    return params.toString();
  }, [utmSource, utmMedium, utmCampaign, utmTerm, utmContent]);

  const fullUrl = useMemo(() => {
    if (!utmParams) return baseUrl;
    const separator = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${separator}${utmParams}`;
  }, [baseUrl, utmParams]);

  const copyToClipboard = async (text: string, type: "full" | "params") => {
    await navigator.clipboard.writeText(text);
    if (type === "full") { setCopied(true); setTimeout(() => setCopied(false), 2000); }
    else { setCopiedParams(true); setTimeout(() => setCopiedParams(false), 2000); }
  };

  const isValid = utmSource && utmMedium && utmCampaign;

  return (
    <div className="space-y-6">
      {/* Platform Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-[#9B212B]" />
            Selecione a Plataforma
          </CardTitle>
          <CardDescription>Escolha a plataforma de anúncios para preencher automaticamente os parâmetros recomendados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {UTM_PLATFORMS.map(platform => (
              <button
                key={platform.id}
                onClick={() => selectPlatform(platform.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                  selectedPlatform === platform.id
                    ? "border-[#9B212B] bg-[#9B212B]/5 shadow-md"
                    : "border-muted hover:border-[#9B212B]/30"
                }`}
              >
                <span className="text-2xl">{platform.icon}</span>
                <span className="text-xs font-medium text-center leading-tight">{platform.name}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* UTM Builder Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5 text-[#9B212B]" />
            Gerador de Link UTM
          </CardTitle>
          <CardDescription>Preencha os campos abaixo para gerar o link rastreável. Os 3 primeiros campos são obrigatórios.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">URL de destino</label>
            <Input
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://www.totalquality.med.br"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                utm_source <span className="text-red-500">*</span>
                <span className="text-xs text-muted-foreground ml-1">(de onde vem)</span>
              </label>
              <Input
                value={utmSource}
                onChange={(e) => setUtmSource(e.target.value)}
                placeholder="facebook, google, instagram..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                utm_medium <span className="text-red-500">*</span>
                <span className="text-xs text-muted-foreground ml-1">(tipo de tráfego)</span>
              </label>
              <Input
                value={utmMedium}
                onChange={(e) => setUtmMedium(e.target.value)}
                placeholder="paid, cpc, email, organico..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                utm_campaign <span className="text-red-500">*</span>
                <span className="text-xs text-muted-foreground ml-1">(nome da campanha)</span>
              </label>
              <Input
                value={utmCampaign}
                onChange={(e) => setUtmCampaign(e.target.value)}
                placeholder="checkup-maio, cardiologia-promo..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                utm_term <span className="text-xs text-muted-foreground">(opcional - palavra-chave)</span>
              </label>
              <Input
                value={utmTerm}
                onChange={(e) => setUtmTerm(e.target.value)}
                placeholder="exame de sangue, check-up..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                utm_content <span className="text-xs text-muted-foreground">(opcional - variação do anúncio)</span>
              </label>
              <Input
                value={utmContent}
                onChange={(e) => setUtmContent(e.target.value)}
                placeholder="banner-azul, video-depoimento..."
              />
            </div>
          </div>

          {/* Generated URL */}
          {isValid && (
            <div className="mt-6 space-y-3">
              <Separator />
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#9B212B]">Link completo gerado:</label>
                <div className="flex gap-2">
                  <div className="flex-1 p-3 bg-muted rounded-lg text-sm break-all font-mono">
                    {fullUrl}
                  </div>
                  <Button
                    onClick={() => copyToClipboard(fullUrl, "full")}
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                    <span className="ml-1 hidden sm:inline">{copied ? "Copiado!" : "Copiar"}</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">Apenas os parâmetros UTM:</label>
                <div className="flex gap-2">
                  <div className="flex-1 p-3 bg-muted rounded-lg text-sm break-all font-mono">
                    {utmParams}
                  </div>
                  <Button
                    onClick={() => copyToClipboard(utmParams, "params")}
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                  >
                    {copiedParams ? <Check className="h-4 w-4 text-green-600" /> : <Clipboard className="h-4 w-4" />}
                    <span className="ml-1 hidden sm:inline">{copiedParams ? "Copiado!" : "Copiar"}</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Platform Guides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#9B212B]" />
            Guia de Configuração por Plataforma
          </CardTitle>
          <CardDescription>Clique em cada plataforma para ver o passo a passo de como aplicar os UTM params</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {UTM_PLATFORMS.map(platform => (
            <div key={platform.id} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedGuide(expandedGuide === platform.id ? null : platform.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{platform.icon}</span>
                  <span className="font-medium">{platform.name}</span>
                </div>
                <ChevronLeft className={`h-4 w-4 transition-transform ${expandedGuide === platform.id ? "-rotate-90" : "rotate-180"}`} />
              </button>
              {expandedGuide === platform.id && (
                <div className="px-4 pb-4 border-t bg-muted/20">
                  <ol className="mt-3 space-y-2">
                    {platform.instructions.map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#9B212B] text-white flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </span>
                        <span className="pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                  {selectedPlatform === platform.id && isValid && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-medium text-green-800 flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        Link gerado para {platform.name}:
                      </p>
                      <p className="text-xs font-mono mt-1 text-green-700 break-all">{fullUrl}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="border-[#9B212B]/20 bg-[#9B212B]/5">
        <CardContent className="p-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-[#9B212B] shrink-0 mt-0.5" />
            <div className="space-y-3">
              <h3 className="font-semibold text-[#9B212B]">Dicas Importantes</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><strong>Consistência:</strong> Use sempre os mesmos nomes para source e medium. Ex: sempre "facebook" (não "Facebook" ou "fb").</li>
                <li><strong>Sem espaços:</strong> Use hífens (-) em vez de espaços nos nomes das campanhas. Ex: "checkup-maio-2026".</li>
                <li><strong>Minúsculas:</strong> Mantenha tudo em letras minúsculas para evitar duplicações no painel.</li>
                <li><strong>Nomeação:</strong> Crie um padrão de nomenclatura. Ex: [tipo]-[objetivo]-[mes]-[ano] como "video-checkup-maio-2026".</li>
                <li><strong>Teste:</strong> Após configurar, clique no link gerado e verifique no painel se o lead aparece com a fonte correta.</li>
                <li><strong>Rastreamento automático:</strong> O site já captura automaticamente os UTM params de qualquer visitante. Basta usar os links gerados aqui nas suas campanhas.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ===================== SKELETON =====================
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}><CardContent className="p-6"><div className="h-20 bg-muted animate-pulse rounded" /></CardContent></Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map(i => (
          <Card key={i}><CardContent className="p-6"><div className="h-[300px] bg-muted animate-pulse rounded" /></CardContent></Card>
        ))}
      </div>
    </div>
  );
}

// ===================== MAIN ADMIN PAGE =====================
export default function Admin() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const params = useParams<{ tab?: string }>();

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  const loginMutation = trpc.auth.adminLogin.useMutation({
    onSuccess: () => {
      setLoginError("");
      // Reload to pick up the new session cookie
      window.location.reload();
    },
    onError: (err) => {
      setLoginError(err.message || "Email ou senha incorretos");
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    loginMutation.mutate({ email: loginEmail, password: loginPassword });
  };

  const [dateFilter, setDateFilter] = useState<DateFilter>({
    mode: "preset",
    days: 30,
    label: "Últimos 30 dias",
  });

  const activeTab = params.tab || "dashboard";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 mx-auto border-4 border-muted border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground">Carregando painel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fafafa] to-[#f0e8e9]">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="p-8 space-y-6">
            <div className="text-center space-y-3">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-[#9B212B] flex items-center justify-center">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold">Painel Administrativo</h1>
              <p className="text-muted-foreground text-sm">Acesso restrito. Insira suas credenciais para continuar.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="pl-10"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {loginError}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-[#9B212B] hover:bg-[#7a1a22] h-11"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Entrando...</>
                ) : (
                  "Entrar"
                )}
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

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "leads", label: "Leads", icon: UserCheck },
    { id: "campanhas", label: "Campanhas", icon: Megaphone },
    { id: "engajamento", label: "Engajamento", icon: Activity },
    { id: "contatos", label: "Contatos", icon: MessageSquare },
    { id: "tags", label: "Tags", icon: Tags },
    { id: "utm", label: "UTM Builder", icon: Link },
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
              <BarChart3 className="h-5 w-5 text-[#9B212B]" />
              <h1 className="text-lg font-bold hidden sm:block">Painel Administrativo</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <DateRangePicker filter={dateFilter} onFilterChange={setDateFilter} />
            <span className="text-sm text-muted-foreground hidden md:block">{user?.name || user?.email}</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container px-4 md:px-6 py-6">
        <Tabs value={activeTab} onValueChange={(v) => navigate(`/admin/${v}`)}>
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            {tabs.map(tab => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2 data-[state=active]:bg-[#9B212B] data-[state=active]:text-white">
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="dashboard"><DashboardTab filter={dateFilter} /></TabsContent>
          <TabsContent value="leads"><LeadsTab filter={dateFilter} /></TabsContent>
          <TabsContent value="campanhas"><CampaignsTab filter={dateFilter} /></TabsContent>
          <TabsContent value="engajamento"><EngagementTab filter={dateFilter} /></TabsContent>
          <TabsContent value="contatos"><ContactsTab filter={dateFilter} /></TabsContent>
          <TabsContent value="tags"><TagsTab filter={dateFilter} /></TabsContent>
          <TabsContent value="utm"><UTMBuilderTab /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

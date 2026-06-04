import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import jsPDF from "jspdf";
import "jspdf-autotable";
import type { DateRange } from "react-day-picker";
import {
  TrendingUp, TrendingDown, DollarSign, MousePointerClick, Eye,
  Target, Zap, Download, FileSpreadsheet, FileText, ArrowUpRight,
  ArrowDownRight, Filter, Loader2, AlertCircle, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, LineChart, Line, Legend, AreaChart, Area,
  PieChart, Pie, Cell, ScatterChart, Scatter, Tooltip
} from "recharts";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { useMemo, useCallback, useState } from "react";
import { subDays, parseISO } from "date-fns";

interface DateFilter {
  mode: "preset" | "custom";
  days?: number;
  dateFrom?: string;
  dateTo?: string;
}

function dateFilterToQuery(filter: DateFilter): { days?: number; dateFrom?: string; dateTo?: string } {
  if (filter.mode === "preset" && filter.days) {
    return { days: filter.days };
  }
  return { dateFrom: filter.dateFrom, dateTo: filter.dateTo };
}

function getPreviousPeriodFilter(filter: DateFilter): { days?: number; dateFrom?: string; dateTo?: string } {
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

function calculateDelta(current: number, previous: number): { delta: number; percentage: number; isPositive: boolean } {
  if (previous === 0) return { delta: 0, percentage: 0, isPositive: current >= 0 };
  const delta = current - previous;
  const percentage = (delta / previous) * 100;
  return { delta, percentage, isPositive: delta >= 0 };
}

interface TrendMetricCardProps {
  label: string;
  currentValue: number;
  previousValue: number;
  format?: (val: number) => string;
  isNegativeBetter?: boolean;
}

function TrendMetricCard({ label, currentValue, previousValue, format, isNegativeBetter }: TrendMetricCardProps) {
  const { delta, percentage, isPositive } = calculateDelta(currentValue, previousValue);
  const shouldShowGreen = isNegativeBetter ? !isPositive : isPositive;
  const displayValue = format ? format(currentValue) : currentValue.toFixed(2);
  const displayDelta = format ? format(Math.abs(delta)) : Math.abs(delta).toFixed(2);

  return (
    <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-800">
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-lg font-bold mt-1">{displayValue}</p>
      </div>
      <div className="text-right">
        <div className={`flex items-center gap-1 ${shouldShowGreen ? 'text-green-500' : 'text-red-500'}`}>
          {shouldShowGreen ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
          <span className="text-sm font-semibold">{Math.abs(percentage).toFixed(1)}%</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">vs período anterior</p>
      </div>
    </div>
  );
}

interface PlatformMetricCardProps {
  platform: string;
  platformName: string;
  spend: number;
  conversions: number;
  cpc: number;
  sessions: number;
  roi: number;
  cpa: number;
  isWarning?: boolean;
}

function PlatformMetricCard({ platform, platformName, spend, conversions, cpc, sessions, roi, cpa, isWarning }: PlatformMetricCardProps) {
  const platformColors: Record<string, string> = {
    "google_ads": "bg-gradient-to-br from-blue-900 to-blue-800",
    "meta_ads": "bg-gradient-to-br from-indigo-900 to-indigo-800",
    "tiktok_ads": "bg-gradient-to-br from-slate-900 to-slate-800",
  };

  return (
    <div className={`${platformColors[platform] || "bg-gradient-to-br from-slate-900 to-slate-800"} rounded-lg p-6 text-white relative overflow-hidden`}>
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12" />
      
      <div className="relative z-10">
        <h3 className="text-lg font-semibold mb-4">{platformName}</h3>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Spend */}
          <div>
            <p className="text-2xl font-bold">R$ {(spend / 1000).toFixed(1)}k</p>
            <p className="text-xs text-white/70 mt-1">Gasto</p>
          </div>

          {/* Conversions */}
          <div>
            <p className="text-2xl font-bold">{conversions.toLocaleString()}</p>
            <p className="text-xs text-white/70">Conversões</p>
          </div>

          {/* CPC */}
          <div className={isWarning ? "border border-red-500/50 rounded p-2" : ""}>
            <p className="text-xl font-bold">R$ {cpc.toFixed(2)}</p>
            <p className="text-xs text-white/70">CPC</p>
          </div>

          {/* CPA */}
          <div>
            <p className="text-xl font-bold">R$ {cpa.toFixed(2)}</p>
            <p className="text-xs text-white/70">CPA</p>
          </div>

          {/* ROI */}
          <div>
            <p className="text-xl font-bold text-green-400">{roi.toFixed(0)}%</p>
            <p className="text-xs text-white/70">ROI</p>
          </div>

          {/* Sessions */}
          <div>
            <p className="text-xl font-bold">{sessions.toLocaleString()}</p>
            <p className="text-xs text-white/70">Sessões</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CampaignsAnalyticsTab({ filter }: { filter: DateFilter }) {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("roas");
  const [selectedCredentialId, setSelectedCredentialId] = useState<number | null>(null);

  // Convert filter to query input
  const queryInput = useMemo(() => dateFilterToQuery(filter), [filter]);
  const previousQueryInput = useMemo(() => getPreviousPeriodFilter(filter), [filter]);

  // Fetch credentials
  const { data: credentials = [], isLoading: credentialsLoading } = trpc.ads.credentials.getAll.useQuery({});

  // Auto-select first credential if available
  const credentialId = useMemo(() => {
    if (selectedCredentialId !== null) return selectedCredentialId;
    if (credentials.length > 0) return credentials[0].id;
    return null;
  }, [selectedCredentialId, credentials]);

  // Fetch metrics for selected credential
  const { data: metrics = [], isLoading: metricsLoading } = trpc.ads.metrics.getByCredential.useQuery(
    credentialId ? { credentialId, ...queryInput } : { credentialId: 0, ...queryInput },
    { enabled: credentialId !== null }
  );

  // Fetch metrics for previous period
  const { data: previousMetrics = [] } = trpc.ads.metrics.getByCredential.useQuery(
    credentialId ? { credentialId, ...previousQueryInput } : { credentialId: 0, ...previousQueryInput },
    { enabled: credentialId !== null }
  );

  // Transform metrics to campaign format
  const campaigns = useMemo(() => {
    return metrics.map((m: any) => ({
      id: m.id,
      name: m.campaignName,
      platform: m.platform === "google_ads" ? "Google Ads" : m.platform === "meta_ads" ? "Meta Ads" : "TikTok Ads",
      status: "active",
      spend: Number(m.spend) || 0,
      impressions: m.impressions || 0,
      clicks: m.clicks || 0,
      conversions: m.conversions || 0,
      revenue: Number(m.conversionValue) || 0,
      cpc: Number(m.cpc) || 0,
      ctr: Number(m.ctr) || 0,
      conversionRate: m.clicks > 0 ? (m.conversions / m.clicks) * 100 : 0,
      roas: Number(m.roas) || 0,
      avgPosition: 1.0,
    }));
  }, [metrics]);

  // Get unique campaigns for filter
  const uniqueCampaigns = useMemo(() => {
    const campaignMap = new Map();
    campaigns.forEach(c => {
      if (!campaignMap.has(c.name)) {
        campaignMap.set(c.name, c);
      }
    });
    return Array.from(campaignMap.values());
  }, [campaigns]);

  // Group metrics by platform
  const metricsByPlatform = useMemo(() => {
    const grouped: Record<string, any> = {
      google_ads: { spend: 0, conversions: 0, cpc: 0, sessions: 0, clicks: 0, ctr: 0, count: 0, revenue: 0 },
      meta_ads: { spend: 0, conversions: 0, cpc: 0, sessions: 0, clicks: 0, ctr: 0, count: 0, revenue: 0 },
      tiktok_ads: { spend: 0, conversions: 0, cpc: 0, sessions: 0, clicks: 0, ctr: 0, count: 0, revenue: 0 },
    };

    metrics.forEach((m: any) => {
      const platform = m.platform;
      if (grouped[platform]) {
        grouped[platform].spend += Number(m.spend) || 0;
        grouped[platform].conversions += m.conversions || 0;
        grouped[platform].sessions += m.sessions || 0;
        grouped[platform].clicks += m.clicks || 0;
        grouped[platform].revenue += Number(m.conversionValue) || 0;
        grouped[platform].ctr += Number(m.ctr) || 0;
        grouped[platform].count += 1;
      }
    });

    // Calculate average metrics per platform
    Object.keys(grouped).forEach(platform => {
      if (grouped[platform].clicks > 0) {
        grouped[platform].cpc = grouped[platform].spend / grouped[platform].clicks;
      }
      if (grouped[platform].count > 0) {
        grouped[platform].ctr = grouped[platform].ctr / grouped[platform].count;
      }
      grouped[platform].cpa = grouped[platform].conversions > 0 
        ? grouped[platform].spend / grouped[platform].conversions 
        : 0;
      grouped[platform].roi = grouped[platform].spend > 0
        ? ((grouped[platform].revenue - grouped[platform].spend) / grouped[platform].spend) * 100
        : 0;
    });

    return grouped;
  }, [metrics]);

  // Filter campaigns by platform and campaign
  const filteredCampaigns = useMemo(() => {
    let filtered = campaigns;
    if (selectedPlatform !== "all") {
      filtered = filtered.filter(c => c.platform === selectedPlatform);
    }
    if (selectedCampaign !== "all") {
      filtered = filtered.filter(c => c.name === selectedCampaign);
    }
    return filtered.sort((a, b) => {
      const aVal = a[sortBy as keyof typeof a] as number;
      const bVal = b[sortBy as keyof typeof b] as number;
      return bVal - aVal;
    });
  }, [campaigns, selectedPlatform, selectedCampaign, sortBy]);

  // Prepare daily performance data
  const dailyPerformance = useMemo(() => {
    const grouped: Record<string, any> = {};
    filteredCampaigns.forEach(c => {
      const campaignMetrics = metrics.filter((m: any) => m.campaignName === c.name);
      campaignMetrics.forEach((m: any) => {
        const date = m.date;
        if (!grouped[date]) {
          grouped[date] = { date, conversions: 0, spend: 0, clicks: 0, revenue: 0 };
        }
        grouped[date].conversions += m.conversions || 0;
        grouped[date].spend += Number(m.spend) || 0;
        grouped[date].clicks += m.clicks || 0;
        grouped[date].revenue += Number(m.conversionValue) || 0;
      });
    });
    return Object.values(grouped).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [metrics, filteredCampaigns]);

  // Prepare conversions by source data
  const conversionsBySource = useMemo(() => {
    const grouped: Record<string, any> = {};
    filteredCampaigns.forEach(c => {
      const campaignMetrics = metrics.filter((m: any) => m.campaignName === c.name);
      campaignMetrics.forEach((m: any) => {
        const platform = m.platform === "google_ads" ? "Google Ads" : m.platform === "meta_ads" ? "Meta Ads" : "TikTok Ads";
        if (!grouped[m.date]) {
          grouped[m.date] = { date: m.date };
        }
        grouped[m.date][platform] = (grouped[m.date][platform] || 0) + (m.conversions || 0);
      });
    });
    return Object.values(grouped).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [metrics, filteredCampaigns]);

  const exportCSV = useCallback(() => {
    const headers = ["Campanha", "Plataforma", "Spend", "Impressões", "Cliques", "Conversões", "Revenue", "CPC", "CTR", "Conv. Rate", "ROAS"];
    const rows = filteredCampaigns.map(c => [
      c.name, c.platform, c.spend.toFixed(2), c.impressions, c.clicks, c.conversions,
      c.revenue.toFixed(2), c.cpc.toFixed(2), c.ctr.toFixed(2), c.conversionRate.toFixed(2), c.roas.toFixed(2)
    ]);
    
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campanhas-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  }, [filteredCampaigns]);

  const exportPDF = useCallback(() => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    let yPos = margin;

    // Title
    doc.setFontSize(16);
    doc.text("Relatório de Campanhas", margin, yPos);
    yPos += 10;

    // Date range
    doc.setFontSize(10);
    doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`, margin, yPos);
    yPos += 8;

    // Summary metrics
    const totalSpend = filteredCampaigns.reduce((sum, c) => sum + c.spend, 0);
    const totalConversions = filteredCampaigns.reduce((sum, c) => sum + c.conversions, 0);
    const avgROAS = filteredCampaigns.length > 0 
      ? filteredCampaigns.reduce((sum, c) => sum + c.roas, 0) / filteredCampaigns.length 
      : 0;

    doc.setFontSize(11);
    doc.text("Resumo de Performance", margin, yPos);
    yPos += 6;
    doc.setFontSize(9);
    doc.text(`Total de Gasto: R$ ${totalSpend.toFixed(2)}`, margin, yPos);
    yPos += 4;
    doc.text(`Total de Conversões: ${totalConversions}`, margin, yPos);
    yPos += 4;
    doc.text(`ROAS Médio: ${avgROAS.toFixed(2)}`, margin, yPos);
    yPos += 8;

    // Table
    const headers = [["Campanha", "Plataforma", "Spend", "Conversões", "CPC", "ROAS"]];
    const rows = filteredCampaigns.map(c => [
      c.name.substring(0, 20),
      c.platform,
      `R$ ${c.spend.toFixed(2)}`,
      c.conversions.toString(),
      `R$ ${c.cpc.toFixed(2)}`,
      c.roas.toFixed(2)
    ]);

    (doc as any).autoTable({
      head: headers,
      body: rows,
      startY: yPos,
      margin: { left: margin, right: margin },
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });

    doc.save(`campanhas-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  }, [filteredCampaigns]);

  if (credentialsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!credentialId) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Nenhuma credencial de Google Ads ou Meta Ads configurada.</p>
        <p className="text-sm text-muted-foreground mt-2">Configure suas credenciais no painel de administração.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2"><Target className="h-5 w-5" /> Analytics</h2>
          <p className="text-sm text-muted-foreground mt-1">Performance de Google Ads, Meta Ads e TikTok</p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" /> Exportar
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="end">
            <div className="space-y-1">
              <button onClick={exportCSV} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent">
                <FileSpreadsheet className="h-4 w-4 text-green-600" /> CSV
              </button>
              <button onClick={exportPDF} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent">
                <FileText className="h-4 w-4 text-red-600" /> PDF
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Credential Selector and Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {credentials.length > 1 && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Conta:</label>
            <Select value={credentialId?.toString() || ""} onValueChange={(v) => setSelectedCredentialId(Number(v))}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {credentials.map((cred: any) => (
                  <SelectItem key={cred.id} value={cred.id.toString()}>
                    {cred.accountName} ({cred.platform === "google_ads" ? "Google Ads" : "Meta Ads"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Campaign Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Campanha:</label>
          <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Campanhas ({uniqueCampaigns.length})</SelectItem>
              {uniqueCampaigns.map((campaign) => (
                <SelectItem key={campaign.name} value={campaign.name}>
                  {campaign.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear filters */}
        {(selectedPlatform !== "all" || selectedCampaign !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedPlatform("all");
              setSelectedCampaign("all");
            }}
            className="gap-1"
          >
            <X className="h-4 w-4" /> Limpar filtros
          </Button>
        )}
      </div>

      {/* Platform Metrics Cards */}
      {metricsLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metricsByPlatform.google_ads.count > 0 && (
            <PlatformMetricCard
              platform="google_ads"
              platformName="Google Ads"
              spend={metricsByPlatform.google_ads.spend}
              conversions={metricsByPlatform.google_ads.conversions}
              cpc={metricsByPlatform.google_ads.cpc}
              sessions={metricsByPlatform.google_ads.sessions}
              roi={metricsByPlatform.google_ads.roi}
              cpa={metricsByPlatform.google_ads.cpa}
              isWarning={metricsByPlatform.google_ads.cpc > 2}
            />
          )}
          {metricsByPlatform.meta_ads.count > 0 && (
            <PlatformMetricCard
              platform="meta_ads"
              platformName="Meta Ads"
              spend={metricsByPlatform.meta_ads.spend}
              conversions={metricsByPlatform.meta_ads.conversions}
              cpc={metricsByPlatform.meta_ads.cpc}
              sessions={metricsByPlatform.meta_ads.sessions}
              roi={metricsByPlatform.meta_ads.roi}
              cpa={metricsByPlatform.meta_ads.cpa}
              isWarning={metricsByPlatform.meta_ads.cpc > 1.5}
            />
          )}
          {metricsByPlatform.tiktok_ads.count > 0 && (
            <PlatformMetricCard
              platform="tiktok_ads"
              platformName="TikTok Ads"
              spend={metricsByPlatform.tiktok_ads.spend}
              conversions={metricsByPlatform.tiktok_ads.conversions}
              cpc={metricsByPlatform.tiktok_ads.cpc}
              sessions={metricsByPlatform.tiktok_ads.sessions}
              roi={metricsByPlatform.tiktok_ads.roi}
              cpa={metricsByPlatform.tiktok_ads.cpa}
              isWarning={metricsByPlatform.tiktok_ads.cpc > 0.5}
            />
          )}
        </div>
      )}

      {/* Trend Analysis with Period Comparison */}
      {filteredCampaigns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Análise de Tendências - Comparação com Período Anterior</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(() => {
                const currentSpend = filteredCampaigns.reduce((sum, c) => sum + c.spend, 0);
                const currentConversions = filteredCampaigns.reduce((sum, c) => sum + c.conversions, 0);
                const currentCPC = filteredCampaigns.length > 0 ? filteredCampaigns.reduce((sum, c) => sum + c.cpc, 0) / filteredCampaigns.length : 0;
                const currentCTR = filteredCampaigns.length > 0 ? filteredCampaigns.reduce((sum, c) => sum + c.ctr, 0) / filteredCampaigns.length : 0;
                const currentROAS = filteredCampaigns.length > 0 ? filteredCampaigns.reduce((sum, c) => sum + c.roas, 0) / filteredCampaigns.length : 0;

                const previousCampaigns = previousMetrics.map((m: any) => ({
                  spend: Number(m.spend) || 0,
                  conversions: m.conversions || 0,
                  cpc: Number(m.cpc) || 0,
                  ctr: Number(m.ctr) || 0,
                  roas: Number(m.roas) || 0,
                }));

                const previousSpend = previousCampaigns.reduce((sum, c) => sum + c.spend, 0);
                const previousConversions = previousCampaigns.reduce((sum, c) => sum + c.conversions, 0);
                const previousCPC = previousCampaigns.length > 0 ? previousCampaigns.reduce((sum, c) => sum + c.cpc, 0) / previousCampaigns.length : 0;
                const previousCTR = previousCampaigns.length > 0 ? previousCampaigns.reduce((sum, c) => sum + c.ctr, 0) / previousCampaigns.length : 0;
                const previousROAS = previousCampaigns.length > 0 ? previousCampaigns.reduce((sum, c) => sum + c.roas, 0) / previousCampaigns.length : 0;

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                    <TrendMetricCard
                      label="Gasto Total"
                      currentValue={currentSpend}
                      previousValue={previousSpend}
                      format={(val) => `R$ ${(val / 1000).toFixed(1)}k`}
                    />
                    <TrendMetricCard
                      label="Conversões"
                      currentValue={currentConversions}
                      previousValue={previousConversions}
                      format={(val) => val.toFixed(0)}
                    />
                    <TrendMetricCard
                      label="CPC Médio"
                      currentValue={currentCPC}
                      previousValue={previousCPC}
                      format={(val) => `R$ ${val.toFixed(2)}`}
                      isNegativeBetter={true}
                    />
                    <TrendMetricCard
                      label="CTR Médio"
                      currentValue={currentCTR}
                      previousValue={previousCTR}
                      format={(val) => `${val.toFixed(2)}%`}
                    />
                    <TrendMetricCard
                      label="ROAS Médio"
                      currentValue={currentROAS}
                      previousValue={previousROAS}
                      format={(val) => val.toFixed(2)}
                    />
                  </div>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversions (all campaigns) */}
        <Card className="bg-slate-950 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg text-white">Conversões {selectedCampaign !== "all" ? `(${selectedCampaign})` : "(todas as campanhas)"}</CardTitle>
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <div className="flex items-center justify-center h-80">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" fontSize={11} stroke="#94a3b8" />
                  <YAxis fontSize={11} stroke="#94a3b8" />
                  <ReTooltip 
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                    labelStyle={{ color: "#e2e8f0" }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="conversions" 
                    stroke="#06b6d4" 
                    strokeWidth={2}
                    dot={false}
                    name="Conversões"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Conversions by campaign source */}
        <Card className="bg-slate-950 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg text-white">Conversões por fonte de campanha</CardTitle>
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <div className="flex items-center justify-center h-80">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={conversionsBySource}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" fontSize={11} stroke="#94a3b8" />
                  <YAxis fontSize={11} stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                    labelStyle={{ color: "#e2e8f0" }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="Google Ads" stroke="#06b6d4" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Meta Ads" stroke="#a78bfa" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="TikTok Ads" stroke="#fbbf24" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Campanhas ({filteredCampaigns.length})</CardTitle>
              <CardDescription>Detalhes de performance por campanha</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Plataformas</SelectItem>
                  <SelectItem value="Google Ads">Google Ads</SelectItem>
                  <SelectItem value="Meta Ads">Meta Ads</SelectItem>
                  <SelectItem value="TikTok Ads">TikTok Ads</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="roas">Ordenar por ROAS</SelectItem>
                  <SelectItem value="spend">Ordenar por Spend</SelectItem>
                  <SelectItem value="clicks">Ordenar por Cliques</SelectItem>
                  <SelectItem value="conversions">Ordenar por Conversões</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {metricsLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Nenhuma campanha encontrada.</p>
          ) : (
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campanha</TableHead>
                    <TableHead>Plataforma</TableHead>
                    <TableHead className="text-right">Spend</TableHead>
                    <TableHead className="text-right">Impressões</TableHead>
                    <TableHead className="text-right">Cliques</TableHead>
                    <TableHead className="text-right">Conversões</TableHead>
                    <TableHead className="text-right">CPC</TableHead>
                    <TableHead className="text-right">CTR</TableHead>
                    <TableHead className="text-right">Conv. Rate</TableHead>
                    <TableHead className="text-right">ROAS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">{campaign.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{campaign.platform}</Badge>
                      </TableCell>
                      <TableCell className="text-right">R$ {campaign.spend.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{campaign.impressions.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{campaign.clicks.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{campaign.conversions}</TableCell>
                      <TableCell className="text-right">R$ {campaign.cpc.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{campaign.ctr.toFixed(2)}%</TableCell>
                      <TableCell className="text-right">{campaign.conversionRate.toFixed(2)}%</TableCell>
                      <TableCell className="text-right font-semibold">{campaign.roas.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import {
  TrendingUp, TrendingDown, DollarSign, MousePointerClick, Eye,
  Target, Zap, Download, FileSpreadsheet, FileText, ArrowUpRight,
  ArrowDownRight, Filter, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
  ResponsiveContainer, LineChart, Line, Legend, AreaChart, Area,
  PieChart, Pie, Cell, ScatterChart, Scatter
} from "recharts";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { useMemo, useCallback, useState } from "react";

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

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  format?: "currency" | "number" | "percent";
  change?: number;
}

function MetricCard({ title, value, icon, format = "number", change }: MetricCardProps) {
  const isPositive = change ? change >= 0 : true;
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-2">
              {format === "currency" && "R$ "}
              {value}
              {format === "percent" && "%"}
            </p>
            {change !== undefined && (
              <div className="flex items-center gap-1 mt-2 text-xs">
                {isPositive ? (
                  <>
                    <ArrowUpRight className="h-3 w-3 text-green-600" />
                    <span className="text-green-600">+{change.toFixed(1)}%</span>
                  </>
                ) : (
                  <>
                    <ArrowDownRight className="h-3 w-3 text-red-600" />
                    <span className="text-red-600">{change.toFixed(1)}%</span>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="text-muted-foreground">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CampaignsAnalyticsTab({ filter }: { filter: DateFilter }) {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("roas");
  const [selectedCredentialId, setSelectedCredentialId] = useState<number | null>(null);

  // Convert filter to query input
  const queryInput = useMemo(() => dateFilterToQuery(filter), [filter]);

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

  // Fetch summary
  const { data: summary } = trpc.ads.metrics.getSummary.useQuery(
    credentialId ? { credentialId, ...queryInput } : { credentialId: 0, ...queryInput },
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

  // Filter campaigns by platform
  const filteredCampaigns = useMemo(() => {
    let filtered = campaigns;
    if (selectedPlatform !== "all") {
      filtered = filtered.filter(c => c.platform === selectedPlatform);
    }
    return filtered.sort((a, b) => {
      const aVal = a[sortBy as keyof typeof a] as number;
      const bVal = b[sortBy as keyof typeof b] as number;
      return bVal - aVal;
    });
  }, [campaigns, selectedPlatform, sortBy]);

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    const total = filteredCampaigns.reduce((acc, c) => ({
      spend: acc.spend + c.spend,
      impressions: acc.impressions + c.impressions,
      clicks: acc.clicks + c.clicks,
      conversions: acc.conversions + c.conversions,
      revenue: acc.revenue + c.revenue,
    }), { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 });

    return {
      ...total,
      avgCPC: total.clicks > 0 ? total.spend / total.clicks : 0,
      avgCTR: total.impressions > 0 ? (total.clicks / total.impressions) * 100 : 0,
      conversionRate: total.clicks > 0 ? (total.conversions / total.clicks) * 100 : 0,
      roas: total.spend > 0 ? total.revenue / total.spend : 0,
    };
  }, [filteredCampaigns]);

  // Prepare daily performance data
  const dailyPerformance = useMemo(() => {
    const grouped: Record<string, any> = {};
    metrics.forEach((m: any) => {
      const date = m.date;
      if (!grouped[date]) {
        grouped[date] = { date, spend: 0, clicks: 0, conversions: 0 };
      }
      grouped[date].spend += Number(m.spend) || 0;
      grouped[date].clicks += m.clicks || 0;
      grouped[date].conversions += m.conversions || 0;
    });
    return Object.values(grouped).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [metrics]);

  // Prepare platform summary
  const platformSummary = useMemo(() => {
    const platforms: Record<string, any> = {};
    filteredCampaigns.forEach(c => {
      if (!platforms[c.platform]) {
        platforms[c.platform] = { name: c.platform, value: 0, fill: c.platform === "Google Ads" ? "#4285F4" : "#1877F2" };
      }
      platforms[c.platform].value += c.spend;
    });
    return Object.values(platforms);
  }, [filteredCampaigns]);

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

  const exportExcel = useCallback(() => {
    exportCSV();
  }, [exportCSV]);

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
          <h2 className="text-xl font-bold flex items-center gap-2"><Target className="h-5 w-5" /> Análise de Campanhas (Looker Studio)</h2>
          <p className="text-sm text-muted-foreground mt-1">Performance de Google Ads, Meta Ads e Analytics</p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" /> Exportar
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="end">
            <div className="space-y-1">
              <button onClick={exportExcel} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent">
                <FileSpreadsheet className="h-4 w-4 text-green-600" /> Excel
              </button>
              <button onClick={exportCSV} className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-accent">
                <FileText className="h-4 w-4 text-blue-600" /> CSV
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Credential Selector */}
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

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard title="Spend Total" value={summaryMetrics.spend.toFixed(2)} icon={<DollarSign className="h-6 w-6" />} format="currency" change={12.5} />
        <MetricCard title="Impressões" value={summaryMetrics.impressions} icon={<Eye className="h-6 w-6" />} format="number" change={8.3} />
        <MetricCard title="Cliques" value={summaryMetrics.clicks} icon={<MousePointerClick className="h-6 w-6" />} format="number" change={15.2} />
        <MetricCard title="CPC Médio" value={summaryMetrics.avgCPC.toFixed(2)} icon={<TrendingDown className="h-6 w-6" />} format="currency" change={-5.1} />
        <MetricCard title="ROAS" value={summaryMetrics.roas.toFixed(2)} icon={<TrendingUp className="h-6 w-6" />} format="number" change={22.8} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance Diária</CardTitle>
            <CardDescription>Spend, Cliques e Conversões por dia</CardDescription>
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <div className="flex items-center justify-center h-80">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailyPerformance}>
                  <defs>
                    <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9B212B" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#9B212B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" fontSize={11} />
                  <YAxis fontSize={11} />
                  <ReTooltip />
                  <Area type="monotone" dataKey="spend" stroke="#9B212B" fillOpacity={1} fill="url(#colorSpend)" name="Spend (R$)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Platform Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribuição por Plataforma</CardTitle>
            <CardDescription>Spend total por canal</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {metricsLoading ? (
              <div className="flex items-center justify-center h-80">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={platformSummary} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: R$ ${value.toFixed(0)}`} outerRadius={80} fill="#8884d8" dataKey="value">
                    {platformSummary.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ReTooltip formatter={(value: any) => `R$ ${value.toFixed(2)}`} />
                </PieChart>
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
              <CardTitle>Campanhas</CardTitle>
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

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Insights Principais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredCampaigns.length > 0 && (
              <>
                <div className="flex items-start gap-3 p-3 bg-accent rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Melhor ROAS</p>
                    <p className="text-sm text-muted-foreground">
                      {filteredCampaigns[0]?.name} com ROAS de {filteredCampaigns[0]?.roas.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-accent rounded-lg">
                  <DollarSign className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Maior Investimento</p>
                    <p className="text-sm text-muted-foreground">
                      {filteredCampaigns.reduce((max, c) => c.spend > max.spend ? c : max).name} com R$ {filteredCampaigns.reduce((max, c) => c.spend > max.spend ? c : max).spend.toFixed(2)}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

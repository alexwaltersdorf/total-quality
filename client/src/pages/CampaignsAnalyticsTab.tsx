import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import {
  TrendingUp, TrendingDown, DollarSign, MousePointerClick, Eye,
  Target, Zap, Download, FileSpreadsheet, FileText, ArrowUpRight,
  ArrowDownRight, Filter, Loader2, AlertCircle
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

interface PlatformMetricCardProps {
  platform: string;
  platformName: string;
  spend: number;
  conversions: number;
  cpc: number;
  sessions: number;
  ctr?: number;
  isWarning?: boolean;
}

function PlatformMetricCard({ platform, platformName, spend, conversions, cpc, sessions, ctr, isWarning }: PlatformMetricCardProps) {
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
        <h3 className="text-lg font-semibold mb-6">{platformName}</h3>
        
        {/* Spend */}
        <div className="mb-6">
          <p className="text-4xl font-bold">R$ {(spend / 1000).toFixed(1)}k</p>
          <p className="text-sm text-white/70 mt-1">gasto este mês</p>
        </div>

        {/* Conversions */}
        <div className="mb-6">
          <p className="text-3xl font-bold">{conversions.toLocaleString()}</p>
          <p className="text-sm text-white/70">Conversões</p>
        </div>

        {/* CPC */}
        <div className={`mb-6 ${isWarning ? "border border-red-500/50 rounded p-3" : ""}`}>
          <p className="text-3xl font-bold">R$ {cpc.toFixed(2)}</p>
          <p className="text-sm text-white/70">Custo por clique</p>
          {isWarning && (
            <div className="flex items-center gap-1 mt-2 text-red-400">
              <AlertCircle className="h-3 w-3" />
              <span className="text-xs">Métrica acima da média</span>
            </div>
          )}
        </div>

        {/* Sessions */}
        <div>
          <p className="text-2xl font-bold">{sessions.toLocaleString()}</p>
          <p className="text-sm text-white/70">Sessões</p>
        </div>
      </div>
    </div>
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

  // Group metrics by platform
  const metricsByPlatform = useMemo(() => {
    const grouped: Record<string, any> = {
      google_ads: { spend: 0, conversions: 0, cpc: 0, sessions: 0, clicks: 0, ctr: 0, count: 0 },
      meta_ads: { spend: 0, conversions: 0, cpc: 0, sessions: 0, clicks: 0, ctr: 0, count: 0 },
      tiktok_ads: { spend: 0, conversions: 0, cpc: 0, sessions: 0, clicks: 0, ctr: 0, count: 0 },
    };

    metrics.forEach((m: any) => {
      const platform = m.platform;
      if (grouped[platform]) {
        grouped[platform].spend += Number(m.spend) || 0;
        grouped[platform].conversions += m.conversions || 0;
        grouped[platform].cpc = grouped[platform].spend > 0 && grouped[platform].clicks > 0 
          ? grouped[platform].spend / grouped[platform].clicks 
          : Number(m.cpc) || 0;
        grouped[platform].sessions += m.sessions || 0;
        grouped[platform].clicks += m.clicks || 0;
        grouped[platform].ctr = (grouped[platform].clicks / (m.impressions || 1)) * 100;
        grouped[platform].count += 1;
      }
    });

    // Calculate average CPC per platform
    Object.keys(grouped).forEach(platform => {
      if (grouped[platform].clicks > 0) {
        grouped[platform].cpc = grouped[platform].spend / grouped[platform].clicks;
      }
    });

    return grouped;
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

  // Prepare daily performance data
  const dailyPerformance = useMemo(() => {
    const grouped: Record<string, any> = {};
    metrics.forEach((m: any) => {
      const date = m.date;
      if (!grouped[date]) {
        grouped[date] = { date, conversions: 0, spend: 0, clicks: 0 };
      }
      grouped[date].conversions += m.conversions || 0;
      grouped[date].spend += Number(m.spend) || 0;
      grouped[date].clicks += m.clicks || 0;
    });
    return Object.values(grouped).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [metrics]);

  // Prepare conversions by source data
  const conversionsBySource = useMemo(() => {
    const grouped: Record<string, any> = {};
    metrics.forEach((m: any) => {
      const platform = m.platform === "google_ads" ? "Google Ads" : m.platform === "meta_ads" ? "Meta Ads" : "TikTok Ads";
      if (!grouped[m.date]) {
        grouped[m.date] = { date: m.date };
      }
      grouped[m.date][platform] = (grouped[m.date][platform] || 0) + (m.conversions || 0);
    });
    return Object.values(grouped).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [metrics]);

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
              ctr={metricsByPlatform.google_ads.ctr}
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
              ctr={metricsByPlatform.meta_ads.ctr}
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
              ctr={metricsByPlatform.tiktok_ads.ctr}
              isWarning={metricsByPlatform.tiktok_ads.cpc > 0.5}
            />
          )}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversions (all campaigns) */}
        <Card className="bg-slate-950 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg text-white">Conversões (todas as campanhas)</CardTitle>
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

import { useMemo, useState, useCallback } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import {
  TrendingUp, TrendingDown, DollarSign, MousePointerClick, Eye,
  Target, Zap, Download, FileSpreadsheet, FileText, ArrowUpRight,
  ArrowDownRight, Filter
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

// Sample data for demo
const SAMPLE_CAMPAIGNS = [
  {
    id: 1,
    name: "Google Ads - Check-up Básico",
    platform: "Google Ads",
    status: "active",
    spend: 1250.50,
    impressions: 45230,
    clicks: 1203,
    conversions: 45,
    revenue: 8100,
    cpc: 1.04,
    ctr: 2.66,
    conversionRate: 3.74,
    roas: 6.48,
    avgPosition: 2.1,
  },
  {
    id: 2,
    name: "Meta Ads - Check-up Premium",
    platform: "Meta Ads",
    status: "active",
    spend: 980.00,
    impressions: 52100,
    clicks: 1856,
    conversions: 38,
    revenue: 6840,
    cpc: 0.53,
    ctr: 3.56,
    conversionRate: 2.05,
    roas: 6.98,
    avgPosition: 1.0,
  },
  {
    id: 3,
    name: "Google Ads - Exames de Sangue",
    platform: "Google Ads",
    status: "active",
    spend: 750.25,
    impressions: 28500,
    clicks: 612,
    conversions: 28,
    revenue: 4480,
    cpc: 1.23,
    ctr: 2.15,
    conversionRate: 4.58,
    roas: 5.97,
    avgPosition: 2.8,
  },
  {
    id: 4,
    name: "Meta Ads - Tomografia",
    platform: "Meta Ads",
    status: "active",
    spend: 650.00,
    impressions: 38200,
    clicks: 892,
    conversions: 22,
    revenue: 3960,
    cpc: 0.73,
    ctr: 2.33,
    conversionRate: 2.47,
    roas: 6.09,
    avgPosition: 1.0,
  },
  {
    id: 5,
    name: "Google Ads - Remarketing",
    platform: "Google Ads",
    status: "paused",
    spend: 420.00,
    impressions: 15600,
    clicks: 234,
    conversions: 18,
    revenue: 3240,
    cpc: 1.79,
    ctr: 1.50,
    conversionRate: 7.69,
    roas: 7.71,
    avgPosition: 3.2,
  },
];

const DAILY_PERFORMANCE = [
  { date: "01/05", spend: 320, clicks: 245, conversions: 12, revenue: 1440 },
  { date: "02/05", spend: 380, clicks: 312, conversions: 15, revenue: 1800 },
  { date: "03/05", spend: 290, clicks: 198, conversions: 9, revenue: 1080 },
  { date: "04/05", spend: 410, clicks: 356, conversions: 18, revenue: 2160 },
  { date: "05/05", spend: 350, clicks: 278, conversions: 14, revenue: 1680 },
  { date: "06/05", spend: 430, clicks: 402, conversions: 20, revenue: 2400 },
  { date: "07/05", spend: 400, clicks: 330, conversions: 16, revenue: 1920 },
];

const PLATFORM_SUMMARY = [
  { name: "Google Ads", value: 2420.75, fill: "#4285F4" },
  { name: "Meta Ads", value: 1630.00, fill: "#1877F2" },
];

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  format?: "currency" | "percentage" | "number";
}

function MetricCard({ title, value, change, icon, format: fmt }: MetricCardProps) {
  const isPositive = change && change > 0;
  const formattedValue = fmt === "currency" ? `R$ ${value}` : fmt === "percentage" ? `${value}%` : value;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            <p className="text-2xl font-bold mt-2">{formattedValue}</p>
            {change !== undefined && (
              <div className="flex items-center gap-1 mt-2">
                {isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span className={isPositive ? "text-green-600 text-sm font-medium" : "text-red-600 text-sm font-medium"}>
                  {isPositive ? "+" : ""}{change}% vs período anterior
                </span>
              </div>
            )}
          </div>
          <div className="text-muted-foreground ml-4">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CampaignsAnalyticsTab({ filter }: { filter: any }) {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("roas");

  // Filter campaigns by platform
  const filteredCampaigns = useMemo(() => {
    let campaigns = SAMPLE_CAMPAIGNS;
    if (selectedPlatform !== "all") {
      campaigns = campaigns.filter(c => c.platform === selectedPlatform);
    }
    // Sort by selected metric
    return campaigns.sort((a, b) => {
      const aVal = a[sortBy as keyof typeof a] as number;
      const bVal = b[sortBy as keyof typeof b] as number;
      return bVal - aVal;
    });
  }, [selectedPlatform, sortBy]);

  // Calculate summary metrics
  const summary = useMemo(() => {
    const total = filteredCampaigns.reduce((acc, c) => ({
      spend: acc.spend + c.spend,
      impressions: acc.impressions + c.impressions,
      clicks: acc.clicks + c.clicks,
      conversions: acc.conversions + c.conversions,
      revenue: acc.revenue + c.revenue,
    }), { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 });

    return {
      ...total,
      avgCPC: total.spend / total.clicks,
      avgCTR: (total.clicks / total.impressions) * 100,
      conversionRate: (total.conversions / total.clicks) * 100,
      roas: total.revenue / total.spend,
    };
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
    // Simple Excel export (CSV format)
    exportCSV();
  }, [exportCSV]);

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

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard title="Spend Total" value={summary.spend.toFixed(2)} icon={<DollarSign className="h-6 w-6" />} format="currency" change={12.5} />
        <MetricCard title="Impressões" value={summary.impressions} icon={<Eye className="h-6 w-6" />} format="number" change={8.3} />
        <MetricCard title="Cliques" value={summary.clicks} icon={<MousePointerClick className="h-6 w-6" />} format="number" change={15.2} />
        <MetricCard title="CPC Médio" value={summary.avgCPC.toFixed(2)} icon={<TrendingDown className="h-6 w-6" />} format="currency" change={-5.1} />
        <MetricCard title="ROAS" value={summary.roas.toFixed(2)} icon={<TrendingUp className="h-6 w-6" />} format="number" change={22.8} />
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
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={DAILY_PERFORMANCE}>
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
          </CardContent>
        </Card>

        {/* Platform Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribuição por Plataforma</CardTitle>
            <CardDescription>Spend total por canal</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={PLATFORM_SUMMARY} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: R$ ${value.toFixed(0)}`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {PLATFORM_SUMMARY.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ReTooltip formatter={(value: any) => `R$ ${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Campanhas Ativas</CardTitle>
              <CardDescription>{filteredCampaigns.length} campanhas</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Plataforma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="Google Ads">Google Ads</SelectItem>
                  <SelectItem value="Meta Ads">Meta Ads</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="roas">ROAS</SelectItem>
                  <SelectItem value="spend">Spend</SelectItem>
                  <SelectItem value="conversions">Conversões</SelectItem>
                  <SelectItem value="cpc">CPC</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campanha</TableHead>
                  <TableHead>Plataforma</TableHead>
                  <TableHead className="text-right">Spend</TableHead>
                  <TableHead className="text-right">Impressões</TableHead>
                  <TableHead className="text-right">Cliques</TableHead>
                  <TableHead className="text-right">Conv.</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">CPC</TableHead>
                  <TableHead className="text-right">CTR</TableHead>
                  <TableHead className="text-right">Conv. Rate</TableHead>
                  <TableHead className="text-right">ROAS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((campaign) => (
                  <TableRow key={campaign.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium max-w-[200px] truncate">{campaign.name}</TableCell>
                    <TableCell>
                      <Badge variant={campaign.platform === "Google Ads" ? "default" : "secondary"}>
                        {campaign.platform}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">R$ {campaign.spend.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{campaign.impressions.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{campaign.clicks.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-medium">{campaign.conversions}</TableCell>
                    <TableCell className="text-right">R$ {campaign.revenue.toFixed(2)}</TableCell>
                    <TableCell className="text-right">R$ {campaign.cpc.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{campaign.ctr.toFixed(2)}%</TableCell>
                    <TableCell className="text-right">{campaign.conversionRate.toFixed(2)}%</TableCell>
                    <TableCell className="text-right font-bold text-green-600">{campaign.roas.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Insights Principais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
              <TrendingUp className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Melhor ROAS</p>
                <p className="text-sm text-muted-foreground">Meta Ads - Check-up Premium com ROAS de 6.98</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <Zap className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Melhor CPC</p>
                <p className="text-sm text-muted-foreground">Meta Ads - Check-up Premium com CPC de R$ 0.53</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 border border-purple-200">
              <Target className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Maior Taxa de Conversão</p>
                <p className="text-sm text-muted-foreground">Google Ads - Remarketing com 7.69% de conversão</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

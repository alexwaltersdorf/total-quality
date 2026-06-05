import { cn } from "@/lib/utils";

/**
 * Skeleton Card - Placeholder animado para cards de métrica
 */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-6 space-y-4 animate-pulse",
        className
      )}
    >
      <div className="h-4 w-24 bg-muted rounded"></div>
      <div className="h-8 w-32 bg-muted rounded"></div>
      <div className="flex items-center gap-2">
        <div className="h-4 w-16 bg-muted rounded"></div>
        <div className="h-4 w-12 bg-muted rounded"></div>
      </div>
    </div>
  );
}

/**
 * Skeleton Chart - Placeholder animado para gráficos
 */
export function SkeletonChart({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-6 space-y-4 animate-pulse",
        className
      )}
    >
      <div className="h-4 w-32 bg-muted rounded mb-4"></div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-8 flex-1 bg-muted rounded"></div>
            <div className="h-8 w-12 bg-muted rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton Table - Placeholder animado para tabelas
 */
export function SkeletonTable({ rows = 5, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("rounded-lg border border-border overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-muted/50 p-4 flex gap-4 animate-pulse">
        <div className="h-4 w-24 bg-muted rounded"></div>
        <div className="h-4 w-32 bg-muted rounded"></div>
        <div className="h-4 w-20 bg-muted rounded"></div>
        <div className="h-4 w-20 bg-muted rounded"></div>
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-t border-border p-4 flex gap-4 animate-pulse">
          <div className="h-4 w-24 bg-muted rounded"></div>
          <div className="h-4 w-32 bg-muted rounded"></div>
          <div className="h-4 w-20 bg-muted rounded"></div>
          <div className="h-4 w-20 bg-muted rounded"></div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton Line Chart - Placeholder animado para gráficos de linha
 */
export function SkeletonLineChart({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-6 space-y-4 animate-pulse",
        className
      )}
    >
      <div className="h-4 w-40 bg-muted rounded mb-4"></div>

      {/* Chart area */}
      <div className="h-64 bg-muted/30 rounded flex items-end gap-2 p-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-muted rounded"
            style={{ height: `${Math.random() * 100 + 20}%` }}
          ></div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 justify-center">
        <div className="h-4 w-24 bg-muted rounded"></div>
        <div className="h-4 w-24 bg-muted rounded"></div>
      </div>
    </div>
  );
}

/**
 * Skeleton Metric Card - Placeholder para cards de métrica com comparação
 */
export function SkeletonMetricCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-6 space-y-3 animate-pulse",
        className
      )}
    >
      <div className="h-4 w-28 bg-muted rounded"></div>
      <div className="h-10 w-40 bg-muted rounded"></div>
      <div className="flex items-center gap-2">
        <div className="h-4 w-20 bg-muted rounded"></div>
        <div className="h-4 w-16 bg-muted rounded"></div>
      </div>
    </div>
  );
}

/**
 * Skeleton Filter Bar - Placeholder para barra de filtros
 */
export function SkeletonFilterBar({ className }: { className?: string }) {
  return (
    <div className={cn("flex gap-4 animate-pulse", className)}>
      <div className="h-10 w-32 bg-muted rounded"></div>
      <div className="h-10 w-32 bg-muted rounded"></div>
      <div className="h-10 w-32 bg-muted rounded"></div>
      <div className="h-10 w-24 bg-muted rounded ml-auto"></div>
    </div>
  );
}

/**
 * Skeleton Dashboard - Placeholder completo para dashboard
 */
export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <SkeletonFilterBar />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonMetricCard key={i} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonLineChart />
        <SkeletonChart />
      </div>

      {/* Table */}
      <SkeletonTable rows={8} />
    </div>
  );
}

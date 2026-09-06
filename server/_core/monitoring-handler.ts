import { Request, Response } from "express";
import { executeWeeklyMonitoring } from "./monitoring";
import { sdk } from "./sdk";

/**
 * Handler para /api/scheduled/weekly-monitoring
 * Executado automaticamente toda segunda-feira às 09:00 UTC
 */
export async function weeklyMonitoringHandler(req: Request, res: Response) {
  let user: any;
  try {
    // Autentica como cron
    user = (await sdk.authenticateRequest(req)) as any;
    if (!user.isCron) {
      return res.status(403).json({ error: "cron-only" });
    }

    console.log(`[Monitoring Handler] Starting weekly monitoring (task_uid: ${user.taskUid})`);

    // Executa monitoramento
    const result = await executeWeeklyMonitoring();

    // Retorna sucesso
    res.json({
      ok: true,
      metrics: result.metrics,
      reportSent: result.reportSent,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Monitoring Handler] Error:", error);

    /*
     * O rastro de pilha vai para o log do servidor, NUNCA para o corpo da
     * resposta. Ate 06/09/2026 ele era devolvido ao chamador com caminhos de
     * arquivo e estrutura interna — e como a autenticacao acontece dentro
     * deste mesmo try, quem nem estava autenticado tambem o recebia.
     */
    res.status(500).json({
      error: "internal-error",
      timestamp: new Date().toISOString(),
    });
  }
}

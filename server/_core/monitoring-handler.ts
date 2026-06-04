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

    // Retorna erro em formato esperado pela plataforma
    res.status(500).json({
      error: error.message || "Unknown error",
      stack: error.stack,
      context: {
        url: req.url,
        taskUid: user?.taskUid,
      },
      timestamp: new Date().toISOString(),
    });
  }
}

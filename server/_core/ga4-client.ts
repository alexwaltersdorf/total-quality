import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { google } from "googleapis";

/**
 * Cliente Google Analytics 4 Data API
 * Coleta métricas reais de desempenho do site
 */

interface GA4Metrics {
  pageViews: number;
  users: number;
  sessions: number;
  bounceRate: number;
  avgSessionDuration: number;
  conversions: number;
  conversionRate: number;
  errorCount: number;
}

interface GA4DateRange {
  startDate: string;
  endDate: string;
}

class GA4Client {
  private propertyId: string;
  private client: BetaAnalyticsDataClient;
  private oauth2Client: any;

  constructor(propertyId: string) {
    this.propertyId = propertyId;
    this.client = new BetaAnalyticsDataClient();
    this.initializeOAuth();
  }

  private initializeOAuth() {
    const clientId = process.env.GA4_OAUTH_CLIENT_ID;
    const clientSecret = process.env.GA4_OAUTH_CLIENT_SECRET;
    const redirectUrl = process.env.OAUTH_REDIRECT_URL || "http://localhost:3000/api/oauth/ga4/callback";

    this.oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUrl);
  }

  /**
   * Gera URL de autenticação OAuth
   */
  getAuthUrl(): string {
    const scopes = ["https://www.googleapis.com/auth/analytics.readonly"];

    return this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      prompt: "consent",
    });
  }

  /**
   * Troca código de autorização por tokens
   */
  async exchangeCodeForTokens(code: string): Promise<any> {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    return tokens;
  }

  /**
   * Define credenciais de acesso
   */
  setCredentials(credentials: any) {
    this.oauth2Client.setCredentials(credentials);
  }

  /**
   * Busca métricas do Google Analytics
   */
  async getMetrics(dateRange: GA4DateRange): Promise<GA4Metrics> {
    try {
      const request = {
        property: `properties/${this.propertyId}`,
        dateRanges: [
          {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          },
        ],
        metrics: [
          { name: "screenPageViews" }, // Page views
          { name: "activeUsers" }, // Users
          { name: "sessions" }, // Sessions
          { name: "bounceRate" }, // Bounce rate
          { name: "averageSessionDuration" }, // Avg session duration
          { name: "conversions" }, // Conversions
          { name: "conversionRate" }, // Conversion rate
        ],
        dimensions: [{ name: "date" }],
      };

      // Usar credenciais OAuth se disponíveis
      if (this.oauth2Client.credentials?.access_token) {
        (request as any).credentials = this.oauth2Client.credentials;
      }

      const response = await this.client.runReport(request as any);

      // Parse resposta
      return this.parseMetrics(response);
    } catch (error) {
      console.error("[GA4 Client] Erro ao buscar métricas:", error);
      throw error;
    }
  }

  /**
   * Parse resposta do GA4 API
   */
  private parseMetrics(response: any): GA4Metrics {
    let pageViews = 0;
    let users = 0;
    let sessions = 0;
    let bounceRate = 0;
    let avgSessionDuration = 0;
    let conversions = 0;
    let conversionRate = 0;

    // Agregar valores de todas as linhas
    if (response.rows) {
      response.rows.forEach((row: any) => {
        const values = row.metricValues;
        if (values) {
          pageViews += parseFloat(values[0]?.value || 0);
          users += parseFloat(values[1]?.value || 0);
          sessions += parseFloat(values[2]?.value || 0);
          bounceRate += parseFloat(values[3]?.value || 0);
          avgSessionDuration += parseFloat(values[4]?.value || 0);
          conversions += parseFloat(values[5]?.value || 0);
          conversionRate += parseFloat(values[6]?.value || 0);
        }
      });

      // Calcular médias
      const rowCount = response.rows.length;
      if (rowCount > 0) {
        bounceRate = bounceRate / rowCount;
        avgSessionDuration = avgSessionDuration / rowCount;
        conversionRate = conversionRate / rowCount;
      }
    }

    return {
      pageViews: Math.round(pageViews),
      users: Math.round(users),
      sessions: Math.round(sessions),
      bounceRate: Math.round(bounceRate * 100) / 100,
      avgSessionDuration: Math.round(avgSessionDuration * 100) / 100,
      conversions: Math.round(conversions),
      conversionRate: Math.round(conversionRate * 100) / 100,
      errorCount: 0, // Será calculado separadamente
    };
  }

  /**
   * Busca métricas de erro
   */
  async getErrorMetrics(dateRange: GA4DateRange): Promise<number> {
    try {
      const request = {
        property: `properties/${this.propertyId}`,
        dateRanges: [
          {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          },
        ],
        metrics: [{ name: "eventCount" }],
        dimensionFilter: {
          filter: {
            fieldName: "eventName",
            stringFilter: {
              matchType: "EXACT",
              value: "exception",
            },
          },
        },
      };

      if (this.oauth2Client.credentials?.access_token) {
        (request as any).credentials = this.oauth2Client.credentials;
      }

      const response = await this.client.runReport(request as any);

      let errorCount = 0;
      if (response.rows) {
        response.rows.forEach((row: any) => {
          const values = row.metricValues;
          if (values) {
            errorCount += parseFloat(values[0]?.value || 0);
          }
        });
      }

      return Math.round(errorCount);
    } catch (error) {
      console.error("[GA4 Client] Erro ao buscar métricas de erro:", error);
      return 0;
    }
  }
}

// Exportar instância singleton
let ga4Client: GA4Client | null = null;

export function getGA4Client(): GA4Client {
  if (!ga4Client) {
    const propertyId = process.env.VITE_GA4_PROPERTY_ID;
    if (!propertyId) {
      throw new Error("VITE_GA4_PROPERTY_ID não configurado");
    }
    ga4Client = new GA4Client(propertyId);
  }
  return ga4Client;
}

export { GA4Client, GA4Metrics, GA4DateRange };

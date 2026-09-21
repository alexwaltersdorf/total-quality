export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  adminEmail: process.env.ADMIN_EMAIL ?? "",
  adminPassword: process.env.ADMIN_PASSWORD ?? "",
  googleAdsDeveloperToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN ?? "",
  googleAdsRefreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN ?? "",
  metaAdsAccessToken: process.env.META_ADS_ACCESS_TOKEN ?? "",
  googleSheetsWebhookUrl: process.env.GOOGLE_SHEETS_WEBHOOK_URL ?? "",
  // Envio de conversao pelo servidor (server/_core/conversions.ts). Ausentes,
  // o envio simplesmente nao acontece — o lead continua indo para o banco, a
  // planilha e o e-mail. Onde obter cada um: docs/analytics.md.
  metaPixelId: process.env.META_PIXEL_ID ?? "",
  metaConversionsApiToken: process.env.META_CONVERSIONS_API_TOKEN ?? "",
  ga4MeasurementId: process.env.GA4_MEASUREMENT_ID ?? "",
  ga4ApiSecret: process.env.GA4_API_SECRET ?? "",
};

export const GOOGLE_ADS_DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
export const GOOGLE_ADS_REFRESH_TOKEN = process.env.GOOGLE_ADS_REFRESH_TOKEN;
export const META_ADS_ACCESS_TOKEN = process.env.META_ADS_ACCESS_TOKEN;

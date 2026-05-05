import { GoogleAdsApi, GoogleAdsClient } from "google-ads-api";
import { GOOGLE_ADS_DEVELOPER_TOKEN, GOOGLE_ADS_REFRESH_TOKEN } from "./env";

let client: GoogleAdsClient | null = null;

export async function getGoogleAdsClient(): Promise<GoogleAdsClient | null> {
  if (!GOOGLE_ADS_DEVELOPER_TOKEN || !GOOGLE_ADS_REFRESH_TOKEN) {
    console.warn("[Google Ads] Missing credentials");
    return null;
  }

  if (client) {
    return client;
  }

  try {
    client = new GoogleAdsApi({
      developer_token: GOOGLE_ADS_DEVELOPER_TOKEN,
      client_id: "251926900195-o3dao1pv47qbo8gsv4kktd9gs4ohk4o4.apps.googleusercontent.com",
      client_secret: "", // Not needed for refresh token flow
      refresh_token: GOOGLE_ADS_REFRESH_TOKEN,
    }).getClient();

    return client;
  } catch (error) {
    console.error("[Google Ads] Failed to initialize client:", error);
    return null;
  }
}

export async function fetchGoogleAdsCampaigns(customerId: string) {
  try {
    const client = await getGoogleAdsClient();
    if (!client) {
      throw new Error("Google Ads client not initialized");
    }

    const campaigns = await client.Campaign.list(customerId);
    return campaigns;
  } catch (error) {
    console.error("[Google Ads] Failed to fetch campaigns:", error);
    throw error;
  }
}

export async function fetchGoogleAdsMetrics(customerId: string, campaignId: string, dateFrom: string, dateTo: string) {
  try {
    const client = await getGoogleAdsClient();
    if (!client) {
      throw new Error("Google Ads client not initialized");
    }

    const metrics = await client.report({
      customer_id: customerId,
      query: `
        SELECT
          campaign.id,
          campaign.name,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.conversions,
          metrics.conversion_value
        FROM campaign
        WHERE campaign.id = '${campaignId}'
        AND segments.date BETWEEN '${dateFrom}' AND '${dateTo}'
      `,
    });

    return metrics;
  } catch (error) {
    console.error("[Google Ads] Failed to fetch metrics:", error);
    throw error;
  }
}

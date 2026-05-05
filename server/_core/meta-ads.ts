import axios from "axios";
import { META_ADS_ACCESS_TOKEN } from "./env";

const GRAPH_API_VERSION = "v19.0";
const GRAPH_API_URL = `https://graph.instagram.com/${GRAPH_API_VERSION}`;

interface MetaCampaign {
  id: string;
  name: string;
  status: string;
  daily_budget?: number;
  lifetime_budget?: number;
}

interface MetaMetrics {
  campaign_id: string;
  campaign_name: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  conversion_value: number;
  date: string;
}

export async function fetchMetaAdsCampaigns(accountId: string): Promise<MetaCampaign[]> {
  try {
    if (!META_ADS_ACCESS_TOKEN) {
      throw new Error("Meta Ads access token not configured");
    }

    const response = await axios.get(
      `${GRAPH_API_URL}/${accountId}/campaigns`,
      {
        params: {
          access_token: META_ADS_ACCESS_TOKEN,
          fields: "id,name,status,daily_budget,lifetime_budget",
        },
      }
    );

    return response.data.data || [];
  } catch (error) {
    console.error("[Meta Ads] Failed to fetch campaigns:", error);
    throw error;
  }
}

export async function fetchMetaAdsMetrics(
  accountId: string,
  campaignId: string,
  dateFrom: string,
  dateTo: string
): Promise<MetaMetrics[]> {
  try {
    if (!META_ADS_ACCESS_TOKEN) {
      throw new Error("Meta Ads access token not configured");
    }

    const response = await axios.get(
      `${GRAPH_API_URL}/${campaignId}/insights`,
      {
        params: {
          access_token: META_ADS_ACCESS_TOKEN,
          fields: "campaign_id,campaign_name,spend,impressions,clicks,conversions,conversion_value,date_start,date_stop",
          time_range: JSON.stringify({
            since: dateFrom,
            until: dateTo,
          }),
          time_increment: 1, // Daily
        },
      }
    );

    return (response.data.data || []).map((item: any) => ({
      campaign_id: item.campaign_id,
      campaign_name: item.campaign_name,
      spend: parseFloat(item.spend || "0"),
      impressions: parseInt(item.impressions || "0"),
      clicks: parseInt(item.clicks || "0"),
      conversions: parseInt(item.conversions || "0"),
      conversion_value: parseFloat(item.conversion_value || "0"),
      date: item.date_start,
    }));
  } catch (error) {
    console.error("[Meta Ads] Failed to fetch metrics:", error);
    throw error;
  }
}

export async function testMetaAdsConnection(): Promise<boolean> {
  try {
    if (!META_ADS_ACCESS_TOKEN) {
      console.warn("[Meta Ads] Access token not configured");
      return false;
    }

    const response = await axios.get(`${GRAPH_API_URL}/me`, {
      params: {
        access_token: META_ADS_ACCESS_TOKEN,
        fields: "id,name",
      },
    });

    return !!response.data.id;
  } catch (error) {
    console.error("[Meta Ads] Connection test failed:", error);
    return false;
  }
}

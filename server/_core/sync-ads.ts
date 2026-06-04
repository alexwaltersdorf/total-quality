import { getDb } from "../db";
import { campaignMetrics, adAccountCredentials } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { fetchMetaAdsMetrics, fetchMetaAdsCampaigns } from "./meta-ads";
import { format, subDays } from "date-fns";

export async function syncMetaAdsCampaigns() {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Sync] Database not available");
      return;
    }

    // Get Meta Ads credentials
    const credentials = await db
      .select()
      .from(adAccountCredentials)
      .where(eq(adAccountCredentials.platform, "meta_ads"));

    if (credentials.length === 0) {
      console.warn("[Sync] No Meta Ads credentials found");
      return;
    }

    for (const cred of credentials) {
      try {
        console.log(`[Sync] Syncing Meta Ads campaigns for account ${cred.accountId}`);

        // Fetch campaigns from Meta Ads API
        const campaigns = await fetchMetaAdsCampaigns(cred.accountId);

        if (!campaigns || campaigns.length === 0) {
          console.warn(`[Sync] No campaigns found for account ${cred.accountId}`);
          continue;
        }

        // Sync metrics for last 30 days
        const today = new Date();
        const thirtyDaysAgo = subDays(today, 30);
        const dateFrom = format(thirtyDaysAgo, "yyyy-MM-dd");
        const dateTo = format(today, "yyyy-MM-dd");

        for (const campaign of campaigns) {
          try {
            console.log(`[Sync] Fetching metrics for campaign ${campaign.name}`);

            const metrics = await fetchMetaAdsMetrics(
              cred.accountId,
              campaign.id,
              dateFrom,
              dateTo
            );

            // Insert or update metrics in database
            for (const metric of metrics) {
              try {
                const values: any = {
                  credentialId: cred.id,
                  campaignId: metric.campaign_id,
                  campaignName: metric.campaign_name,
                  platform: "meta_ads" as const,
                  spend: metric.spend,
                  impressions: metric.impressions,
                  clicks: metric.clicks,
                  conversions: metric.conversions,
                  cpc: metric.clicks > 0 ? metric.spend / metric.clicks : 0,
                  ctr: metric.impressions > 0 ? (metric.clicks / metric.impressions) * 100 : 0,
                  roas: metric.spend > 0 ? (metric.conversion_value / metric.spend) : 0,
                  conversionValue: metric.conversion_value,
                  date: metric.date,
                };
                await (db.insert(campaignMetrics) as any).values([values]);
              } catch (err: any) {
                // Ignore duplicate key errors
                if (!err.message?.includes("Duplicate entry")) {
                  console.error("Error inserting metric:", err);
                }
              }
            }

            console.log(`[Sync] Synced ${metrics.length} metrics for campaign ${campaign.name}`);
          } catch (error) {
            console.error(`[Sync] Error syncing campaign ${campaign.name}:`, error);
          }
        }

        console.log(`[Sync] Completed syncing Meta Ads campaigns for account ${cred.accountId}`);
      } catch (error) {
        console.error(`[Sync] Error syncing Meta Ads account ${cred.accountId}:`, error);
      }
    }
  } catch (error) {
    console.error("[Sync] Error syncing Meta Ads:", error);
  }
}

export async function syncGoogleAdsCampaigns() {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Sync] Database not available");
      return;
    }

    // Get Google Ads credentials
    const credentials = await db
      .select()
      .from(adAccountCredentials)
      .where(eq(adAccountCredentials.platform, "google_ads"));

    if (credentials.length === 0) {
      console.warn("[Sync] No Google Ads credentials found");
      return;
    }

    console.log("[Sync] Google Ads sync not yet implemented - requires additional setup");
    // TODO: Implement Google Ads API sync
  } catch (error) {
    console.error("[Sync] Error syncing Google Ads:", error);
  }
}

export async function syncAllAdsCampaigns() {
  console.log("[Sync] Starting ads campaigns sync...");
  await syncMetaAdsCampaigns();
  await syncGoogleAdsCampaigns();
  console.log("[Sync] Completed ads campaigns sync");
}

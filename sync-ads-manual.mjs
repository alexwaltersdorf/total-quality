import axios from "axios";

const META_ADS_ACCESS_TOKEN = process.env.META_ADS_ACCESS_TOKEN;
const ACCOUNT_ID = "1536672876562340";
const GRAPH_API_VERSION = "v19.0";
const GRAPH_API_URL = `https://graph.instagram.com/${GRAPH_API_VERSION}`;

async function fetchMetaAdsCampaigns() {
  try {
    console.log("🔄 Fetching Meta Ads campaigns...");

    const response = await axios.get(
      `${GRAPH_API_URL}/act_${ACCOUNT_ID}/campaigns`,
      {
        params: {
          access_token: META_ADS_ACCESS_TOKEN,
          fields: "id,name,status,daily_budget,lifetime_budget",
        },
      }
    );

    console.log(`✅ Found ${response.data.data.length} campaigns:`);
    response.data.data.forEach((campaign) => {
      console.log(`  - ${campaign.name} (ID: ${campaign.id}, Status: ${campaign.status})`);
    });

    return response.data.data;
  } catch (error) {
    console.error("❌ Error fetching campaigns:", error.response?.data || error.message);
    throw error;
  }
}

async function fetchMetaAdsMetrics(campaignId, dateFrom, dateTo) {
  try {
    console.log(`🔄 Fetching metrics for campaign ${campaignId}...`);

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

    console.log(`✅ Found ${response.data.data.length} metric records`);
    return response.data.data;
  } catch (error) {
    console.error("❌ Error fetching metrics:", error.response?.data || error.message);
    return [];
  }
}

async function testConnection() {
  try {
    console.log("🔄 Testing Meta Ads connection...");

    const response = await axios.get(`${GRAPH_API_URL}/me`, {
      params: {
        access_token: META_ADS_ACCESS_TOKEN,
        fields: "id,name",
      },
    });

    console.log(`✅ Connection successful! User: ${response.data.name}`);
    return true;
  } catch (error) {
    console.error("❌ Connection failed:", error.response?.data || error.message);
    return false;
  }
}

async function main() {
  console.log("🚀 Meta Ads Sync Manual\n");

  // Test connection
  const connected = await testConnection();
  if (!connected) {
    console.error("❌ Cannot proceed without valid connection");
    process.exit(1);
  }

  console.log("");

  // Fetch campaigns
  const campaigns = await fetchMetaAdsCampaigns();
  if (campaigns.length === 0) {
    console.error("❌ No campaigns found");
    process.exit(1);
  }

  console.log("");

  // Fetch metrics for each campaign
  const dateFrom = "2026-04-04";
  const dateTo = "2026-05-04";

  for (const campaign of campaigns) {
    const metrics = await fetchMetaAdsMetrics(campaign.id, dateFrom, dateTo);
    console.log(`   Total records: ${metrics.length}`);
    if (metrics.length > 0) {
      console.log(`   Sample: ${JSON.stringify(metrics[0], null, 2)}`);
    }
    console.log("");
  }

  console.log("✅ Sync complete!");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

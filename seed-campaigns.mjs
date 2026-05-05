import { getDb } from "./server/db.ts";
import { adAccountCredentials, campaignMetrics } from "./drizzle/schema.ts";
import { eq } from "drizzle-orm";

async function seedCampaigns() {
  try {
    console.log("🌱 Iniciando seed de campanhas...");

    const db = await getDb();
    if (!db) {
      console.error("❌ Não foi possível conectar ao banco de dados");
      process.exit(1);
    }

    // Primeiro, verificar se já existe credencial
    const existingCredentials = await db.select().from(adAccountCredentials);
    
    let credentialId;
    if (existingCredentials.length === 0) {
      console.log("Criando credencial de Google Ads...");
      const result = await db.insert(adAccountCredentials).values({
        platform: "google_ads",
        accountName: "Total Quality - Google Ads",
        accountId: "920-715-3288",
        developerToken: "demo_token",
        refreshToken: "demo_refresh",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      credentialId = result.insertId;
    } else {
      credentialId = existingCredentials[0].id;
    }

    console.log(`Usando credencial ID: ${credentialId}`);

    // Limpar métricas antigas
    await db.delete(campaignMetrics);

    // Dados de teste realistas
    const campaigns = [
      {
        name: "Check-up Básico - Google Ads",
        platform: "google_ads",
        spend: 1250.50,
        impressions: 45230,
        clicks: 1203,
        conversions: 45,
        cpc: 1.04,
        ctr: 2.66,
        roas: 6.48,
        conversionValue: 8100,
      },
      {
        name: "Exames de Sangue - Google Ads",
        platform: "google_ads",
        spend: 750.25,
        impressions: 28500,
        clicks: 612,
        conversions: 28,
        cpc: 1.23,
        ctr: 2.15,
        roas: 5.97,
        conversionValue: 4480,
      },
      {
        name: "Remarketing - Google Ads",
        platform: "google_ads",
        spend: 420.00,
        impressions: 15600,
        clicks: 234,
        conversions: 18,
        cpc: 1.79,
        ctr: 1.5,
        roas: 7.71,
        conversionValue: 3240,
      },
      {
        name: "Check-up Premium - Meta Ads",
        platform: "meta_ads",
        spend: 980.00,
        impressions: 52100,
        clicks: 1856,
        conversions: 38,
        cpc: 0.53,
        ctr: 3.56,
        roas: 6.98,
        conversionValue: 6840,
      },
      {
        name: "Tomografia - Meta Ads",
        platform: "meta_ads",
        spend: 650.00,
        impressions: 38200,
        clicks: 892,
        conversions: 22,
        cpc: 0.73,
        ctr: 2.33,
        roas: 6.09,
        conversionValue: 3960,
      },
      {
        name: "Ultrassom - Meta Ads",
        platform: "meta_ads",
        spend: 520.00,
        impressions: 31500,
        clicks: 756,
        conversions: 19,
        cpc: 0.69,
        ctr: 2.4,
        roas: 5.77,
        conversionValue: 3000,
      },
      {
        name: "Check-up Básico - TikTok",
        platform: "tiktok_ads",
        spend: 300.00,
        impressions: 125000,
        clicks: 3750,
        conversions: 112,
        cpc: 0.08,
        ctr: 3.0,
        roas: 9.33,
        conversionValue: 2800,
      },
    ];

    // Inserir métricas para os últimos 30 dias
    const today = new Date();
    let insertCount = 0;

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      for (const campaign of campaigns) {
        // Adicionar variação aleatória aos dados
        const variance = 0.8 + Math.random() * 0.4; // 80% a 120%
        
        await db.insert(campaignMetrics).values({
          credentialId,
          campaignId: `campaign_${campaign.name.replace(/\s+/g, "_").toLowerCase()}`,
          campaignName: campaign.name,
          platform: campaign.platform,
          spend: campaign.spend * variance,
          impressions: Math.round(campaign.impressions * variance),
          clicks: Math.round(campaign.clicks * variance),
          conversions: Math.round(campaign.conversions * variance),
          cpc: campaign.cpc,
          ctr: campaign.ctr,
          roas: campaign.roas,
          conversionValue: campaign.conversionValue * variance,
          date: dateStr,
          sessions: Math.round(campaign.clicks * 1.2),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        insertCount++;
      }
    }

    console.log(`✅ Seed concluído! ${insertCount} registros inseridos.`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao fazer seed:", error);
    process.exit(1);
  }
}

seedCampaigns();

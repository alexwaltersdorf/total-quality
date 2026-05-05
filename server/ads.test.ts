import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin_test",
    email: "admin@test.com",
    name: "Admin Test",
    loginMethod: "email",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Ads Router", () => {
  let credentialId: number;

  describe("credentials", () => {
    it("should create a Google Ads credential", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.ads.credentials.create({
        platform: "google_ads",
        accountName: "Test Google Ads Account",
        accountId: "920-715-3288",
        developerToken: "test_developer_token",
        refreshToken: "test_refresh_token",
      });

      expect(result).toBeDefined();
      credentialId = result.id;
    });

    it("should retrieve all credentials", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.ads.credentials.getAll({});
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it("should retrieve credentials by platform", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.ads.credentials.getAll({ platform: "google_ads" });
      expect(Array.isArray(result)).toBe(true);
    });

    it("should retrieve a credential by ID", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.ads.credentials.getById({ id: credentialId });
      expect(result).toBeDefined();
      expect(result?.accountId).toBe("920-715-3288");
    });

    it("should update a credential", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.ads.credentials.update({
        id: credentialId,
        accountName: "Updated Account Name",
      });

      expect(result).toBe(true);
    });

    it("should create a Meta Ads credential", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.ads.credentials.create({
        platform: "meta_ads",
        accountName: "Test Meta Ads Account",
        accountId: "1536672876562340",
        accessToken: "test_access_token",
      });

      expect(result).toBeDefined();
    });
  });

  describe("metrics", () => {
    it("should create a campaign metric", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.ads.metrics.create({
        credentialId,
        campaignId: "campaign_123",
        campaignName: "Test Campaign",
        platform: "google_ads",
        spend: 100.50,
        impressions: 5000,
        clicks: 250,
        conversions: 10,
        cpc: 0.40,
        ctr: 5.0,
        roas: 2.5,
        date: new Date().toISOString().split("T")[0],
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
    });

    it("should retrieve campaign metrics by credential", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.ads.metrics.getByCredential({
        credentialId,
        days: 30,
      });

      expect(Array.isArray(result)).toBe(true);
    });

    it("should get campaign metrics summary", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.ads.metrics.getSummary({
        credentialId,
        days: 30,
      });

      expect(result).toBeDefined();
      // Decimal fields come back as strings from the database
      expect(result.totalSpend).toBeDefined();
      expect(result.totalImpressions).toBeDefined();
      expect(result.totalClicks).toBeDefined();
    });
  });
});

import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock db module
vi.mock("./db", () => ({
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(null),
  createContact: vi.fn(),
  getContacts: vi.fn(),
  getContactsCount: vi.fn(),
  updateContactStatus: vi.fn(),
  createLead: vi.fn(),
  getLeads: vi.fn(),
  getLeadsCount: vi.fn(),
  getLeadsBySource: vi.fn(),
  getLeadsByChannel: vi.fn(),
  getLeadsByCampaign: vi.fn(),
  getLeadsByDay: vi.fn(),
  getLeadsByStatus: vi.fn(),
  updateLeadStatus: vi.fn(),
  updateLeadNotes: vi.fn(),
  createAnalyticsEvent: vi.fn(),
  getAnalyticsEvents: vi.fn(),
  getAnalyticsSummary: vi.fn(),
  getEventsByName: vi.fn(),
  createBlogView: vi.fn(),
  getBlogViewsBySlug: vi.fn(),
  getBlogViewCount: vi.fn(),
  upsertSession: vi.fn(),
  getSessionsCount: vi.fn(),
  getSessionsByChannel: vi.fn(),
  getSessionsByDay: vi.fn(),
  getAvgSessionDuration: vi.fn(),
  getBounceRate: vi.fn(),
  createPageView: vi.fn(),
  getTopPages: vi.fn(),
  getEngagementQuartiles: vi.fn(),
  createVideoView: vi.fn(),
  getVideoStats: vi.fn(),
  createConversion: vi.fn(),
  getConversionRate: vi.fn(),
  getConversionsByChannel: vi.fn(),
  getConversionsByType: vi.fn(),
  getDashboardKPIs: vi.fn(),
  createTag: vi.fn(),
  getAllTags: vi.fn(),
  getTagById: vi.fn(),
  updateTag: vi.fn(),
  deleteTag: vi.fn(),
  getTagsByCategory: vi.fn(),
  addTagToLead: vi.fn(),
  removeTagFromLead: vi.fn(),
  getTagsForLead: vi.fn(),
  getLeadsByTag: vi.fn(),
  getLeadCountByTag: vi.fn(),
  bulkAddTagsToLead: vi.fn(),
}));

// Mock sdk for session token creation
vi.mock("./_core/sdk", () => ({
  sdk: {
    createSessionToken: vi.fn().mockResolvedValue("mock-jwt-token-123"),
    authenticateRequest: vi.fn().mockRejectedValue(new Error("No session")),
  },
}));

// Mock env with admin credentials
vi.mock("./_core/env", () => ({
  ENV: {
    appId: "test-app",
    cookieSecret: "test-secret",
    databaseUrl: "",
    oAuthServerUrl: "",
    ownerOpenId: "",
    isProduction: false,
    forgeApiUrl: "",
    forgeApiKey: "",
    adminEmail: "alex@totalquality.me.br",
    adminPassword: "Total2@25",
  },
}));

type CookieCall = {
  name: string;
  value: string;
  options: Record<string, unknown>;
};

function createPublicContext(): { ctx: TrpcContext; setCookies: CookieCall[] } {
  const setCookies: CookieCall[] = [];

  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      cookie: (name: string, value: string, options: Record<string, unknown>) => {
        setCookies.push({ name, value, options });
      },
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };

  return { ctx, setCookies };
}

describe("auth.adminLogin", () => {
  it("accepts valid admin credentials and sets session cookie", async () => {
    const { ctx, setCookies } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.adminLogin({
      email: "alex@totalquality.me.br",
      password: "Total2@25",
    });

    expect(result).toEqual({ success: true, name: "Administrador" });
    expect(setCookies).toHaveLength(1);
    expect(setCookies[0]?.name).toBe("app_session_id");
    expect(setCookies[0]?.value).toBe("mock-jwt-token-123");
  });

  it("accepts email case-insensitively", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.adminLogin({
      email: "Alex@TotalQuality.me.br",
      password: "Total2@25",
    });

    expect(result).toEqual({ success: true, name: "Administrador" });
  });

  it("rejects wrong email", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.adminLogin({
        email: "wrong@email.com",
        password: "Total2@25",
      })
    ).rejects.toThrow("Email ou senha incorretos");
  });

  it("rejects wrong password", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.adminLogin({
        email: "alex@totalquality.me.br",
        password: "wrongpassword",
      })
    ).rejects.toThrow("Email ou senha incorretos");
  });

  it("rejects empty credentials", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    // Empty password should fail zod validation
    await expect(
      caller.auth.adminLogin({
        email: "alex@totalquality.me.br",
        password: "",
      })
    ).rejects.toThrow();
  });
});

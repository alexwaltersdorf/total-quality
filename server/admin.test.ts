import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock db functions
vi.mock("./db", () => ({
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
  createContact: vi.fn().mockResolvedValue({ id: 1 }),
  getContacts: vi.fn().mockResolvedValue([]),
  getContactsCount: vi.fn().mockResolvedValue(0),
  updateContactStatus: vi.fn().mockResolvedValue(true),
  createLead: vi.fn().mockResolvedValue({ id: 1 }),
  getLeads: vi.fn().mockResolvedValue([]),
  getLeadsCount: vi.fn().mockResolvedValue(0),
  getLeadsBySource: vi.fn().mockResolvedValue([]),
  getLeadsByChannel: vi.fn().mockResolvedValue([]),
  getLeadsByCampaign: vi.fn().mockResolvedValue([]),
  getLeadsByDay: vi.fn().mockResolvedValue([]),
  getLeadsByStatus: vi.fn().mockResolvedValue([]),
  updateLeadStatus: vi.fn().mockResolvedValue(true),
  updateLeadNotes: vi.fn().mockResolvedValue(true),
  createAnalyticsEvent: vi.fn().mockResolvedValue({ id: 1 }),
  getAnalyticsEvents: vi.fn().mockResolvedValue([]),
  getAnalyticsSummary: vi.fn().mockResolvedValue({ totalEvents: 0 }),
  getEventsByName: vi.fn().mockResolvedValue([]),
  createBlogView: vi.fn().mockResolvedValue({ id: 1 }),
  getBlogViewsBySlug: vi.fn().mockResolvedValue([]),
  getBlogViewCount: vi.fn().mockResolvedValue(0),
  upsertSession: vi.fn().mockResolvedValue({ id: 1 }),
  getSessionsCount: vi.fn().mockResolvedValue(0),
  getSessionsByChannel: vi.fn().mockResolvedValue([]),
  getSessionsByDay: vi.fn().mockResolvedValue([]),
  getAvgSessionDuration: vi.fn().mockResolvedValue(0),
  getBounceRate: vi.fn().mockResolvedValue(0),
  createPageView: vi.fn().mockResolvedValue({ id: 1 }),
  getTopPages: vi.fn().mockResolvedValue([]),
  getEngagementQuartiles: vi.fn().mockResolvedValue({ total: 0, q25: 0, q50: 0, q75: 0, q100: 0 }),
  createVideoView: vi.fn().mockResolvedValue({ id: 1 }),
  getVideoStats: vi.fn().mockResolvedValue([]),
  createConversion: vi.fn().mockResolvedValue({ id: 1 }),
  getConversionRate: vi.fn().mockResolvedValue(0),
  getConversionsByChannel: vi.fn().mockResolvedValue([]),
  getConversionsByType: vi.fn().mockResolvedValue([]),
  getDashboardKPIs: vi.fn().mockResolvedValue({
    totalLeads: 0, totalSessions: 0, conversionRate: 0, bounceRate: 0,
    avgSessionDuration: 0, engagementQuartiles: { total: 0, q25: 0, q50: 0, q75: 0, q100: 0 },
    leadsByChannel: [], leadsByDay: [], leadsStatus: [], topPages: [],
  }),
  createTag: vi.fn().mockResolvedValue({ id: 1 }),
  getAllTags: vi.fn().mockResolvedValue([{ id: 1, name: "Check-up", color: "#34A853", category: "Exame", description: null, createdAt: new Date(), updatedAt: new Date() }]),
  getTagById: vi.fn().mockResolvedValue({ id: 1, name: "Check-up", color: "#34A853", category: "Exame", description: null }),
  updateTag: vi.fn().mockResolvedValue(true),
  deleteTag: vi.fn().mockResolvedValue(true),
  getTagsByCategory: vi.fn().mockResolvedValue([{ category: "Exame", count: 3 }]),
  addTagToLead: vi.fn().mockResolvedValue({ id: 1 }),
  removeTagFromLead: vi.fn().mockResolvedValue(true),
  getTagsForLead: vi.fn().mockResolvedValue([{ id: 1, name: "Check-up", color: "#34A853" }]),
  getLeadsByTag: vi.fn().mockResolvedValue([]),
  getLeadCountByTag: vi.fn().mockResolvedValue([{ tagId: 1, tagName: "Check-up", count: 5 }]),
  bulkAddTagsToLead: vi.fn().mockResolvedValue(true),
}));

type CookieCall = { name: string; options: Record<string, unknown> };
type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: { "user-agent": "test-agent", "x-forwarded-for": "127.0.0.1" },
      ip: "127.0.0.1",
    } as any,
    res: {
      clearCookie: vi.fn(),
    } as any,
  };
}

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@totalquality.com",
    name: "Admin",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: {
      protocol: "https",
      headers: { "user-agent": "test-agent", "x-forwarded-for": "127.0.0.1" },
      ip: "127.0.0.1",
    } as any,
    res: {
      clearCookie: vi.fn(),
    } as any,
  };
}

describe("Contact API", () => {
  it("creates a contact (public)", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.contact.create({
      name: "João Silva",
      email: "joao@test.com",
      phone: "12988887777",
      subject: "Exame de sangue",
      message: "Gostaria de agendar um hemograma",
    });
    expect(result).toEqual({ id: 1 });
  });

  it("lists contacts (protected)", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.contact.list({ limit: 10, offset: 0 });
    expect(result).toHaveProperty("items");
    expect(result).toHaveProperty("total");
  });

  it("rejects contact list without auth", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.contact.list({ limit: 10, offset: 0 })).rejects.toThrow();
  });
});

describe("Lead API", () => {
  it("creates a lead with UTM params (public)", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.lead.create({
      source: "whatsapp_fab",
      page: "/",
      referrer: "https://www.google.com",
      utmSource: "google",
      utmMedium: "cpc",
      utmCampaign: "exames-caraguatatuba",
      channel: "Google Ads",
      sessionId: "sess_123",
    });
    expect(result).toEqual({ id: 1 });
  });

  it("creates a lead with contact info", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.lead.create({
      source: "form_contato",
      page: "/",
      name: "Maria Santos",
      phone: "12999998888",
      email: "maria@test.com",
      city: "Caraguatatuba",
      state: "SP",
    });
    expect(result).toEqual({ id: 1 });
  });

  it("lists leads (protected)", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.lead.list({ limit: 10, offset: 0, days: 30 });
    expect(result).toHaveProperty("items");
    expect(result).toHaveProperty("total");
  });

  it("gets lead stats (protected)", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.lead.stats({ days: 30 });
    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("byChannel");
    expect(result).toHaveProperty("byCampaign");
    expect(result).toHaveProperty("byDay");
    expect(result).toHaveProperty("byStatus");
  });

  it("updates lead status (protected)", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.lead.updateStatus({ id: 1, status: "contacted" });
    expect(result).toBe(true);
  });
});

describe("Session API", () => {
  it("tracks a session (public)", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.session.track({
      sessionId: "sess_test_123",
      utmSource: "facebook",
      utmMedium: "paid",
      utmCampaign: "campanha-verao",
      channel: "Facebook Ads",
      landingPage: "/",
      device: "mobile",
      browser: "Chrome",
      os: "Android",
    });
    expect(result).toEqual({ id: 1 });
  });

  it("gets session stats (protected)", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.session.stats({ days: 30 });
    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("byChannel");
    expect(result).toHaveProperty("byDay");
    expect(result).toHaveProperty("avgDuration");
    expect(result).toHaveProperty("bounceRate");
  });
});

describe("Analytics API", () => {
  it("tracks an event (public)", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.analytics.track({
      eventName: "page_view",
      eventCategory: "navigation",
      page: "/",
      sessionId: "sess_123",
    });
    expect(result).toEqual({ id: 1 });
  });

  it("tracks a page view with engagement (public)", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.analytics.trackPageView({
      sessionId: "sess_123",
      page: "/",
      title: "Home",
      durationMs: 45000,
      scrollDepthPct: 85,
      reached25pct: 1,
      reached50pct: 1,
      reached75pct: 1,
      reached100pct: 0,
    });
    expect(result).toEqual({ id: 1 });
  });

  it("tracks a video view (public)", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.analytics.trackVideoView({
      sessionId: "sess_123",
      page: "/",
      videoId: "video_hero",
      videoTitle: "Conheça a Total Quality",
      videoDurationMs: 120000,
      watchTimeMs: 90000,
      reached25pct: 1,
      reached50pct: 1,
      reached75pct: 1,
      reached100pct: 0,
    });
    expect(result).toEqual({ id: 1 });
  });

  it("gets engagement data (protected)", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.analytics.engagement({ days: 30 });
    expect(result).toHaveProperty("topPages");
    expect(result).toHaveProperty("quartiles");
    expect(result).toHaveProperty("videoStats");
  });
});

describe("Conversion API", () => {
  it("tracks a conversion (public)", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.conversion.track({
      sessionId: "sess_123",
      conversionType: "whatsapp_click",
      utmSource: "instagram",
      utmCampaign: "stories-exames",
      channel: "Instagram Ads",
      page: "/",
    });
    expect(result).toEqual({ id: 1 });
  });

  it("gets conversion stats (protected)", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.conversion.stats({ days: 30 });
    expect(result).toHaveProperty("rate");
    expect(result).toHaveProperty("byChannel");
    expect(result).toHaveProperty("byType");
  });
});

describe("Dashboard API", () => {
  it("gets dashboard KPIs (protected)", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.dashboard.kpis({ days: 30 });
    expect(result).toHaveProperty("totalLeads");
    expect(result).toHaveProperty("totalSessions");
    expect(result).toHaveProperty("conversionRate");
    expect(result).toHaveProperty("bounceRate");
    expect(result).toHaveProperty("avgSessionDuration");
    expect(result).toHaveProperty("engagementQuartiles");
    expect(result).toHaveProperty("leadsByChannel");
    expect(result).toHaveProperty("leadsByDay");
    expect(result).toHaveProperty("leadsStatus");
    expect(result).toHaveProperty("topPages");
  });

  it("rejects dashboard KPIs without auth", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.dashboard.kpis({ days: 30 })).rejects.toThrow();
  });
});

describe("Date Range Filter", () => {
  it("dashboard KPIs with dateFrom/dateTo (protected)", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.dashboard.kpis({ dateFrom: "2026-03-01", dateTo: "2026-03-31" });
    expect(result).toHaveProperty("totalLeads");
    expect(result).toHaveProperty("totalSessions");
  });

  it("lead stats with dateFrom/dateTo (protected)", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.lead.stats({ dateFrom: "2026-01-01", dateTo: "2026-04-15" });
    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("byChannel");
  });

  it("session stats with dateFrom/dateTo (protected)", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.session.stats({ dateFrom: "2026-04-01", dateTo: "2026-04-15" });
    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("byChannel");
  });

  it("engagement with dateFrom/dateTo (protected)", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.analytics.engagement({ dateFrom: "2026-04-01", dateTo: "2026-04-15" });
    expect(result).toHaveProperty("topPages");
    expect(result).toHaveProperty("quartiles");
  });

  it("conversion stats with dateFrom/dateTo (protected)", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.conversion.stats({ dateFrom: "2026-02-01", dateTo: "2026-02-28" });
    expect(result).toHaveProperty("rate");
    expect(result).toHaveProperty("byChannel");
  });

  it("lead list with dateFrom/dateTo (protected)", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.lead.list({ limit: 10, offset: 0, dateFrom: "2026-03-01", dateTo: "2026-03-31" });
    expect(result).toHaveProperty("items");
    expect(result).toHaveProperty("total");
  });

  it("dashboard KPIs with days only (backward compatible)", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.dashboard.kpis({ days: 7 });
    expect(result).toHaveProperty("totalLeads");
  });

  it("dashboard KPIs with no filter defaults to 30 days", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.dashboard.kpis({});
    expect(result).toHaveProperty("totalLeads");
  });
});

describe("Blog API", () => {
  it("tracks a blog view (public)", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.blog.trackView({
      slug: "check-up-preventivo",
      sessionId: "sess_123",
    });
    expect(result).toEqual({ id: 1 });
  });

  it("gets blog view count (public)", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.blog.viewCount({ slug: "check-up-preventivo" });
    expect(result).toHaveProperty("count");
  });
});

// ===================== TAG TESTS =====================
describe("Tag CRUD API", () => {
  it("creates a tag (protected)", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.tag.create({
      name: "Check-up",
      color: "#34A853",
      category: "Exame",
      description: "Leads interessados em check-up",
    });
    expect(result).toHaveProperty("id");
  });

  it("lists all tags (protected)", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.tag.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("name");
    expect(result[0]).toHaveProperty("color");
  });

  it("gets a tag by id (protected)", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.tag.getById({ id: 1 });
    expect(result).toHaveProperty("name", "Check-up");
  });

  it("updates a tag (protected)", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.tag.update({
      id: 1,
      name: "Check-up Completo",
      color: "#10B981",
    });
    expect(result).toBe(true);
  });

  it("deletes a tag (protected)", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.tag.delete({ id: 1 });
    expect(result).toBe(true);
  });

  it("gets tag categories (protected)", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.tag.categories();
    expect(Array.isArray(result)).toBe(true);
  });

  it("gets tag stats with date filter (protected)", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.tag.stats({ days: 30 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("rejects tag creation without auth", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.tag.create({ name: "Test", color: "#FF0000" })).rejects.toThrow();
  });
});

describe("Lead Tag Association API", () => {
  it("adds a tag to a lead (protected)", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.leadTag.add({ leadId: 1, tagId: 1 });
    expect(result).toHaveProperty("id");
  });

  it("removes a tag from a lead (protected)", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.leadTag.remove({ leadId: 1, tagId: 1 });
    expect(result).toBe(true);
  });

  it("gets tags for a lead (protected)", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.leadTag.getForLead({ leadId: 1 });
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty("name");
    expect(result[0]).toHaveProperty("color");
  });

  it("bulk sets tags for a lead (protected)", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.leadTag.bulkSet({ leadId: 1, tagIds: [1, 2, 3] });
    expect(result).toBe(true);
  });

  it("gets leads by tag with date filter (protected)", async () => {
    const caller = appRouter.createCaller(createAuthContext());
    const result = await caller.leadTag.leadsByTag({ tagId: 1, days: 30 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("rejects lead tag operations without auth", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(caller.leadTag.add({ leadId: 1, tagId: 1 })).rejects.toThrow();
  });
});

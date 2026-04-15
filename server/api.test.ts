import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {
        "user-agent": "vitest-test-agent",
        "x-forwarded-for": "127.0.0.1",
      },
      ip: "127.0.0.1",
    } as unknown as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as unknown as TrpcContext["res"],
  };
}

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-admin-user",
    email: "alex@totalquality.med.br",
    name: "Alex Admin",
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
      headers: {
        "user-agent": "vitest-test-agent",
        "x-forwarded-for": "127.0.0.1",
      },
      ip: "127.0.0.1",
    } as unknown as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as unknown as TrpcContext["res"],
  };
}

describe("contact.create", () => {
  it("accepts valid contact data and returns success", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contact.create({
      name: "João Silva",
      email: "joao@example.com",
      phone: "(12) 99999-0000",
      subject: "Tomografia",
      message: "Gostaria de agendar uma tomografia.",
    });

    expect(result).toEqual({ success: true });
  });

  it("rejects invalid email", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.contact.create({
        name: "João",
        email: "invalid-email",
        message: "Teste",
      })
    ).rejects.toThrow();
  });

  it("rejects empty name", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.contact.create({
        name: "",
        email: "test@test.com",
        message: "Teste",
      })
    ).rejects.toThrow();
  });
});

describe("lead.create", () => {
  it("accepts valid lead data and returns success", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.lead.create({
      source: "whatsapp_fab",
      page: "/",
      referrer: "https://google.com",
    });

    expect(result).toEqual({ success: true });
  });

  it("accepts lead without referrer", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.lead.create({
      source: "hero_cta",
      page: "/checkup",
    });

    expect(result).toEqual({ success: true });
  });
});

describe("analytics.track", () => {
  it("accepts valid analytics event and returns success", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.analytics.track({
      eventName: "page_view",
      eventCategory: "navigation",
      eventData: { page: "Home" },
      page: "/",
      sessionId: "sess_test_123",
    });

    expect(result).toEqual({ success: true });
  });

  it("accepts minimal analytics event", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.analytics.track({
      eventName: "cta_click",
    });

    expect(result).toEqual({ success: true });
  });
});

describe("blog.trackView", () => {
  it("accepts valid blog view and returns success", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.blog.trackView({
      slug: "importancia-check-up-preventivo",
      sessionId: "sess_test_123",
    });

    expect(result).toEqual({ success: true });
  });
});

describe("blog.viewCount", () => {
  it("returns a count for a given slug", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.blog.viewCount({
      slug: "importancia-check-up-preventivo",
    });

    expect(result).toHaveProperty("count");
    expect(typeof result.count).toBe("number");
  });
});

describe("protected routes require auth", () => {
  it("contact.list requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.contact.list()).rejects.toThrow();
  });

  it("lead.list requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.lead.list()).rejects.toThrow();
  });

  it("analytics.events requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.analytics.events()).rejects.toThrow();
  });

  it("analytics.summary requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.analytics.summary()).rejects.toThrow();
  });

  it("lead.stats requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.lead.stats()).rejects.toThrow();
  });

  it("blog.viewStats requires authentication", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.blog.viewStats()).rejects.toThrow();
  });
});

describe("authenticated protected routes", () => {
  it("contact.list returns items and total", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contact.list();

    expect(result).toHaveProperty("items");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.items)).toBe(true);
  });

  it("lead.stats returns stats object", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.lead.stats();

    expect(result).toHaveProperty("total");
    expect(result).toHaveProperty("totalSince");
    expect(result).toHaveProperty("bySource");
  });

  it("analytics.summary returns summary object", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.analytics.summary();

    expect(result).toHaveProperty("totalEvents");
    expect(result).toHaveProperty("pageViews");
    expect(result).toHaveProperty("uniqueSessions");
    expect(result).toHaveProperty("eventsByName");
  });
});

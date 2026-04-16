import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { ENV } from "./_core/env";
import { sdk } from "./_core/sdk";
import { z } from "zod";
import bcrypt from "bcryptjs";
import {
  upsertUser,
  createContact, getContacts, getContactsCount, updateContactStatus,
  createLead, getLeads, getLeadsCount, getLeadsBySource, getLeadsByChannel,
  getLeadsByCampaign, getLeadsByDay, getLeadsByStatus, updateLeadStatus, updateLeadNotes,
  createAnalyticsEvent, getAnalyticsEvents, getAnalyticsSummary, getEventsByName,
  createBlogView, getBlogViewsBySlug, getBlogViewCount,
  upsertSession, getSessionsCount, getSessionsByChannel, getSessionsByDay, getAvgSessionDuration, getBounceRate,
  createPageView, getTopPages, getEngagementQuartiles,
  createVideoView, getVideoStats,
  createConversion, getConversionRate, getConversionsByChannel, getConversionsByType,
  getDashboardKPIs,
  createTag, getAllTags, getTagById, updateTag, deleteTag, getTagsByCategory,
  addTagToLead, removeTagFromLead, getTagsForLead, getLeadsByTag, getLeadCountByTag, bulkAddTagsToLead,
} from "./db";

// Shared date filter schema: accepts either dateFrom/dateTo or days (backward compatible)
const dateFilterSchema = z.object({
  days: z.number().min(1).max(365).default(30).optional(),
  dateFrom: z.string().optional(), // ISO date string e.g. "2026-01-01"
  dateTo: z.string().optional(),   // ISO date string e.g. "2026-01-31"
}).optional();

// Helper to resolve date range from input
function resolveDateRange(input?: { days?: number; dateFrom?: string; dateTo?: string }): { since: Date; until?: Date } {
  if (input?.dateFrom) {
    const since = new Date(input.dateFrom);
    since.setHours(0, 0, 0, 0);
    let until: Date | undefined;
    if (input.dateTo) {
      until = new Date(input.dateTo);
      until.setHours(23, 59, 59, 999);
    }
    return { since, until };
  }
  const days = input?.days ?? 30;
  return { since: new Date(Date.now() - days * 86400000) };
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    adminLogin: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const adminEmail = ENV.adminEmail;
        const adminPassword = ENV.adminPassword;

        if (!adminEmail || !adminPassword) {
          throw new Error("Admin credentials not configured");
        }

        // Compare email (case-insensitive)
        if (input.email.toLowerCase() !== adminEmail.toLowerCase()) {
          throw new Error("Email ou senha incorretos");
        }

        // Compare password directly (env stored)
        if (input.password !== adminPassword) {
          throw new Error("Email ou senha incorretos");
        }

        // Upsert admin user in DB
        const openId = `admin_${adminEmail.toLowerCase()}`;
        await upsertUser({
          openId,
          name: "Administrador",
          email: adminEmail,
          loginMethod: "email",
          role: "admin",
          lastSignedIn: new Date(),
        });

        // Create JWT session token
        const token = await sdk.createSessionToken(openId, {
          name: "Administrador",
          expiresInMs: ONE_YEAR_MS,
        });

        // Set session cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });

        return { success: true, name: "Administrador" } as const;
      }),
  }),

  // ===================== CONTACTS =====================
  contact: router({
    create: publicProcedure
      .input(z.object({
        name: z.string().min(2).max(255),
        email: z.string().email().max(320),
        phone: z.string().max(30).optional(),
        subject: z.string().max(255).optional(),
        message: z.string().min(5),
      }))
      .mutation(async ({ input }) => createContact(input)),

    list: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(100).default(50), offset: z.number().min(0).default(0) }).optional())
      .query(async ({ input }) => {
        const { limit = 50, offset = 0 } = input ?? {};
        const [items, total] = await Promise.all([getContacts(limit, offset), getContactsCount()]);
        return { items, total };
      }),

    updateStatus: protectedProcedure
      .input(z.object({ id: z.number(), status: z.enum(["new", "read", "replied", "archived"]) }))
      .mutation(async ({ input }) => updateContactStatus(input.id, input.status)),
  }),

  // ===================== LEADS =====================
  lead: router({
    create: publicProcedure
      .input(z.object({
        source: z.string().max(100),
        page: z.string().max(255),
        referrer: z.string().max(500).optional(),
        name: z.string().max(255).optional(),
        phone: z.string().max(30).optional(),
        email: z.string().max(320).optional(),
        address: z.string().max(500).optional(),
        city: z.string().max(100).optional(),
        state: z.string().max(50).optional(),
        zipCode: z.string().max(20).optional(),
        utmSource: z.string().max(200).optional(),
        utmMedium: z.string().max(200).optional(),
        utmCampaign: z.string().max(500).optional(),
        utmTerm: z.string().max(500).optional(),
        utmContent: z.string().max(500).optional(),
        channel: z.string().max(100).optional(),
        sessionId: z.string().max(100).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return createLead({
          ...input,
          userAgent: ctx.req.headers["user-agent"] ?? null,
          ipAddress: (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? ctx.req.ip ?? null,
        });
      }),

    list: protectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        channel: z.string().optional(),
        leadStatus: z.string().optional(),
        days: z.number().min(1).max(365).optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        const { limit = 50, offset = 0, channel, leadStatus } = input ?? {};
        const { since, until } = resolveDateRange(input);
        const hasDates = input?.days || input?.dateFrom;
        const [items, total] = await Promise.all([
          getLeads(limit, offset, { channel: channel || undefined, leadStatus: leadStatus || undefined, since: hasDates ? since : undefined, until }),
          getLeadsCount(hasDates ? since : undefined, until),
        ]);
        return { items, total };
      }),

    stats: protectedProcedure
      .input(dateFilterSchema)
      .query(async ({ input }) => {
        const { since, until } = resolveDateRange(input);
        const [total, totalSince, bySource, byChannel, byCampaign, byDay, byStatus] = await Promise.all([
          getLeadsCount(),
          getLeadsCount(since, until),
          getLeadsBySource(),
          getLeadsByChannel(since, until),
          getLeadsByCampaign(since, until),
          getLeadsByDay(since, until),
          getLeadsByStatus(),
        ]);
        return { total, totalSince, bySource, byChannel, byCampaign, byDay, byStatus };
      }),

    updateStatus: protectedProcedure
      .input(z.object({ id: z.number(), status: z.enum(["new", "contacted", "qualified", "converted", "lost"]) }))
      .mutation(async ({ input }) => updateLeadStatus(input.id, input.status)),

    updateNotes: protectedProcedure
      .input(z.object({ id: z.number(), notes: z.string() }))
      .mutation(async ({ input }) => updateLeadNotes(input.id, input.notes)),
  }),

  // ===================== SESSIONS =====================
  session: router({
    track: publicProcedure
      .input(z.object({
        sessionId: z.string().max(100),
        utmSource: z.string().max(200).optional(),
        utmMedium: z.string().max(200).optional(),
        utmCampaign: z.string().max(500).optional(),
        utmTerm: z.string().max(500).optional(),
        utmContent: z.string().max(500).optional(),
        channel: z.string().max(100).optional(),
        referrer: z.string().max(500).optional(),
        landingPage: z.string().max(255).optional(),
        device: z.string().max(50).optional(),
        browser: z.string().max(100).optional(),
        os: z.string().max(100).optional(),
        totalDurationMs: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return upsertSession({
          ...input,
          userAgent: ctx.req.headers["user-agent"] ?? null,
          ipAddress: (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? ctx.req.ip ?? null,
        });
      }),

    stats: protectedProcedure
      .input(dateFilterSchema)
      .query(async ({ input }) => {
        const { since, until } = resolveDateRange(input);
        const [total, byChannel, byDay, avgDuration, bounceRate_] = await Promise.all([
          getSessionsCount(since, until),
          getSessionsByChannel(since, until),
          getSessionsByDay(since, until),
          getAvgSessionDuration(since, until),
          getBounceRate(since, until),
        ]);
        return { total, byChannel, byDay, avgDuration, bounceRate: bounceRate_ };
      }),
  }),

  // ===================== ANALYTICS =====================
  analytics: router({
    track: publicProcedure
      .input(z.object({
        eventName: z.string().max(100),
        eventCategory: z.string().max(100).optional(),
        eventData: z.any().optional(),
        page: z.string().max(255).optional(),
        sessionId: z.string().max(100).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return createAnalyticsEvent({
          ...input,
          userAgent: ctx.req.headers["user-agent"] ?? null,
          ipAddress: (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? ctx.req.ip ?? null,
        });
      }),

    trackPageView: publicProcedure
      .input(z.object({
        sessionId: z.string().max(100),
        page: z.string().max(255),
        title: z.string().max(500).optional(),
        durationMs: z.number().default(0),
        scrollDepthPct: z.number().default(0),
        reached25pct: z.number().default(0),
        reached50pct: z.number().default(0),
        reached75pct: z.number().default(0),
        reached100pct: z.number().default(0),
        isExit: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return createPageView({
          ...input,
          userAgent: ctx.req.headers["user-agent"] ?? null,
          ipAddress: (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? ctx.req.ip ?? null,
        });
      }),

    trackVideoView: publicProcedure
      .input(z.object({
        sessionId: z.string().max(100),
        page: z.string().max(255).optional(),
        videoId: z.string().max(255),
        videoTitle: z.string().max(500).optional(),
        videoDurationMs: z.number().default(0),
        watchTimeMs: z.number().default(0),
        reached25pct: z.number().default(0),
        reached50pct: z.number().default(0),
        reached75pct: z.number().default(0),
        reached100pct: z.number().default(0),
        utmSource: z.string().max(200).optional(),
        utmCampaign: z.string().max(500).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return createVideoView({
          ...input,
          userAgent: ctx.req.headers["user-agent"] ?? null,
          ipAddress: (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? ctx.req.ip ?? null,
        });
      }),

    events: protectedProcedure
      .input(z.object({ limit: z.number().min(1).max(500).default(100), offset: z.number().min(0).default(0) }).optional())
      .query(async ({ input }) => {
        const { limit = 100, offset = 0 } = input ?? {};
        return getAnalyticsEvents(limit, offset);
      }),

    summary: protectedProcedure
      .input(dateFilterSchema)
      .query(async ({ input }) => {
        const { since, until } = resolveDateRange(input);
        const [summary, eventsByName] = await Promise.all([getAnalyticsSummary(since), getEventsByName(since)]);
        return { ...summary, eventsByName };
      }),

    engagement: protectedProcedure
      .input(dateFilterSchema)
      .query(async ({ input }) => {
        const { since, until } = resolveDateRange(input);
        const [topPages_, quartiles, videoStats_] = await Promise.all([
          getTopPages(since, 20),
          getEngagementQuartiles(since),
          getVideoStats(since),
        ]);
        return { topPages: topPages_, quartiles, videoStats: videoStats_ };
      }),
  }),

  // ===================== BLOG =====================
  blog: router({
    trackView: publicProcedure
      .input(z.object({ slug: z.string().max(255), sessionId: z.string().max(100).optional() }))
      .mutation(async ({ input, ctx }) => {
        return createBlogView({
          ...input,
          userAgent: ctx.req.headers["user-agent"] ?? null,
          ipAddress: (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? ctx.req.ip ?? null,
        });
      }),

    viewCount: publicProcedure
      .input(z.object({ slug: z.string().max(255) }))
      .query(async ({ input }) => ({ count: await getBlogViewCount(input.slug) })),

    viewStats: protectedProcedure.query(async () => getBlogViewsBySlug()),
  }),

  // ===================== CONVERSIONS =====================
  conversion: router({
    track: publicProcedure
      .input(z.object({
        sessionId: z.string().max(100),
        conversionType: z.string().max(100),
        utmSource: z.string().max(200).optional(),
        utmMedium: z.string().max(200).optional(),
        utmCampaign: z.string().max(500).optional(),
        channel: z.string().max(100).optional(),
        page: z.string().max(255).optional(),
      }))
      .mutation(async ({ input }) => createConversion(input)),

    stats: protectedProcedure
      .input(dateFilterSchema)
      .query(async ({ input }) => {
        const { since, until } = resolveDateRange(input);
        const [rate, byChannel, byType] = await Promise.all([
          getConversionRate(since),
          getConversionsByChannel(since),
          getConversionsByType(since),
        ]);
        return { rate, byChannel, byType };
      }),
  }),

  // ===================== TAGS =====================
  tag: router({
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(100),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#9B212B"),
        category: z.string().max(100).optional(),
        description: z.string().max(500).optional(),
      }))
      .mutation(async ({ input }) => createTag(input)),
    list: protectedProcedure
      .query(async () => getAllTags()),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => getTagById(input.id)),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).max(100).optional(),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
        category: z.string().max(100).optional(),
        description: z.string().max(500).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return updateTag(id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => deleteTag(input.id)),
    categories: protectedProcedure
      .query(async () => getTagsByCategory()),
    stats: protectedProcedure
      .input(dateFilterSchema)
      .query(async ({ input }) => {
        const { since, until } = resolveDateRange(input);
        return getLeadCountByTag(since, until);
      }),
  }),
  // ===================== LEAD TAGS =====================
  leadTag: router({
    add: protectedProcedure
      .input(z.object({ leadId: z.number(), tagId: z.number() }))
      .mutation(async ({ input }) => addTagToLead(input.leadId, input.tagId)),
    remove: protectedProcedure
      .input(z.object({ leadId: z.number(), tagId: z.number() }))
      .mutation(async ({ input }) => removeTagFromLead(input.leadId, input.tagId)),
    getForLead: protectedProcedure
      .input(z.object({ leadId: z.number() }))
      .query(async ({ input }) => getTagsForLead(input.leadId)),
    bulkSet: protectedProcedure
      .input(z.object({ leadId: z.number(), tagIds: z.array(z.number()) }))
      .mutation(async ({ input }) => bulkAddTagsToLead(input.leadId, input.tagIds)),
    leadsByTag: protectedProcedure
      .input(z.object({
        tagId: z.number(),
        days: z.number().min(1).max(365).default(30).optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      }))
      .query(async ({ input }) => {
        const { tagId, ...rest } = input;
        const { since, until } = resolveDateRange(rest);
        return getLeadsByTag(tagId, since, until);
      }),
  }),
  // ===================== DASHBOARD =====================
  dashboard: router({
    kpis: protectedProcedure
      .input(dateFilterSchema)
      .query(async ({ input }) => {
        const { since, until } = resolveDateRange(input);
        return getDashboardKPIs(since, until);
      }),
  }),
});

export type AppRouter = typeof appRouter;

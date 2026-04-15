import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  createContact, getContacts, getContactsCount, updateContactStatus,
  createLead, getLeads, getLeadsCount, getLeadsBySource,
  createAnalyticsEvent, getAnalyticsEvents, getAnalyticsSummary, getEventsByName,
  createBlogView, getBlogViewsBySlug, getBlogViewCount,
} from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
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
      .mutation(async ({ input, ctx }) => {
        return createContact(input);
      }),

    list: protectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional())
      .query(async ({ input }) => {
        const { limit = 50, offset = 0 } = input ?? {};
        const [items, total] = await Promise.all([
          getContacts(limit, offset),
          getContactsCount(),
        ]);
        return { items, total };
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["new", "read", "replied", "archived"]),
      }))
      .mutation(async ({ input }) => {
        return updateContactStatus(input.id, input.status);
      }),
  }),

  // ===================== LEADS =====================
  lead: router({
    create: publicProcedure
      .input(z.object({
        source: z.string().max(100),
        page: z.string().max(255),
        referrer: z.string().max(500).optional(),
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
      }).optional())
      .query(async ({ input }) => {
        const { limit = 50, offset = 0 } = input ?? {};
        const [items, total] = await Promise.all([
          getLeads(limit, offset),
          getLeadsCount(),
        ]);
        return { items, total };
      }),

    stats: protectedProcedure
      .input(z.object({
        days: z.number().min(1).max(365).default(30),
      }).optional())
      .query(async ({ input }) => {
        const days = input?.days ?? 30;
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const [total, totalSince, bySource] = await Promise.all([
          getLeadsCount(),
          getLeadsCount(since),
          getLeadsBySource(),
        ]);
        return { total, totalSince, bySource };
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

    events: protectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(500).default(100),
        offset: z.number().min(0).default(0),
      }).optional())
      .query(async ({ input }) => {
        const { limit = 100, offset = 0 } = input ?? {};
        return getAnalyticsEvents(limit, offset);
      }),

    summary: protectedProcedure
      .input(z.object({
        days: z.number().min(1).max(365).default(30),
      }).optional())
      .query(async ({ input }) => {
        const days = input?.days ?? 30;
        const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const [summary, eventsByName] = await Promise.all([
          getAnalyticsSummary(since),
          getEventsByName(since),
        ]);
        return { ...summary, eventsByName };
      }),
  }),

  // ===================== BLOG =====================
  blog: router({
    trackView: publicProcedure
      .input(z.object({
        slug: z.string().max(255),
        sessionId: z.string().max(100).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return createBlogView({
          ...input,
          userAgent: ctx.req.headers["user-agent"] ?? null,
          ipAddress: (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? ctx.req.ip ?? null,
        });
      }),

    viewCount: publicProcedure
      .input(z.object({
        slug: z.string().max(255),
      }))
      .query(async ({ input }) => {
        return { count: await getBlogViewCount(input.slug) };
      }),

    viewStats: protectedProcedure
      .query(async () => {
        return getBlogViewsBySlug();
      }),
  }),
});

export type AppRouter = typeof appRouter;

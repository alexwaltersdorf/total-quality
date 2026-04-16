import { eq, desc, sql, and, gte, lte, count, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  InsertContact, contacts,
  InsertLead, leads,
  InsertAnalyticsEvent, analyticsEvents,
  InsertBlogView, blogViews,
  InsertSession, sessions,
  InsertPageView, pageViews,
  InsertVideoView, videoViews,
  InsertConversion, conversions,
  InsertTag, tags,
  InsertLeadTag, leadTags,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ===================== USERS =====================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; } else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ===================== CONTACTS =====================

export async function createContact(contact: InsertContact) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(contacts).values(contact);
  return { success: true };
}

export async function getContacts(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contacts).orderBy(desc(contacts.createdAt)).limit(limit).offset(offset);
}

export async function getContactsCount(since?: Date) {
  const db = await getDb();
  if (!db) return 0;
  const conditions = since ? [gte(contacts.createdAt, since)] : [];
  const query = conditions.length > 0
    ? db.select({ total: count() }).from(contacts).where(and(...conditions))
    : db.select({ total: count() }).from(contacts);
  const result = await query;
  return result[0]?.total ?? 0;
}

export async function updateContactStatus(id: number, status: "new" | "read" | "replied" | "archived") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(contacts).set({ status }).where(eq(contacts.id, id));
  return { success: true };
}

// ===================== LEADS =====================

export async function createLead(lead: InsertLead) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(leads).values(lead);
  return { success: true };
}

export async function getLeads(limit = 50, offset = 0, filters?: { channel?: string; leadStatus?: string; since?: Date; until?: Date }) {
  const db = await getDb();
  if (!db) return [];
  const conditions: any[] = [];
  if (filters?.channel) conditions.push(eq(leads.channel, filters.channel));
  if (filters?.leadStatus) conditions.push(eq(leads.leadStatus, filters.leadStatus as any));
  if (filters?.since) conditions.push(gte(leads.createdAt, filters.since));
  if (filters?.until) conditions.push(lte(leads.createdAt, filters.until));
  const query = conditions.length > 0
    ? db.select().from(leads).where(and(...conditions)).orderBy(desc(leads.createdAt)).limit(limit).offset(offset)
    : db.select().from(leads).orderBy(desc(leads.createdAt)).limit(limit).offset(offset);
  return query;
}

export async function getLeadsCount(since?: Date, until?: Date) {
  const db = await getDb();
  if (!db) return 0;
  const conditions: any[] = [];
  if (since) conditions.push(gte(leads.createdAt, since));
  if (until) conditions.push(lte(leads.createdAt, until));
  const query = conditions.length > 0
    ? db.select({ total: count() }).from(leads).where(and(...conditions))
    : db.select({ total: count() }).from(leads);
  const result = await query;
  return result[0]?.total ?? 0;
}

export async function getLeadsByChannel(since?: Date, until?: Date) {
  const db = await getDb();
  if (!db) return [];
  const conditions: any[] = [];
  if (since) conditions.push(gte(leads.createdAt, since));
  if (until) conditions.push(lte(leads.createdAt, until));
  const query = conditions.length > 0
    ? db.select({ channel: leads.channel, total: count() }).from(leads).where(and(...conditions)).groupBy(leads.channel).orderBy(desc(count()))
    : db.select({ channel: leads.channel, total: count() }).from(leads).groupBy(leads.channel).orderBy(desc(count()));
  return query;
}

export async function getLeadsByCampaign(since?: Date, until?: Date) {
  const db = await getDb();
  if (!db) return [];
  const conditions: any[] = [];
  if (since) conditions.push(gte(leads.createdAt, since));
  if (until) conditions.push(lte(leads.createdAt, until));
  const query = conditions.length > 0
    ? db.select({ utmCampaign: leads.utmCampaign, utmSource: leads.utmSource, channel: leads.channel, total: count() }).from(leads).where(and(...conditions)).groupBy(leads.utmCampaign, leads.utmSource, leads.channel).orderBy(desc(count()))
    : db.select({ utmCampaign: leads.utmCampaign, utmSource: leads.utmSource, channel: leads.channel, total: count() }).from(leads).groupBy(leads.utmCampaign, leads.utmSource, leads.channel).orderBy(desc(count()));
  return query;
}

export async function getLeadsBySource() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ source: leads.source, total: count() }).from(leads).groupBy(leads.source).orderBy(desc(count()));
}

export async function getLeadsByDay(since: Date, until?: Date) {
  const db = await getDb();
  if (!db) return [];
  const result = until
    ? await db.execute(sql`SELECT DATE(createdAt) as date, COUNT(*) as total FROM leads WHERE createdAt >= ${since} AND createdAt <= ${until} GROUP BY date ORDER BY date ASC`)
    : await db.execute(sql`SELECT DATE(createdAt) as date, COUNT(*) as total FROM leads WHERE createdAt >= ${since} GROUP BY date ORDER BY date ASC`);
  return ((result as unknown as any[])[0] as any[]).map((r: any) => ({ date: r.date, total: Number(r.total) }));
}

export async function getLeadsByStatus() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ leadStatus: leads.leadStatus, total: count() }).from(leads).groupBy(leads.leadStatus).orderBy(desc(count()));
}

export async function updateLeadStatus(id: number, status: "new" | "contacted" | "qualified" | "converted" | "lost") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(leads).set({ leadStatus: status }).where(eq(leads.id, id));
  return { success: true };
}

export async function updateLeadNotes(id: number, notes: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(leads).set({ notes }).where(eq(leads.id, id));
  return { success: true };
}

// ===================== SESSIONS =====================

export async function upsertSession(session: InsertSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Try to update existing session first
  const existing = await db.select().from(sessions).where(eq(sessions.sessionId, session.sessionId)).limit(1);
  if (existing.length > 0) {
    await db.update(sessions).set({
      totalPageViews: sql`${sessions.totalPageViews} + 1`,
      totalDurationMs: session.totalDurationMs || 0,
      lastActivityAt: new Date(),
    }).where(eq(sessions.sessionId, session.sessionId));
  } else {
    await db.insert(sessions).values({ ...session, totalPageViews: 1 });
  }
  return { success: true };
}

export async function getSessionsCount(since?: Date, until?: Date) {
  const db = await getDb();
  if (!db) return 0;
  const conditions: any[] = [];
  if (since) conditions.push(gte(sessions.startedAt, since));
  if (until) conditions.push(lte(sessions.startedAt, until));
  const query = conditions.length > 0
    ? db.select({ total: count() }).from(sessions).where(and(...conditions))
    : db.select({ total: count() }).from(sessions);
  const result = await query;
  return result[0]?.total ?? 0;
}

export async function getSessionsByChannel(since?: Date, until?: Date) {
  const db = await getDb();
  if (!db) return [];
  const conditions: any[] = [];
  if (since) conditions.push(gte(sessions.startedAt, since));
  if (until) conditions.push(lte(sessions.startedAt, until));
  const query = conditions.length > 0
    ? db.select({ channel: sessions.channel, total: count() }).from(sessions).where(and(...conditions)).groupBy(sessions.channel).orderBy(desc(count()))
    : db.select({ channel: sessions.channel, total: count() }).from(sessions).groupBy(sessions.channel).orderBy(desc(count()));
  return query;
}

export async function getSessionsByDay(since: Date, until?: Date) {
  const db = await getDb();
  if (!db) return [];
  const result = until
    ? await db.execute(sql`SELECT DATE(startedAt) as date, COUNT(*) as total FROM sessions WHERE startedAt >= ${since} AND startedAt <= ${until} GROUP BY date ORDER BY date ASC`)
    : await db.execute(sql`SELECT DATE(startedAt) as date, COUNT(*) as total FROM sessions WHERE startedAt >= ${since} GROUP BY date ORDER BY date ASC`);
  return ((result as unknown as any[])[0] as any[]).map((r: any) => ({ date: r.date, total: Number(r.total) }));
}

export async function getAvgSessionDuration(since?: Date, until?: Date) {
  const db = await getDb();
  if (!db) return 0;
  const conditions: any[] = [];
  if (since) conditions.push(gte(sessions.startedAt, since));
  if (until) conditions.push(lte(sessions.startedAt, until));
  const query = conditions.length > 0
    ? db.select({ avg: sql<number>`AVG(${sessions.totalDurationMs})` }).from(sessions).where(and(...conditions))
    : db.select({ avg: sql<number>`AVG(${sessions.totalDurationMs})` }).from(sessions);
  const result = await query;
  return result[0]?.avg ?? 0;
}

export async function getBounceRate(since?: Date, until?: Date) {
  const db = await getDb();
  if (!db) return 0;
  const conditions: any[] = [];
  if (since) conditions.push(gte(sessions.startedAt, since));
  if (until) conditions.push(lte(sessions.startedAt, until));
  const totalQuery = conditions.length > 0
    ? db.select({ total: count() }).from(sessions).where(and(...conditions))
    : db.select({ total: count() }).from(sessions);
  const bouncedQuery = conditions.length > 0
    ? db.select({ total: count() }).from(sessions).where(and(...conditions, eq(sessions.bounced, 1)))
    : db.select({ total: count() }).from(sessions).where(eq(sessions.bounced, 1));
  const [totalResult, bouncedResult] = await Promise.all([totalQuery, bouncedQuery]);
  const total = totalResult[0]?.total ?? 0;
  const bounced = bouncedResult[0]?.total ?? 0;
  return total > 0 ? Math.round((bounced / total) * 100) : 0;
}

// ===================== PAGE VIEWS =====================

export async function createPageView(pv: InsertPageView) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(pageViews).values(pv);
  return { success: true };
}

export async function getTopPages(since?: Date, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  const conditions = since ? [gte(pageViews.enteredAt, since)] : [];
  const query = conditions.length > 0
    ? db.select({ page: pageViews.page, views: count(), avgDuration: sql<number>`AVG(${pageViews.durationMs})`, avgScroll: sql<number>`AVG(${pageViews.scrollDepthPct})` }).from(pageViews).where(and(...conditions)).groupBy(pageViews.page).orderBy(desc(count())).limit(limit)
    : db.select({ page: pageViews.page, views: count(), avgDuration: sql<number>`AVG(${pageViews.durationMs})`, avgScroll: sql<number>`AVG(${pageViews.scrollDepthPct})` }).from(pageViews).groupBy(pageViews.page).orderBy(desc(count())).limit(limit);
  return query;
}

export async function getEngagementQuartiles(since?: Date) {
  const db = await getDb();
  if (!db) return { total: 0, q25: 0, q50: 0, q75: 0, q100: 0 };
  const conditions = since ? [gte(pageViews.enteredAt, since)] : [];
  const query = conditions.length > 0
    ? db.select({
        total: count(),
        q25: sql<number>`SUM(${pageViews.reached25pct})`,
        q50: sql<number>`SUM(${pageViews.reached50pct})`,
        q75: sql<number>`SUM(${pageViews.reached75pct})`,
        q100: sql<number>`SUM(${pageViews.reached100pct})`,
      }).from(pageViews).where(and(...conditions))
    : db.select({
        total: count(),
        q25: sql<number>`SUM(${pageViews.reached25pct})`,
        q50: sql<number>`SUM(${pageViews.reached50pct})`,
        q75: sql<number>`SUM(${pageViews.reached75pct})`,
        q100: sql<number>`SUM(${pageViews.reached100pct})`,
      }).from(pageViews);
  const result = await query;
  return {
    total: result[0]?.total ?? 0,
    q25: result[0]?.q25 ?? 0,
    q50: result[0]?.q50 ?? 0,
    q75: result[0]?.q75 ?? 0,
    q100: result[0]?.q100 ?? 0,
  };
}

// ===================== VIDEO VIEWS =====================

export async function createVideoView(vv: InsertVideoView) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(videoViews).values(vv);
  return { success: true };
}

export async function getVideoStats(since?: Date) {
  const db = await getDb();
  if (!db) return [];
  const conditions = since ? [gte(videoViews.createdAt, since)] : [];
  const query = conditions.length > 0
    ? db.select({
        videoId: videoViews.videoId,
        videoTitle: videoViews.videoTitle,
        views: count(),
        avgWatchTime: sql<number>`AVG(${videoViews.watchTimeMs})`,
        q25: sql<number>`SUM(${videoViews.reached25pct})`,
        q50: sql<number>`SUM(${videoViews.reached50pct})`,
        q75: sql<number>`SUM(${videoViews.reached75pct})`,
        q100: sql<number>`SUM(${videoViews.reached100pct})`,
      }).from(videoViews).where(and(...conditions)).groupBy(videoViews.videoId, videoViews.videoTitle).orderBy(desc(count()))
    : db.select({
        videoId: videoViews.videoId,
        videoTitle: videoViews.videoTitle,
        views: count(),
        avgWatchTime: sql<number>`AVG(${videoViews.watchTimeMs})`,
        q25: sql<number>`SUM(${videoViews.reached25pct})`,
        q50: sql<number>`SUM(${videoViews.reached50pct})`,
        q75: sql<number>`SUM(${videoViews.reached75pct})`,
        q100: sql<number>`SUM(${videoViews.reached100pct})`,
      }).from(videoViews).groupBy(videoViews.videoId, videoViews.videoTitle).orderBy(desc(count()));
  return query;
}

// ===================== ANALYTICS EVENTS =====================

export async function createAnalyticsEvent(event: InsertAnalyticsEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(analyticsEvents).values(event);
  return { success: true };
}

export async function getAnalyticsEvents(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(analyticsEvents).orderBy(desc(analyticsEvents.createdAt)).limit(limit).offset(offset);
}

export async function getAnalyticsSummary(since?: Date) {
  const db = await getDb();
  if (!db) return { totalEvents: 0, pageViews: 0, uniqueSessions: 0 };
  const conditions = since ? [gte(analyticsEvents.createdAt, since)] : [];
  const totalQuery = conditions.length > 0
    ? db.select({ total: count() }).from(analyticsEvents).where(and(...conditions))
    : db.select({ total: count() }).from(analyticsEvents);
  const totalResult = await totalQuery;
  const pvConditions = [...conditions, eq(analyticsEvents.eventName, "page_view")];
  const pvResult = await db.select({ total: count() }).from(analyticsEvents).where(and(...pvConditions));
  const sessQuery = conditions.length > 0
    ? db.select({ total: sql<number>`COUNT(DISTINCT ${analyticsEvents.sessionId})` }).from(analyticsEvents).where(and(...conditions))
    : db.select({ total: sql<number>`COUNT(DISTINCT ${analyticsEvents.sessionId})` }).from(analyticsEvents);
  const sessResult = await sessQuery;
  return {
    totalEvents: totalResult[0]?.total ?? 0,
    pageViews: pvResult[0]?.total ?? 0,
    uniqueSessions: sessResult[0]?.total ?? 0,
  };
}

export async function getEventsByName(since?: Date) {
  const db = await getDb();
  if (!db) return [];
  const conditions = since ? [gte(analyticsEvents.createdAt, since)] : [];
  const query = conditions.length > 0
    ? db.select({ eventName: analyticsEvents.eventName, total: count() }).from(analyticsEvents).where(and(...conditions)).groupBy(analyticsEvents.eventName).orderBy(desc(count()))
    : db.select({ eventName: analyticsEvents.eventName, total: count() }).from(analyticsEvents).groupBy(analyticsEvents.eventName).orderBy(desc(count()));
  return query;
}

// ===================== BLOG VIEWS =====================

export async function createBlogView(view: InsertBlogView) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(blogViews).values(view);
  return { success: true };
}

export async function getBlogViewsBySlug() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ slug: blogViews.slug, total: count() }).from(blogViews).groupBy(blogViews.slug).orderBy(desc(count()));
}

export async function getBlogViewCount(slug: string) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ total: count() }).from(blogViews).where(eq(blogViews.slug, slug));
  return result[0]?.total ?? 0;
}

// ===================== CONVERSIONS =====================

export async function createConversion(conv: InsertConversion) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(conversions).values(conv);
  return { success: true };
}

export async function getConversionRate(since?: Date) {
  const db = await getDb();
  if (!db) return 0;
  const sessCount = await getSessionsCount(since);
  const conditions = since ? [gte(conversions.createdAt, since)] : [];
  const convQuery = conditions.length > 0
    ? db.select({ total: count() }).from(conversions).where(and(...conditions))
    : db.select({ total: count() }).from(conversions);
  const convResult = await convQuery;
  const convCount = convResult[0]?.total ?? 0;
  return sessCount > 0 ? Math.round((convCount / sessCount) * 10000) / 100 : 0;
}

export async function getConversionsByChannel(since?: Date) {
  const db = await getDb();
  if (!db) return [];
  const conditions = since ? [gte(conversions.createdAt, since)] : [];
  const query = conditions.length > 0
    ? db.select({ channel: conversions.channel, total: count() }).from(conversions).where(and(...conditions)).groupBy(conversions.channel).orderBy(desc(count()))
    : db.select({ channel: conversions.channel, total: count() }).from(conversions).groupBy(conversions.channel).orderBy(desc(count()));
  return query;
}

export async function getConversionsByType(since?: Date) {
  const db = await getDb();
  if (!db) return [];
  const conditions = since ? [gte(conversions.createdAt, since)] : [];
  const query = conditions.length > 0
    ? db.select({ conversionType: conversions.conversionType, total: count() }).from(conversions).where(and(...conditions)).groupBy(conversions.conversionType).orderBy(desc(count()))
    : db.select({ conversionType: conversions.conversionType, total: count() }).from(conversions).groupBy(conversions.conversionType).orderBy(desc(count()));
  return query;
}

// ===================== DASHBOARD KPIs =====================

export async function getDashboardKPIs(since: Date, until?: Date) {
  const [
    totalLeads,
    totalSessions,
    leadsByChannel,
    leadsByDay,
    convRate,
    bounceRate_,
    avgDuration,
    topPages_,
    engagementQ,
    leadsStatus,
    convByChannel,
  ] = await Promise.all([
    getLeadsCount(since),
    getSessionsCount(since),
    getLeadsByChannel(since),
    getLeadsByDay(since),
    getConversionRate(since),
    getBounceRate(since),
    getAvgSessionDuration(since),
    getTopPages(since, 10),
    getEngagementQuartiles(since),
    getLeadsByStatus(),
    getConversionsByChannel(since),
  ]);

  return {
    totalLeads,
    totalSessions,
    conversionRate: convRate,
    bounceRate: bounceRate_,
    avgSessionDuration: avgDuration,
    leadsByChannel,
    leadsByDay,
    topPages: topPages_,
    engagementQuartiles: engagementQ,
    leadsStatus,
    conversionsByChannel: convByChannel,
  };
}

// ===================== TAGS =====================

export async function createTag(data: { name: string; color: string; category?: string; description?: string }) {
  const db = await getDb();
  if (!db) return null;
  const [result] = await db.insert(tags).values(data).$returningId();
  return result;
}

export async function getAllTags() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tags).orderBy(tags.name);
}

export async function getTagById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(tags).where(eq(tags.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateTag(id: number, data: { name?: string; color?: string; category?: string; description?: string }) {
  const db = await getDb();
  if (!db) return false;
  await db.update(tags).set(data).where(eq(tags.id, id));
  return true;
}

export async function deleteTag(id: number) {
  const db = await getDb();
  if (!db) return false;
  // Remove all lead associations first
  await db.delete(leadTags).where(eq(leadTags.tagId, id));
  await db.delete(tags).where(eq(tags.id, id));
  return true;
}

export async function getTagsByCategory() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    category: tags.category,
    count: sql<number>`count(*)`,
  }).from(tags).groupBy(tags.category).orderBy(tags.category);
}

// ===================== LEAD TAGS =====================

export async function addTagToLead(leadId: number, tagId: number) {
  const db = await getDb();
  if (!db) return null;
  // Check if already exists
  const existing = await db.select().from(leadTags)
    .where(and(eq(leadTags.leadId, leadId), eq(leadTags.tagId, tagId)))
    .limit(1);
  if (existing.length > 0) return existing[0];
  const [result] = await db.insert(leadTags).values({ leadId, tagId }).$returningId();
  return result;
}

export async function removeTagFromLead(leadId: number, tagId: number) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(leadTags).where(and(eq(leadTags.leadId, leadId), eq(leadTags.tagId, tagId)));
  return true;
}

export async function getTagsForLead(leadId: number) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select({
    id: tags.id,
    name: tags.name,
    color: tags.color,
    category: tags.category,
  }).from(leadTags)
    .innerJoin(tags, eq(leadTags.tagId, tags.id))
    .where(eq(leadTags.leadId, leadId));
  return result;
}

export async function getLeadsByTag(tagId: number, since?: Date, until?: Date) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(leadTags.tagId, tagId)];
  if (since) conditions.push(gte(leads.createdAt, since));
  if (until) conditions.push(lte(leads.createdAt, until));
  return db.select({
    id: leads.id,
    name: leads.name,
    phone: leads.phone,
    email: leads.email,
    channel: leads.channel,
    leadStatus: leads.leadStatus,
    createdAt: leads.createdAt,
  }).from(leadTags)
    .innerJoin(leads, eq(leadTags.leadId, leads.id))
    .where(and(...conditions));
}

export async function getLeadCountByTag(since?: Date, until?: Date) {
  const db = await getDb();
  if (!db) return [];
  const conditions: any[] = [];
  if (since) conditions.push(gte(leads.createdAt, since));
  if (until) conditions.push(lte(leads.createdAt, until));
  
  const baseQuery = db.select({
    tagId: tags.id,
    tagName: tags.name,
    tagColor: tags.color,
    tagCategory: tags.category,
    count: sql<number>`count(DISTINCT ${leadTags.leadId})`,
  }).from(tags)
    .leftJoin(leadTags, eq(tags.id, leadTags.tagId))
    .leftJoin(leads, eq(leadTags.leadId, leads.id));

  if (conditions.length > 0) {
    return baseQuery.where(and(...conditions)).groupBy(tags.id, tags.name, tags.color, tags.category).orderBy(sql`count(DISTINCT ${leadTags.leadId}) DESC`);
  }
  return baseQuery.groupBy(tags.id, tags.name, tags.color, tags.category).orderBy(sql`count(DISTINCT ${leadTags.leadId}) DESC`);
}

export async function bulkAddTagsToLead(leadId: number, tagIds: number[]) {
  const db = await getDb();
  if (!db) return false;
  // Remove existing tags for this lead
  await db.delete(leadTags).where(eq(leadTags.leadId, leadId));
  // Insert new tags
  if (tagIds.length > 0) {
    await db.insert(leadTags).values(tagIds.map(tagId => ({ leadId, tagId })));
  }
  return true;
}

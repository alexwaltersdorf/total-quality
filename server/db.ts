import { eq, desc, sql, and, gte, lte, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  InsertContact, contacts,
  InsertLead, leads,
  InsertAnalyticsEvent, analyticsEvents,
  InsertBlogView, blogViews,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
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

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
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

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

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

export async function getContactsCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ total: count() }).from(contacts);
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

export async function getLeads(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(leads).orderBy(desc(leads.createdAt)).limit(limit).offset(offset);
}

export async function getLeadsCount(since?: Date) {
  const db = await getDb();
  if (!db) return 0;
  const conditions = since ? [gte(leads.createdAt, since)] : [];
  const query = conditions.length > 0
    ? db.select({ total: count() }).from(leads).where(and(...conditions))
    : db.select({ total: count() }).from(leads);
  const result = await query;
  return result[0]?.total ?? 0;
}

export async function getLeadsBySource() {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    source: leads.source,
    total: count(),
  }).from(leads).groupBy(leads.source).orderBy(desc(count()));
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
  const pvQuery = db.select({ total: count() }).from(analyticsEvents).where(and(...pvConditions));
  const pvResult = await pvQuery;

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
  return db.select({
    slug: blogViews.slug,
    total: count(),
  }).from(blogViews).groupBy(blogViews.slug).orderBy(desc(count()));
}

export async function getBlogViewCount(slug: string) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ total: count() }).from(blogViews).where(eq(blogViews.slug, slug));
  return result[0]?.total ?? 0;
}

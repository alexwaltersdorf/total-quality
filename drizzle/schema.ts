import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, bigint, json, boolean, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Contatos recebidos pelo formulário de contato do site.
 */
export const contacts = mysqlTable("contacts", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 30 }),
  subject: varchar("subject", { length: 255 }),
  message: text("message").notNull(),
  status: mysqlEnum("status", ["new", "read", "replied", "archived"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;

/**
 * Leads gerados por cliques no WhatsApp, CTAs, formulários.
 * Inclui dados de contato, localização e atribuição de canal/campanha.
 */
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  // Dados de contato do lead
  name: varchar("name", { length: 255 }),
  phone: varchar("phone", { length: 30 }),
  email: varchar("email", { length: 320 }),
  // Localização
  address: varchar("address", { length: 500 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  zipCode: varchar("zipCode", { length: 20 }),
  // Origem e atribuição
  source: varchar("source", { length: 100 }).notNull(), // e.g., "whatsapp_fab", "hero_cta", "form_contato"
  page: varchar("page", { length: 255 }).notNull(),
  referrer: varchar("referrer", { length: 500 }),
  // UTM Parameters para rastreamento de campanhas
  utmSource: varchar("utmSource", { length: 200 }), // facebook, instagram, google, tiktok
  utmMedium: varchar("utmMedium", { length: 200 }), // cpc, cpm, social, organic, email
  utmCampaign: varchar("utmCampaign", { length: 500 }), // nome da campanha
  utmTerm: varchar("utmTerm", { length: 500 }), // palavra-chave
  utmContent: varchar("utmContent", { length: 500 }), // variação do anúncio
  // Dados de atribuição derivados
  channel: varchar("channel", { length: 100 }), // Canal normalizado: "Facebook Ads", "Google Orgânico", etc.
  // Dados técnicos
  userAgent: text("userAgent"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  sessionId: varchar("sessionId", { length: 100 }),
  // Status do lead
  leadStatus: mysqlEnum("leadStatus", ["new", "contacted", "qualified", "converted", "lost"]).default("new").notNull(),
  notes: text("notes"),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

/**
 * Sessões de visitantes — rastreia cada visita única ao site.
 */
export const sessions = mysqlTable("sessions", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 100 }).notNull(),
  // UTM da sessão
  utmSource: varchar("utmSource", { length: 200 }),
  utmMedium: varchar("utmMedium", { length: 200 }),
  utmCampaign: varchar("utmCampaign", { length: 500 }),
  utmTerm: varchar("utmTerm", { length: 500 }),
  utmContent: varchar("utmContent", { length: 500 }),
  channel: varchar("channel", { length: 100 }),
  // Dados do visitante
  referrer: varchar("referrer", { length: 500 }),
  landingPage: varchar("landingPage", { length: 255 }),
  userAgent: text("userAgent"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  device: varchar("device", { length: 50 }), // mobile, desktop, tablet
  browser: varchar("browser", { length: 100 }),
  os: varchar("os", { length: 100 }),
  // Métricas de engajamento da sessão
  totalPageViews: int("totalPageViews").default(0),
  totalDurationMs: bigint("totalDurationMs", { mode: "number" }).default(0), // tempo total em ms
  bounced: int("bounced").default(0), // 1 se viu apenas 1 página
  converted: int("converted").default(0), // 1 se gerou lead
  // Timestamps
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  lastActivityAt: timestamp("lastActivityAt").defaultNow().onUpdateNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

/**
 * Page views — cada visualização de página individual.
 */
export const pageViews = mysqlTable("page_views", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 100 }).notNull(),
  page: varchar("page", { length: 255 }).notNull(),
  title: varchar("title", { length: 500 }),
  // Métricas de engajamento
  durationMs: bigint("durationMs", { mode: "number" }).default(0), // tempo na página em ms
  scrollDepthPct: int("scrollDepthPct").default(0), // 0-100% profundidade do scroll
  // Quartis de tempo de visualização (para remarketing)
  reached25pct: int("reached25pct").default(0), // 1 se ficou 25% do tempo esperado
  reached50pct: int("reached50pct").default(0),
  reached75pct: int("reached75pct").default(0),
  reached100pct: int("reached100pct").default(0),
  // Dados técnicos
  userAgent: text("userAgent"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  // Timestamps
  enteredAt: timestamp("enteredAt").defaultNow().notNull(),
  exitedAt: timestamp("exitedAt"),
});

export type PageView = typeof pageViews.$inferSelect;
export type InsertPageView = typeof pageViews.$inferInsert;

/**
 * Video views — rastreamento de visualização de vídeos com quartis.
 * Essencial para remarketing em redes sociais.
 */
export const videoViews = mysqlTable("video_views", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 100 }).notNull(),
  page: varchar("page", { length: 255 }),
  videoId: varchar("videoId", { length: 255 }).notNull(), // identificador do vídeo
  videoTitle: varchar("videoTitle", { length: 500 }),
  videoDurationMs: bigint("videoDurationMs", { mode: "number" }).default(0),
  // Quartis de visualização (25%, 50%, 75%, 100%)
  reached25pct: int("reached25pct").default(0),
  reached50pct: int("reached50pct").default(0),
  reached75pct: int("reached75pct").default(0),
  reached100pct: int("reached100pct").default(0),
  watchTimeMs: bigint("watchTimeMs", { mode: "number" }).default(0), // tempo assistido em ms
  // Fonte/campanha
  utmSource: varchar("utmSource", { length: 200 }),
  utmCampaign: varchar("utmCampaign", { length: 500 }),
  // Dados técnicos
  userAgent: text("userAgent"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VideoView = typeof videoViews.$inferSelect;
export type InsertVideoView = typeof videoViews.$inferInsert;

/**
 * Eventos de analytics capturados pelo site (page views, cliques, scroll, etc.).
 */
export const analyticsEvents = mysqlTable("analytics_events", {
  id: int("id").autoincrement().primaryKey(),
  eventName: varchar("eventName", { length: 100 }).notNull(),
  eventCategory: varchar("eventCategory", { length: 100 }),
  eventData: json("eventData"),
  page: varchar("page", { length: 255 }),
  sessionId: varchar("sessionId", { length: 100 }),
  userAgent: text("userAgent"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert;

/**
 * Visualizações de artigos do blog.
 */
export const blogViews = mysqlTable("blog_views", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull(),
  sessionId: varchar("sessionId", { length: 100 }),
  userAgent: text("userAgent"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BlogView = typeof blogViews.$inferSelect;
export type InsertBlogView = typeof blogViews.$inferInsert;

/**
 * Conversões — rastreia quando um visitante se torna lead.
 * Permite calcular taxa de conversão por canal/campanha.
 */
export const conversions = mysqlTable("conversions", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 100 }).notNull(),
  leadId: int("leadId"),
  contactId: int("contactId"),
  conversionType: varchar("conversionType", { length: 100 }).notNull(), // "whatsapp_click", "form_submit", "phone_call"
  conversionValue: decimal("conversionValue", { precision: 10, scale: 2 }),
  // Atribuição
  utmSource: varchar("utmSource", { length: 200 }),
  utmMedium: varchar("utmMedium", { length: 200 }),
  utmCampaign: varchar("utmCampaign", { length: 500 }),
  channel: varchar("channel", { length: 100 }),
  page: varchar("page", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Conversion = typeof conversions.$inferSelect;
export type InsertConversion = typeof conversions.$inferInsert;

/**
 * Tags para segmentação e organização de leads.
 * Cada tag tem um nome, cor e categoria opcional para agrupamento.
 */
export const tags = mysqlTable("tags", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  color: varchar("color", { length: 7 }).notNull().default("#9B212B"), // hex color
  category: varchar("category", { length: 100 }), // e.g., "Interesse", "Exame", "Perfil", "Campanha"
  description: varchar("description", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Tag = typeof tags.$inferSelect;
export type InsertTag = typeof tags.$inferInsert;

/**
 * Relação many-to-many entre leads e tags.
 */
export const leadTags = mysqlTable("lead_tags", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId").notNull(),
  tagId: int("tagId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LeadTag = typeof leadTags.$inferSelect;
export type InsertLeadTag = typeof leadTags.$inferInsert;

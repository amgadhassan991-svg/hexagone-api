import { pgTable, text, serial, timestamp, jsonb, real, integer } from "drizzle-orm/pg-core";

export const campaignsTable = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  targetAudience: text("target_audience"),
  product: text("product").notNull(),
  sourceUrl: text("source_url"),
  icpJson: jsonb("icp_json").$type<Record<string, unknown>>(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const campaignLeadsTable = pgTable("campaign_leads", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => campaignsTable.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  profileUrl: text("profile_url"),
  rawBio: text("raw_bio"),
  sector: text("sector"),
  location: text("location"),
  seniority: text("seniority"),
  familyStatus: text("family_status"),
  incomeSignal: text("income_signal"),
  egyptTies: text("egypt_ties"),
  fitScore: real("fit_score").notNull().default(0),
  fitBreakdown: jsonb("fit_breakdown").$type<Record<string, number>>(),
  status: text("status").notNull().default("new"),
  pitchHeadline: text("pitch_headline"),
  pitchBody: text("pitch_body"),
  pitchHooks: jsonb("pitch_hooks").$type<string[]>(),
  closingMove: text("closing_move"),
  notes: text("notes").default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type Campaign = typeof campaignsTable.$inferSelect;
export type InsertCampaign = typeof campaignsTable.$inferInsert;
export type CampaignLead = typeof campaignLeadsTable.$inferSelect;
export type InsertCampaignLead = typeof campaignLeadsTable.$inferInsert;

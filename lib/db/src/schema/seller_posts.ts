import { pgTable, text, serial, timestamp, integer, jsonb, real, boolean } from "drizzle-orm/pg-core";

export const sellerPostsTable = pgTable("seller_posts", {
  id: serial("id").primaryKey(),
  rawText: text("raw_text").notNull(),
  sourceGroupUrl: text("source_group_url"),
  sourceGroupName: text("source_group_name"),
  postUrl: text("post_url"),
  contactName: text("contact_name"),
  contactPhone: text("contact_phone"),
  contactPhones: jsonb("contact_phones").$type<string[]>().default([]),
  contactEmail: text("contact_email"),
  propertyDetails: text("property_details"),
  location: text("location"),
  keywordsMatched: jsonb("keywords_matched").$type<string[]>().default([]),
  triggerCategory: text("trigger_category"),
  motivationScore: real("motivation_score").notNull().default(0),
  withinLast24h: boolean("within_24h").notNull().default(true),
  status: text("status").notNull().default("new"),
  notes: text("notes").default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SellerPost = typeof sellerPostsTable.$inferSelect;
export type InsertSellerPost = typeof sellerPostsTable.$inferInsert;

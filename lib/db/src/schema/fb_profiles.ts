import { pgTable, text, serial, timestamp, integer, jsonb } from "drizzle-orm/pg-core";

export const fbProfilesTable = pgTable("fb_profiles", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  profileName: text("profile_name"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  coverUrl: text("cover_url"),
  scrapeStatus: text("scrape_status").notNull().default("pending"),
  rawMeta: jsonb("raw_meta"),
  manualBio: text("manual_bio"),
  processedAt: timestamp("processed_at", { withTimezone: true }).notNull().defaultNow(),
});

export type FbProfile = typeof fbProfilesTable.$inferSelect;
export type InsertFbProfile = typeof fbProfilesTable.$inferInsert;

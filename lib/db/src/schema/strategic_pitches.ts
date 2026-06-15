import { pgTable, serial, text, timestamp, jsonb, integer } from "drizzle-orm/pg-core";

export const strategicPitchesTable = pgTable("strategic_pitches", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id"),
  profileUrl: text("profile_url"),
  profileName: text("profile_name"),
  bio: text("bio"),
  velocityCategory: text("velocity_category"),
  velocityScore: integer("velocity_score").notNull().default(0),
  pitchHeadline: text("pitch_headline"),
  pitchBody: text("pitch_body"),
  hooks: jsonb("hooks").$type<string[]>().default([]),
  closingMove: text("closing_move"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type StrategicPitch = typeof strategicPitchesTable.$inferSelect;
export type InsertStrategicPitch = typeof strategicPitchesTable.$inferInsert;

import { pgTable, text, serial, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { fbProfilesTable } from "./fb_profiles";

export const strategicPitchesTable = pgTable("strategic_pitches", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").references(() => fbProfilesTable.id, { onDelete: "cascade" }),
  profileUrl: text("profile_url").notNull(),
  profileName: text("profile_name"),
  bio: text("bio"),
  velocityCategory: text("velocity_category").notNull(),
  velocityScore: integer("velocity_score").notNull().default(0),
  pitchHeadline: text("pitch_headline").notNull(),
  pitchBody: text("pitch_body").notNull(),
  hooks: jsonb("hooks").$type<string[]>().notNull().default([]),
  closingMove: text("closing_move").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type StrategicPitch = typeof strategicPitchesTable.$inferSelect;
export type InsertStrategicPitch = typeof strategicPitchesTable.$inferInsert;

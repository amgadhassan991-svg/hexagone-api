import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const sellerPosts = pgTable("seller_posts", {
  id: serial("id").primaryKey(),
  raw_text: text("raw_text"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

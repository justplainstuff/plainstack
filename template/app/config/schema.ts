import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  email: text("email").primaryKey(),
  created: int("created").notNull(),
});

export type User = typeof users.$inferSelect;

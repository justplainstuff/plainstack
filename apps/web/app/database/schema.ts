import { text, integer, sqliteTable, int } from "drizzle-orm/sqlite-core";

export const contacts = sqliteTable("contacts", {
  email: text("email").primaryKey(),
  created: int("created").notNull(),
  doubleOpted: integer("double_opted"),
});

export type Contact = typeof contacts.$inferSelect;

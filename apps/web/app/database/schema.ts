import { text, integer, sqliteTable, int } from "drizzle-orm/sqlite-core";

export const contacts = sqliteTable("contacts", {
  email: text("email").notNull(),
  created: int("created").notNull(),
  doubleOpted: integer("double_opted").notNull(),
});

export type Contact = typeof contacts.$inferSelect;

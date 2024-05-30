import { text, integer, sqliteTable, int } from "drizzle-orm/sqlite-core";

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  data: text("data", { mode: "json" }),
  created: int("created").notNull(),
  failedLast: int("failed_last"),
  failedNr: int("failed_nr"),
  failedError: text("failed_error"),
});

export type Task = typeof tasks.$inferSelect;

export const contacts = sqliteTable("contacts", {
  email: text("email").primaryKey(),
  created: int("created").notNull(),
  doubleOptInSent: integer("double_opt_in_sent"),
  doubleOptInConfirmed: integer("double_opt_in_confirmed"),
  doubleOptInToken: text("double_opt_in_token").notNull(),
});

export type Contact = typeof contacts.$inferSelect;

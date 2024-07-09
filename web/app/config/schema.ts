import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

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
  doubleOptInSent: int("double_opt_in_sent"),
  doubleOptInConfirmed: int("double_opt_in_confirmed"),
  doubleOptInToken: text("double_opt_in_token").notNull(),
});

export type Contact = typeof contacts.$inferSelect;

export const sparks = sqliteTable("sparks", {
  nr: int("nr").notNull().default(0),
  last: int("last").notNull(),
});

export type Spark = typeof sparks.$inferSelect;

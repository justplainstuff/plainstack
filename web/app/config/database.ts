import { env } from "app/config/env";
import BetterSqlite3Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

export const connection: BetterSqlite3Database.Database =
  new BetterSqlite3Database(env.NODE_ENV === "test" ? ":memory:" : env.DB_URL);
connection.pragma("journal_mode = WAL");

export const database = drizzle<typeof schema>(connection, { schema });
export type Database = typeof database;

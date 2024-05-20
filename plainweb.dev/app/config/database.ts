import BetterSqlite3Database from "better-sqlite3";
import * as schema from "./schema";
import { env } from "~/app/config/env";
import { drizzle } from "drizzle-orm/better-sqlite3";

const connection = new BetterSqlite3Database(env.DB_URL);
connection.pragma("journal_mode = WAL");

export const database = drizzle<typeof schema>(connection, { schema });
export type Database = typeof database;

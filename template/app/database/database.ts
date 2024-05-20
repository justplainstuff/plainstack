import { drizzle } from "drizzle-orm/better-sqlite3";
import BetterSqlite3Database, { type Database } from "better-sqlite3";
import * as schema from "./schema";
import { env } from "~/app/env";

export const connection: Database = new BetterSqlite3Database(env.DB_URL);
connection.pragma("journal_mode = WAL");
export const db = drizzle<typeof schema>(connection, { schema });

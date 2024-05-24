import { drizzle } from "drizzle-orm/better-sqlite3";
import BetterSqlite3Database, { type Database } from "better-sqlite3";
import { env } from "~/app/env";
import * as schema from "./schema";

const dbUrl = env.NODE_ENV === "test" ? `test-${env.DB_URL}` : env.DB_URL;
export const connection: Database = new BetterSqlite3Database(dbUrl);
connection.pragma("journal_mode = WAL");
export const db = drizzle<typeof schema>(connection, { schema });
export type Db = typeof db;

import BetterSqlite3Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { env } from "~/app/config/env";
import * as schema from "./schema";

const dbUrl = env.NODE_ENV === "test" ? `test-${env.DB_URL}` : env.DB_URL;
const connection = new BetterSqlite3Database(dbUrl);
connection.pragma("journal_mode = WAL");

export const database = drizzle<typeof schema>(connection, { schema });
export type Database = typeof database;

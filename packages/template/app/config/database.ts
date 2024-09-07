import SQLite from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";
import { log } from "plainstack";
import { env } from "./env";
import type { DB } from "./schema";

export const connection = new SqliteDialect({
  database: new SQLite(env.DB_URL),
});

export const database = new Kysely<DB>({
  dialect: connection,
  log: (event: unknown) => {
    log.info(event);
  },
});

export type Database = typeof database;

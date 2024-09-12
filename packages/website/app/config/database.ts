import env from "app/config/env";
import SQLite from "better-sqlite3";
import { CamelCasePlugin, Kysely, SqliteDialect } from "kysely";
import { defineDatabase, getLogger } from "plainstack";
import type { DB } from "./schema";

export type Database = Kysely<DB>;

export default defineDatabase(
  new Kysely<DB>({
    dialect: new SqliteDialect({
      database: new SQLite(env.DB_URL),
    }),
    plugins: [new CamelCasePlugin()],
    log: (event: unknown) => {
      const log = getLogger("database");
      log.debug(event);
    },
  }),
);

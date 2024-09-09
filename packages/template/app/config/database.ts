import SQLite from "better-sqlite3";
import { CamelCasePlugin, Kysely, SqliteDialect } from "kysely";
import { defineDatabase, log } from "plainstack";
import type { DB } from "./schema";

export default defineDatabase(
  ({ dbUrl }) =>
    new Kysely<DB>({
      dialect: new SqliteDialect({
        database: new SQLite(dbUrl),
      }),
      plugins: [new CamelCasePlugin()],
      log: (event: unknown) => {
        log.info(event);
      },
    }),
);

export type Database = Kysely<DB>;

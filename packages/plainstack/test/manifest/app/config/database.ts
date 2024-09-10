import SQLite from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";
import { defineDatabase } from "../../../../src/database";

export default defineDatabase(
  new Kysely<Record<string, unknown>>({
    dialect: new SqliteDialect({
      database: new SQLite(":memory:"),
    }),
  }),
);

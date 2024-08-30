import { env } from "app/config/env";
import middleware from "app/config/middleware";
import * as schema from "app/schema";
import { defineConfig } from "plainstack";

export default defineConfig({
  nodeEnv: env.NODE_ENV,
  http: {
    port: env.PORT ?? 3000,
    staticPath: "/public",
    middleware,
  },
  database: {
    dbUrl: env.DB_URL ?? "db.sqlite3",
    schema: schema,
    pragma: {
      journal_mode: "WAL",
    },
  },
});

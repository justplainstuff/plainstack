import { env } from "app/config/env";
import middleware from "app/config/middleware";
import * as schema from "app/schema";
import { defineConfig } from "plainweb";

export default defineConfig({
  nodeEnv: env.NODE_ENV,
  http: {
    port: 3000,
    staticPath: "/public",
    middleware,
  },
  database: {
    dbUrl: env.DB_URL,
    testDbUrl: ":memory:",
    schema: schema,
    pragma: {
      journal_mode: "WAL",
    },
  },
});

import { env } from "app/config/env";
import middleware from "app/config/middleware";
import * as schema from "app/schema";
import { defineConfig } from "plainweb";

export default defineConfig({
  nodeEnv: env.NODE_ENV,
  http: {
    port: env.PORT,
    redirects: {
      "/docs/environmet-variables": "/docs/environment-variables",
      "/docs": "/docs/getting-started",
    },
    staticPath: "/public",
    middleware,
  },
  logger: {
    level: env.LOG_LEVEL,
  },
  database: {
    dbUrl: env.DB_URL,
    schema: schema,
    pragma: {
      journal_mode: "WAL",
    },
  },
  mail: {
    default: {
      host: env.SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    },
  },
});

import { env } from "app/config/env";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "app/config/schema.ts",
  out: "migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: env.DB_URL,
  },
});

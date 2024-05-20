import { defineConfig } from "drizzle-kit";
import { env } from "~/app/config/env";

export default defineConfig({
  schema: "app/config/schema.ts",
  out: "migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: env.DB_URL,
  },
});

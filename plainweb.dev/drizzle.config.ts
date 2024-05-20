import { defineConfig } from "drizzle-kit";
import { env } from "~/app/env";

export default defineConfig({
  schema: "./app/database/schema.ts",
  out: "./migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: env.DB_URL,
  },
});

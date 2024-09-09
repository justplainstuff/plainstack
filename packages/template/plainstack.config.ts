import env from "app/config/env";
import { defineConfig } from "plainstack";

export default defineConfig({
  nodeEnv: env.NODE_ENV,
  dbUrl: env.DB_URL,
  logger: {
    level: env.LOG_LEVEL,
  },
});

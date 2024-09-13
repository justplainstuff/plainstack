import env from "app/config/env";
import { defineConfig } from "plainstack";

export default defineConfig({
  nodeEnv: env.NODE_ENV,
  logger: {
    level: env.LOG_LEVEL,
  },
});

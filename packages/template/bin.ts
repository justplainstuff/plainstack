import { env } from "app/config/env";
import { run } from "plainstack";

void run({
  nodeEnv: env.NODE_ENV,
  logger: {
    level: env.LOG_LEVEL,
  },
});

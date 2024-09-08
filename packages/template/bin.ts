import { database } from "app/config/database";
import { env } from "app/config/env";
import http from "app/config/http";
import { run } from "plainstack";

void run({
  nodeEnv: env.NODE_ENV,
  paths: {},
  app: http,
  database,
  dbUrl: env.DB_URL,
  logger: {
    level: env.LOG_LEVEL,
  },
});

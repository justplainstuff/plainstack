import { defineEnv } from "plainstack";

export default defineEnv((z) =>
  z.object({
    NODE_ENV: z.enum(["development", "production", "test"]),
    PORT: z.coerce.number().optional(),
    DB_URL: z.string(),
    LOG_LEVEL: z
      .enum(["silly", "debug", "verbose", "http", "info", "warn", "error"])
      .optional(),
  }),
);

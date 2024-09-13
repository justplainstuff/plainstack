import { defineEnv } from "plainstack";

export default defineEnv((z) =>
  z.object({
    NODE_ENV: z.enum(["development", "production", "test"]),
    PORT: z.coerce.number().optional(),
    LOG_LEVEL: z.enum(["error", "warn", "info", "debug", "trace"]).optional(),
    DB_URL: z.string(),
    SMTP_HOST: z.string(),
    SMTP_USER: z.string(),
    SMTP_PASS: z.string(),
    CF_TURNSTILE_SECRET: z.string(),
    CF_TURNSTILE_SITEKEY: z.string(),
    ADMIN_PASSWORD: z.string(),
  }),
);

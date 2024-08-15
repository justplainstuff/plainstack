import dotenv from "dotenv";
import z from "zod";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.test" });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z
    .enum(["silly", "debug", "verbose", "http", "info", "warn", "error"])
    .default("info"),
  DB_URL: z.string(),
  SMTP_HOST: z.string(),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  CF_TURNSTILE_SECRET: z.string(),
  CF_TURNSTILE_SITEKEY: z.string(),
  ADMIN_PASSWORD: z.string(),
});

type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);

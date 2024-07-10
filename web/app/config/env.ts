import dotenv from "dotenv";
import z from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.coerce.number().default(3000),
  DB_URL: z.string().default("db.sqlite3"),
  SMTP_HOST: z.string(),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  CF_TURNSTILE_SECRET: z.string(),
  CF_TURNSTILE_SITEKEY: z.string(),
});

type Env = z.infer<typeof envSchema>;

export const env: Env =
  process.env.NODE_ENV === "test" ? ({} as Env) : envSchema.parse(process.env);

export const debug = env.NODE_ENV === "development";

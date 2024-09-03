import dotenv from "dotenv";
import z from "zod";

// TODO move to plainweb
const dotEnv = dotenv.config({ path: ".env" });
if (dotEnv.error) {
  console.error("error loading .env", dotEnv.error);
} else {
  console.log("found .env");
}
const dotEnvTest = dotenv.config({ path: ".env.test" });
if (dotEnvTest.error) {
  console.error("error loading .env.test", dotEnvTest.error);
} else {
  console.log("found .env.test");
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.coerce.number().optional(),
  LOG_LEVEL: z
    .enum(["silly", "debug", "verbose", "http", "info", "warn", "error"])
    .optional(),
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

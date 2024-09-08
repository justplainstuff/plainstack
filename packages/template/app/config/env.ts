import dotenv from "dotenv";
import z from "zod";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.test" });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.coerce.number().optional(),
  DB_URL: z.string(),
  LOG_LEVEL: z
    .enum(["silly", "debug", "verbose", "http", "info", "warn", "error"])
    .optional(),
});

type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);

import * as dotenv from "dotenv";
import * as z from "zod";

dotenv.config();

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.number().default(3000),
  DB_URL: z.string().default("sqlite.db"),
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);

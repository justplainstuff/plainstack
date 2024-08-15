import dotenv from "dotenv";
import z from "zod";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.test" });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.coerce.number(),
  DB_URL: z.string(),
});

type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);

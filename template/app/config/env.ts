import dotenv from "dotenv";
import z from "zod";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.test" });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.coerce.number().optional(),
  DB_URL: z.string().optional(),
});

type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);

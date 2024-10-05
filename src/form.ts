import { parseWithZod } from "@conform-to/zod";
import { conformValidator } from "@hono/conform-validator";
import type { z } from "zod";

export function form<T>(schema: z.ZodSchema<T> | Promise<z.ZodSchema<T>>) {
  return conformValidator(async (formData) =>
    parseWithZod(formData, { schema: await schema }),
  );
}

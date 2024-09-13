import dotenv from "dotenv";
import z from "zod";

export function dev() {
  return process.env.NODE_ENV === "development";
}

export function prod() {
  return process.env.NODE_ENV === "production";
}

export function test() {
  return process.env.NODE_ENV === "test";
}

type Zod = typeof z;

export function defineEnv<T>(f: (z: Zod) => z.Schema<T>) {
  const schema = f(z);
  dotenv.config({ path: ".env" });
  if (process.env.NODE_ENV === "test") {
    dotenv.config({ path: ".env.test" });
  }

  return schema.parse(process.env);
}

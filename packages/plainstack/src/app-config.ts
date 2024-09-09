import { join } from "node:path";
import { cwd } from "node:process";
import dotenv from "dotenv";
import type express from "express";
import type { Kysely } from "kysely";
import z from "zod";
import { type Config, getConfig } from "./config";

import { log } from "./log";

export type AppConfig = {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  database: Kysely<any>;
  app: express.Application;
};

export async function loadAppConfig({
  config,
}: { config: Config }): Promise<AppConfig> {
  log.debug("starting to load app config");

  log.debug("loading database config module");
  const databaseConfigPath = join(cwd(), config.paths.databaseConfig);
  const databaseModule = await import(databaseConfigPath);

  log.debug("checking database module for valid default export");
  if (
    !databaseModule?.default?.default ||
    typeof databaseModule.default.default !== "object" ||
    !("selectFrom" in databaseModule.default.default)
  ) {
    throw new Error(
      `Invalid database config: expected a function as default export at ${databaseConfigPath}`,
    );
  }
  const database = databaseModule.default.default;

  log.debug("loading http config module");
  const httpConfigPath = join(cwd(), config.paths.httpConfig);
  const httpModule = await import(httpConfigPath);

  log.debug("checking http module for valid default export");
  if (
    !httpModule?.default?.default ||
    typeof httpModule.default.default !== "function"
  ) {
    throw new Error(
      `Invalid http config: expected a function as default export at ${httpConfigPath}`,
    );
  }
  const http = httpModule.default.default;
  const app = await http(config);

  log.debug("app config loaded successfully");

  return {
    database,
    app,
  };
}

export function defineDatabase<T>(db: Kysely<T>): Kysely<T> {
  return db;
}

export type Zod = typeof z;

export function defineEnv<T>(f: (z: Zod) => z.Schema<T>) {
  const schema = f(z);
  dotenv.config({ path: ".env" });
  if (process.env.NODE_ENV === "test") {
    dotenv.config({ path: ".env.test" });
  }

  return schema.parse(process.env);
}

export function defineHttp(
  handler: (config: Config) => Promise<express.Application>,
) {
  return handler;
}

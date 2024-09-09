import { LogLevels } from "consola";
import type winston from "winston";

export type InputConfig = {
  nodeEnv: "development" | "production" | "test";
  dbUrl: string;
  logger: {
    level?: number;
    transports?: winston.transport[];
    logger?: winston.Logger;
  };
  port?: number;
  paths?: {
    routes?: string;
    cli?: string;
    jobs?: string;
    forms?: string;
    public?: string;
    schema?: string;
    out?: string;
    styles?: string;
    seed?: string;
    migrations?: string;
    databaseConfig?: string;
    httpConfig?: string;
  };
};

export type Config = {
  nodeEnv: "development" | "production" | "test";
  dbUrl: string;
  logger: {
    level: number;
    transports: winston.transport[];
    logger: winston.Logger | undefined;
  };
  port: number;
  paths: {
    routes: string;
    cli: string;
    jobs: string;
    forms: string;
    public: string;
    schema: string;
    out: string;
    styles: string;
    seed: string;
    migrations: string;
    databaseConfig: string;
    httpConfig: string;
  };
};

export function defineConfig(config: InputConfig) {
  return config;
}

export let config: Config | undefined;

export async function loadConfig() {
  const c12LoadConfig = (await import("c12")).loadConfig;
  const resolvedConfig = await c12LoadConfig<InputConfig>({
    name: "plainstack",
    defaults: {
      nodeEnv: "production",
      dbUrl: "data.db",
      logger: {
        level: LogLevels.info,
        transports: [],
        logger: undefined,
      } satisfies Config["logger"],
      port: 3000,
      paths: {
        routes: "app/routes",
        cli: "app/cli",
        jobs: "app/jobs",
        forms: "app/forms",
        public: ".out/public",
        schema: "app/config/schema.ts",
        out: ".out",
        styles: "assets/styles.css",
        seed: "database/seed.ts",
        migrations: "database/migrations",
        databaseConfig: "app/config/database.ts",
        httpConfig: "app/config/http.ts",
      } satisfies Config["paths"],
    },
  });
  config = resolvedConfig.config as Config;
}

export function getConfig() {
  if (!config) {
    console.error("make sure to call loadConfig() before getConfig()");
    console.error(
      "this happens if you try to run code without implementing your own cli command",
    );
    throw new Error("config not loaded");
  }
  return config;
}

export async function loadAndGetConfig() {
  if (config) return config;
  await loadConfig();
  return getConfig();
}

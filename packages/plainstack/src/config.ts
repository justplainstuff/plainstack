import type winston from "winston";
import type { LogLevel } from "./log";

export type InputConfig = {
  nodeEnv: "development" | "production" | "test";
  dbUrl: string;
  logger: {
    level: LogLevel;
    transports?: winston.transport[];
    logger?: winston.Logger;
  };
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
    level: LogLevel;
    transports: winston.transport[];
    logger: winston.Logger | undefined;
  };
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

let config: Config | undefined;

export async function loadConfig() {
  const c12LoadConfig = (await import("c12")).loadConfig;
  const resolvedConfig = await c12LoadConfig<InputConfig>({
    name: "plainstack",
    defaults: {
      nodeEnv: "production",
      dbUrl: "data.db",
      logger: {
        level: "debug",
        transports: [],
        logger: undefined,
      } satisfies Config["logger"],
      paths: {
        routes: "app/routes",
        cli: "app/cli",
        jobs: "app/jobs",
        forms: "app/forms",
        public: ".out/public",
        schema: "app/schema.ts",
        out: ".out",
        styles: "assets/styles.css",
        seed: "database/seed.ts",
        migrations: "database/migrations",
        databaseConfig: "app/config/database.ts",
        httpConfig: "app/config/http.ts",
      } satisfies Config["paths"],
    },
  });
  console.debug("loaded config", resolvedConfig.config);
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

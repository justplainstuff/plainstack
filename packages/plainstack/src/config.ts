import { type ConsolaReporter, LogLevels } from "consola";
import type winston from "winston";

export type InputConfig = {
  nodeEnv: "development" | "production" | "test";
  dbUrl: string;
  logger: {
    level?: number;
    reporters?: ConsolaReporter[];
  };
  port?: number;
  paths?: {
    routes?: string;
    commands?: string;
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
    reporters: ConsolaReporter[];
  };
  port: number;
  paths: {
    routes: string;
    commands: string;
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
        level: LogLevels.info,
        reporters: [],
      } satisfies Config["logger"],
      port: 3000,
      paths: {
        routes: "app/routes",
        commands: "app/commands",
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
    throw new Error("config not loaded, make sure to call loadConfig() first");
  }
  return config;
}

export async function loadAndGetConfig() {
  if (config) return config;
  await loadConfig();
  return getConfig();
}

import path from "node:path";
import { cwd } from "node:process";
import defu from "defu";
import { type LogLevel, getLogger } from "../log";
import { loadModule } from "./file-module";

type InputConfig = {
  nodeEnv: "development" | "production" | "test";
  logger: {
    level?: LogLevel;
  };
  http?: {
    port?: number;
    staticPath?: string;
  };
  paths?: {
    routes?: string;
    commands?: string;
    jobs?: string;
    schedules?: string;
    schema?: string;
    assets?: string;
    out?: string;
    styles?: string;
    seed?: string;
    migrations?: string;
    database?: string;
    http?: string;
    queue?: string;
    mailer?: string;
    logger?: string;
  };
};

export type Config = {
  nodeEnv: "development" | "production" | "test";
  logger: {
    level: LogLevel;
  };
  http: {
    port: number;
    staticPath: string;
  };
  paths: {
    routes: string;
    commands: string;
    jobs: string;
    schedules: string;
    assets: string;
    out: string;
    schema: string;
    styles: string;
    seed: string;
    migrations: string;
    database: string;
    http: string;
    queue: string;
    mailer: string;
    logger: string;
  };
};

export function defineConfig(config: InputConfig) {
  return config;
}

let config: Config | undefined;

function isConfig(m: unknown): m is Config {
  return typeof m === "object" && m !== null && "nodeEnv" in m;
}

async function load(m: unknown): Promise<Config> {
  if (!isConfig(m)) throw new Error("invalid config module");
  return m as Config;
}

export const defaultConfig = {
  nodeEnv: "production",
  logger: {
    level: "normal",
  },
  http: {
    port: 3000,
    staticPath: "/public",
  },
  paths: {
    routes: "app/routes",
    commands: "app/commands",
    jobs: "app/jobs",
    schedules: "app/schedules",
    schema: "app/config/schema.ts",
    styles: "assets/styles.css",
    assets: "assets",
    out: ".out",
    seed: "database/seed.ts",
    migrations: "database/migrations",
    database: "app/config/database.ts",
    http: "app/config/http.ts",
    queue: "app/config/queue.ts",
    mailer: "app/config/mailer.ts",
    logger: "app/config/logger.ts",
  },
} satisfies Config;

type PartialConfig = {
  nodeEnv?: Config["nodeEnv"];
  logger?: Partial<Config["logger"]>;
  http?: Partial<Config["http"]>;
  paths?: Partial<Config["paths"]>;
};

export function withDefaultConfig(config: PartialConfig): Config {
  return defu(config, defaultConfig);
}

async function loadConfig() {
  const log = getLogger("load-config");
  const fileModule = await loadModule(
    path.join(cwd(), "plainstack.config.ts"),
    load,
  );
  if (!fileModule) throw new Error("no plainstack.config.ts found");
  if (!fileModule.defaultExport)
    throw new Error("no default export found in plainstack.config.ts");
  config = withDefaultConfig(fileModule.defaultExport);
  log.debug("config loaded from file", config);
}

export function getConfig() {
  if (!config)
    throw new Error("config not loaded, make sure to call loadConfig() first");
  return config;
}

export async function loadAndGetConfig() {
  const log = getLogger("load-config");
  if (config) {
    log.debug("return memoized config");
    return config;
  }
  await loadConfig();
  return getConfig();
}

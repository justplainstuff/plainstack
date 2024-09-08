import path from "node:path";
import type express from "express";
import type { Kysely } from "kysely";
import type winston from "winston";

type PathsConfig = {
  routes?: string;
  cli?: string;
  tasks?: string;
  migrations?: string;
  forms?: string;
  public?: string;
  schema?: string;
  out?: string;
  styles?: string;
};

type LoggerConfig = {
  level?: "silly" | "debug" | "verbose" | "http" | "info" | "warn" | "error";
  transports?: winston.transport[];
  logger?: winston.Logger;
};

export type PlainWebConfig = {
  nodeEnv: "development" | "production" | "test";
  app: (config: HttpConfig) => Promise<express.Application>;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  database: Kysely<any>;
  dbUrl: string;
  logger?: LoggerConfig;
  paths?: PathsConfig;
};

export type Config = ExpandedPlainwebConfig;

export type HttpConfig = Pick<Config, "nodeEnv" | "logger" | "paths">;

export type ExpandedPlainwebConfig = {
  nodeEnv: "development" | "production" | "test";
  app: express.Application;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  database: Kysely<any>;
  dbUrl: string;
  logger: Omit<Required<LoggerConfig>, "logger"> & { logger?: winston.Logger };
  paths: Required<PathsConfig>;
};

export const defaultConfigPaths: Required<PathsConfig> = {
  routes: "app/routes",
  cli: "app/cli",
  tasks: "app/tasks",
  forms: "app/forms",
  public: "public",
  migrations: "migrations",
  schema: "app/schema.ts",
  out: ".out",
  styles: "assets/styles.css",
};

function parseProcessEnvLogLevel(): Config["logger"]["level"] | undefined {
  const level = process.env.LOG_LEVEL;
  const allowedLevels = [
    "silly",
    "debug",
    "verbose",
    "http",
    "info",
    "warn",
    "error",
  ];
  if (level && allowedLevels.includes(level.toLocaleLowerCase())) {
    return level as Config["logger"]["level"];
  }
  return undefined;
}

export const defaultConfigLogger = {
  level: parseProcessEnvLogLevel() ?? ("http" as const),
  transports: [],
  logger: undefined,
};

export let expandedConfig: ExpandedPlainwebConfig | undefined;

export async function expandConfig(
  config: PlainWebConfig,
): Promise<ExpandedPlainwebConfig> {
  const paths = { ...(config.paths ?? {}), ...defaultConfigPaths };
  const absolutePaths = {
    routes: path.resolve(process.cwd(), paths.routes),
    cli: path.resolve(process.cwd(), paths.cli),
    tasks: path.resolve(process.cwd(), paths.tasks),
    forms: path.resolve(process.cwd(), paths.forms),
    public: path.resolve(process.cwd(), paths.public),
    migrations: path.resolve(process.cwd(), paths.migrations),
    schema: path.resolve(process.cwd(), paths.schema),
    out: path.resolve(process.cwd(), paths.out),
    styles: path.resolve(process.cwd(), paths.styles),
  };
  // TODO use deep merge
  const logger = { ...(config.logger ?? {}), ...defaultConfigLogger };
  const expanded = {
    nodeEnv: config.nodeEnv,
    app: await config.app({
      nodeEnv: config.nodeEnv,
      paths: absolutePaths,
      logger,
    }),
    database: config.database,
    dbUrl: config.dbUrl,
    paths: absolutePaths,
    logger,
  } satisfies ExpandedPlainwebConfig;
  expandedConfig = expanded;
  return expanded;
}

import path from "node:path";
import type winston from "winston";

type PathsConfig = {
  routes?: string;
  cli?: string;
  tasks?: string;
  migrations?: string;
  forms?: string;
  public?: string;
  schema?: string;
};

type LoggerConfig = {
  level?: "silly" | "debug" | "verbose" | "http" | "info" | "warn" | "error";
  transports?: winston.transport[];
  logger?: winston.Logger;
};

export type PlainWebConfig = {
  nodeEnv: "development" | "production" | "test";
  logger?: LoggerConfig;
  paths?: PathsConfig;
};

export type Config = ExpandedPlainwebConfig;

export type ExpandedPlainwebConfig = {
  nodeEnv: "development" | "production" | "test";
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

function expandConfig<T extends Record<string, unknown>>(
  config: PlainWebConfig,
): ExpandedPlainwebConfig {
  const paths = { ...(config.paths ?? {}), ...defaultConfigPaths };
  const absolutePaths = {
    routes: path.resolve(process.cwd(), paths.routes),
    cli: path.resolve(process.cwd(), paths.cli),
    tasks: path.resolve(process.cwd(), paths.tasks),
    forms: path.resolve(process.cwd(), paths.forms),
    public: path.resolve(process.cwd(), paths.public),
    migrations: path.resolve(process.cwd(), paths.migrations),
    schema: path.resolve(process.cwd(), paths.schema),
  };
  const expanded = {
    nodeEnv: config.nodeEnv,
    paths: absolutePaths,
    // TODO use deep merge
    logger: { ...(config.logger ?? {}), ...defaultConfigLogger },
  } satisfies ExpandedPlainwebConfig;
  expandedConfig = expanded;
  return expanded;
}

/** Define a plainweb configuration */
export function defineConfig<T extends Record<string, unknown>>(
  config: PlainWebConfig,
): ExpandedPlainwebConfig {
  return expandConfig(config);
}

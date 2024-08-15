import path from "node:path";
import type express from "express";
import type nodemailer from "nodemailer";
import type winston from "winston";

export type MiddlewareStackArgs = {
  app: express.Express;
  config: ExpandedPlainwebConfig<
    Record<string, unknown>,
    MailConfig | undefined
  >;
};

type HttpConfig<T> = {
  port: number;
  redirects?: Record<string, string>;
  staticPath: string;
  middleware: (opts: MiddlewareStackArgs) => Promise<void> | void;
};

type SmtpMailConfig = {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
};

export type MailerConfig = SmtpMailConfig | nodemailer.Transporter;

export type MailConfig = {
  default: MailerConfig;
  [key: string]: MailerConfig;
};

type DatabaseConfig<T extends Record<string, unknown>> = {
  dbUrl: string;
  pragma: Record<string, string>;
  schema: T;
  migrationsTable?: string;
};

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

type PlainWebConfig<
  S extends Record<string, unknown>,
  M extends MailConfig | undefined = undefined,
> = {
  nodeEnv: "development" | "production" | "test";
  http: HttpConfig<S>;
  database: DatabaseConfig<S>;
  logger?: LoggerConfig;
  paths?: PathsConfig;
  mail?: M;
};

export type Config = ExpandedPlainwebConfig<
  Record<string, unknown>,
  MailConfig | undefined
>;

export type ExpandedPlainwebConfig<
  S extends Record<string, unknown>,
  M extends MailConfig | undefined = undefined,
> = {
  nodeEnv: "development" | "production" | "test";
  http: Required<HttpConfig<S>>;
  database: Required<DatabaseConfig<S>>;
  logger: Omit<Required<LoggerConfig>, "logger"> & { logger?: winston.Logger };
  paths: Required<PathsConfig>;
  mail: M extends undefined ? Record<string, never> : M;
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

const defaultConfigHttp = {
  redirects: {},
};

const defaultConfigDatabase = {
  migrationsTable: "__drizzle_migrations",
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

export let expandedConfig:
  | ExpandedPlainwebConfig<Record<string, unknown>, MailConfig | undefined>
  | undefined;

function expandConfig<
  T extends Record<string, unknown>,
  M extends MailConfig | undefined,
>(config: PlainWebConfig<T, M>): ExpandedPlainwebConfig<T, M> {
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
    http: { ...(config.http ?? {}), ...defaultConfigHttp },
    // TODO fix deep merge
    logger: { ...(config.logger ?? {}), ...defaultConfigLogger },
    database: { ...(config.database ?? {}), ...defaultConfigDatabase },
    mail: config.mail as ExpandedPlainwebConfig<T, M>["mail"],
  } satisfies ExpandedPlainwebConfig<T, M>;
  expandedConfig = expanded;
  return expanded;
}

/** Define a plainweb configuration */
export function defineConfig<
  T extends Record<string, unknown>,
  M extends MailConfig | undefined = undefined,
>(config: PlainWebConfig<T, M>): ExpandedPlainwebConfig<T, M> {
  return expandConfig(config);
}

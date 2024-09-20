import type { CommandDef } from "citty";
import type { ConsolaReporter } from "consola";
import type { Transporter } from "nodemailer";
import type { Queue } from "plainjobs";
import type { GenericDatabase } from "../database/database";
import type { Seeder } from "../database/seed";
import type { Job, Schedule } from "../job";
import { getLogger } from "../log";
import type { FileRoute } from "../web/file-router";
import type { HttpServer } from "../web/http";

type App = {
  database: GenericDatabase;
  server: HttpServer;
  seeder: Seeder;
  queue: { default: Queue; named: Record<string, Queue> };
  mailer: { default: Transporter; named: Record<string, Transporter> };
  jobs: Record<string, Job<unknown>>;
  commands: Record<string, CommandDef>;
  schedules: Record<string, Schedule>;
  routes: FileRoute[];
  loggers: ConsolaReporter[];
};

export type AppLoader = {
  database: () => Promise<App["database"]>;
  server: () => Promise<App["server"]>;
  queue: () => Promise<App["queue"]>;
  mailer: () => Promise<App["mailer"]>;
  seeder: () => Promise<App["seeder"]>;
  jobs: () => Promise<App["jobs"]>;
  commands: () => Promise<App["commands"]>;
  schedules: () => Promise<App["schedules"]>;
  routes: () => Promise<App["routes"]>;
  loggers: () => Promise<App["loggers"]>;
};

let appLoader: AppLoader | undefined;

export function setAppLoader(loader: AppLoader) {
  appLoader = loader;
}

export async function get<K extends keyof App>(
  keys: K[],
): Promise<Partial<Pick<App, K>>> {
  const log = getLogger("app-loader");

  if (!appLoader)
    throw new Error(
      "appLoader not set, make sure to call registerAppLoader() first",
    );

  log.debug(`getting app components for ${keys.join(", ")}`);

  const results = await Promise.all(
    keys.map(async (key) => {
      try {
        const loader = appLoader?.[key];
        if (!loader) {
          log.warn(`no loader found for ${key}`);
          return [key, undefined];
        }

        log.debug(`loading app component: ${key}`);
        const result = await loader();
        log.debug(`successfully loaded app component: ${key}`);
        return [key, result];
      } catch (error) {
        log.error(`failed to load app component: ${key}`, error);
        return [key, undefined];
      }
    }),
  );

  return Object.fromEntries(results) as Partial<Pick<App, K>>;
}

export async function getOrThrow<K extends keyof App>(
  keys: K[],
): Promise<Pick<App, K>> {
  const log = getLogger("app-loader");

  if (!appLoader) {
    throw new Error("appLoader not set. call setAppLoader first.");
  }

  log.debug(`getting app components (or throw) for ${keys.join(", ")}`);

  const result = await get(keys);

  const missingKeys = keys.filter((key) => result[key] === undefined);
  if (missingKeys.length > 0) {
    throw new Error(`missing app components: ${missingKeys.join(", ")}`);
  }

  return result as Pick<App, K>;
}

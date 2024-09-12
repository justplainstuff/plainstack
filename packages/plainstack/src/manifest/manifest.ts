import path from "node:path";
import type { CommandDef } from "citty";
import type express from "express";
import type { Kysely } from "kysely";
import type { Queue } from "plainjobs";
import { isCommand } from "../command";
import { type Config, loadAndGetConfig } from "../config";
import { isDatabase } from "../database";
import { type Job, isJob } from "../job";
import { getLogger } from "../log";
import { loadModule, loadModulesfromDir } from "./file-module";

export type Manifest = {
  database: Kysely<Record<string, unknown>>;
  app: express.Application;
  queue: Queue;
  jobs: Record<string, Job<unknown>>;
  commands: Record<string, CommandDef>;
};

type ModuleConfig<T> = {
  typeGuard: (m: unknown) => m is T;
  path: keyof Config["paths"];
  type: "single" | "list";
};

const manifestConfig: Record<keyof Manifest, ModuleConfig<unknown>> = {
  database: {
    typeGuard: isDatabase,
    path: "databaseConfig",
    type: "single",
  },
  app: {
    typeGuard: (m): m is (config: Config) => Promise<express.Application> =>
      typeof m === "function",
    path: "httpConfig",
    type: "single",
  },
  queue: {
    typeGuard: (m): m is Queue =>
      typeof m === "object" && m !== null && "add" in m && "schedule" in m,
    path: "queueConfig",
    type: "single",
  },
  jobs: {
    typeGuard: isJob,
    path: "jobs",
    type: "list",
  },
  commands: {
    typeGuard: isCommand,
    path: "commands",
    type: "list",
  },
};

async function loadSingleModule<T>(
  config: Config,
  cwd: string,
  moduleConfig: ModuleConfig<T>,
): Promise<T> {
  const modulePath = path.join(cwd, config.paths[moduleConfig.path]);
  const log = getLogger("manifest");
  log.debug(`Loading single module from ${modulePath}`);

  const module = await loadModule(modulePath, async (m: unknown) => {
    if (!moduleConfig.typeGuard(m)) {
      throw new Error(
        `Invalid module: type guard check failed for ${moduleConfig.path}`,
      );
    }
    return m as T;
  });

  if (!module || !module.defaultExport) {
    log.error(`Failed to load module from ${modulePath}`);
    throw new Error(`No default export found in module at ${modulePath}`);
  }

  log.info(`Successfully loaded single module from ${modulePath}`);
  return module.defaultExport;
}

async function loadModuleList<T>(
  config: Config,
  cwd: string,
  moduleConfig: ModuleConfig<T>,
): Promise<Record<string, T>> {
  const dirPath = path.join(cwd, config.paths[moduleConfig.path]);
  const log = getLogger("manifest");
  log.debug(`Loading module list from ${dirPath}`);

  const modules = await loadModulesfromDir(dirPath, async (m: unknown) => {
    if (!moduleConfig.typeGuard(m)) {
      throw new Error(
        `Invalid module: type guard check failed for ${moduleConfig.path}`,
      );
    }
    return m as T;
  });

  const result: Record<string, T> = {};
  for (const module of modules) {
    if (!module.defaultExport) {
      log.error(`No default export found in module at ${module.absolutePath}`);
      throw new Error(
        `No default export found in module at ${module.absolutePath}`,
      );
    }
    log.debug(`Loaded module ${module.filename}`);
    result[module.filename] = module.defaultExport;
  }

  log.info(
    `Successfully loaded ${Object.keys(result).length} modules from ${dirPath}`,
  );
  return result;
}

const memoizedManifest: { [K in keyof Manifest]?: Manifest[K] } = {};

export async function getManifest<K extends keyof Manifest>(
  keys: K[],
  opts: { config?: Config; cwd?: string } = {},
): Promise<Pick<Manifest, K>> {
  const log = getLogger("manifest");
  const config = opts.config ?? (await loadAndGetConfig());
  const cwd = opts.cwd ?? process.cwd();

  log.info(`Getting manifest for ${keys.join(", ")}`, { cwd });

  const results = await Promise.all(
    keys.map(async (key) => {
      if (key in memoizedManifest) {
        log.info(`Returning memoized manifest for ${key}`);
        return memoizedManifest[key] as Manifest[K];
      }

      const moduleConfig = manifestConfig[key];

      try {
        let result: Manifest[K];

        if (moduleConfig.type === "single") {
          result = (await loadSingleModule(
            config,
            cwd,
            moduleConfig,
          )) as Manifest[K];
          if (key === "app") {
            result = (await (
              result as unknown as (
                config: Config,
              ) => Promise<express.Application>
            )(config)) as Manifest[K];
            log.info("Successfully initialized express app");
          }
        } else {
          result = (await loadModuleList(
            config,
            cwd,
            moduleConfig,
          )) as Manifest[K];
        }

        log.info(`Successfully got manifest for ${key}`);

        memoizedManifest[key] = result;

        return result;
      } catch (error) {
        log.error(`Failed to get manifest for ${key}`, {
          error: (error as Error).message,
        });
        throw error;
      }
    }),
  );

  return Object.fromEntries(
    keys.map((key, index) => [key, results[index]]),
  ) as unknown as Pick<Manifest, K>;
}

import path from "node:path";
import type { CommandDef } from "citty";
import type express from "express";
import type { Kysely } from "kysely";
import type { Transport } from "nodemailer";
import { findWorkspaceDir } from "pkg-types";
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
  mailer: Transport;
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
  mailer: {
    typeGuard: (m): m is Transport =>
      typeof m === "object" && m !== null && "sendMail" in m,
    path: "mailerConfig",
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
): Promise<T | undefined> {
  const modulePath = path.join(cwd, config.paths[moduleConfig.path]);
  const log = getLogger("manifest");
  log.debug(`Loading single module from ${modulePath}`);

  try {
    const module = await loadModule(modulePath, async (m: unknown) => {
      if (!moduleConfig.typeGuard(m)) {
        throw new Error(
          `Invalid module: type guard check failed for ${moduleConfig.path}`,
        );
      }
      return m as T;
    });

    if (!module) return undefined;

    if (!module.defaultExport) {
      log.error(`No default export found in module at ${modulePath}`);
      throw new Error(`No default export found in module at ${modulePath}`);
    }

    log.info(`Successfully loaded single module from ${modulePath}`);
    return module.defaultExport;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "MODULE_NOT_FOUND") {
      log.warn(`Module not found at ${modulePath}`);
      return undefined;
    }
    throw error;
  }
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
): Promise<Partial<Pick<Manifest, K>>> {
  const log = getLogger("manifest");
  const config = opts.config ?? (await loadAndGetConfig());
  const cwd = opts.cwd ?? (await findWorkspaceDir(process.cwd()));

  log.info(`Getting manifest for ${keys.join(", ")}`, { cwd });

  const results = await Promise.all(
    keys.map(async (key) => {
      if (key in memoizedManifest) {
        log.info(`Returning memoized manifest for ${key}`);
        return [key, memoizedManifest[key]] as [K, Manifest[K] | undefined];
      }

      const moduleConfig = manifestConfig[key];

      try {
        let result: Manifest[K] | undefined;

        if (moduleConfig.type === "single") {
          result = (await loadSingleModule(config, cwd, moduleConfig)) as
            | Manifest[K]
            | undefined;
          if (result && key === "app") {
            result = (await (
              result as unknown as (
                config: Config,
              ) => Promise<express.Application>
            )(config)) as Manifest[K] | undefined;
            log.info("Successfully initialized express app");
          }
        } else {
          result = (await loadModuleList(config, cwd, moduleConfig)) as
            | Manifest[K]
            | undefined;
        }

        if (result !== undefined) {
          log.info(`Successfully got manifest for ${key}`);
          memoizedManifest[key] = result;
        } else {
          log.warn(`Manifest for ${key} is undefined`);
        }

        return [key, result] as [K, Manifest[K] | undefined];
      } catch (error) {
        log.error(`Failed to get manifest for ${key}`, {
          error: (error as Error).message,
        });
        throw error;
      }
    }),
  );

  return Object.fromEntries(results) as Partial<Pick<Manifest, K>>;
}

export async function getManifestOrThrow<K extends keyof Manifest>(
  keys: K[],
  opts: { config?: Config; cwd?: string } = {},
): Promise<Pick<Manifest, K>> {
  const log = getLogger("manifest");
  const config = opts.config ?? (await loadAndGetConfig());
  const cwd = opts.cwd ?? (await findWorkspaceDir(process.cwd()));

  log.info(`Getting manifest or throw for ${keys.join(", ")}`, { cwd });

  const result = await getManifest(keys, opts);

  const missingKeys = keys.filter((key) => result[key] === undefined);
  if (missingKeys.length > 0) {
    const missingPaths = missingKeys.map((key) => {
      const modulePath = path.join(cwd, config.paths[manifestConfig[key].path]);
      return `${key} not found at ${modulePath}`;
    });
    throw new Error(`Missing manifests: ${missingPaths.join(", ")}`);
  }

  return result as Pick<Manifest, K>;
}

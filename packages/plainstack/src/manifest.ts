import fs from "node:fs/promises";
import { readdir } from "node:fs/promises";
import path, { join } from "node:path";
import type { CommandDef } from "citty";
import type express from "express";
import type { Kysely } from "kysely";
import type { Queue } from "plainjobs";
import { isCommand } from "./command";
import type { Config } from "./config";
import { isDatabase } from "./database";
import { type Job, isJob } from "./job";
import { getLogger } from "./log";
import { directoryExists, fileExists } from "./plainstack-fs";

export async function loadModule<T>(
  filePath: string,
  load: (module: unknown) => Promise<T>,
): Promise<{ defaultExport?: T; namedExports: Record<string, T> } | undefined> {
  if (!(await fileExists(filePath))) return undefined;
  const module = await import(filePath);
  const result: { defaultExport?: T; namedExports: Record<string, T> } = {
    namedExports: {},
  };

  // handle default export
  if ("default" in module) {
    const defaultExport = module.default;
    if (
      defaultExport &&
      typeof defaultExport === "object" &&
      "default" in defaultExport
    ) {
      result.defaultExport = await load(defaultExport.default);
    } else {
      result.defaultExport = await load(defaultExport);
    }
  }

  // handle named exports
  for (const [key, value] of Object.entries(module)) {
    if (key !== "default") {
      result.namedExports[key] = await load(value);
    }
  }

  return result;
}

type FileModule<T> = {
  defaultExport?: T;
  namedExports: Record<string, T>;
  filename: string;
  extension: string;
  absolutePath: string;
  relativePath: string;
};

export async function loadModulesfromDir<T>(
  baseDir: string,
  load: (module: unknown) => Promise<T>,
  extensions: string[] = [".ts", ".tsx"],
  currentDir: string = baseDir,
): Promise<FileModule<T>[]> {
  const modules: FileModule<T>[] = [];
  const log = getLogger("manifest");
  if (!(await directoryExists(currentDir))) {
    log.debug(`directory ${currentDir} does not exist`);
    return [];
  }
  const files = await readdir(currentDir);
  log.debug(`found ${files.length} files in ${currentDir}`);

  for (const file of files) {
    const absolutePath = path.join(currentDir, file);
    const stat = await fs.stat(absolutePath);

    if (stat.isDirectory()) {
      log.debug(`found directory: ${absolutePath}`);
      const subModules = await loadModulesfromDir(
        baseDir,
        load,
        extensions,
        absolutePath,
      );
      modules.push(...subModules);
    } else if (stat.isFile()) {
      log.debug(`found file: ${absolutePath}`);
      if (!extensions.includes(path.extname(file))) {
        log.debug(`skipping file ${absolutePath} with unsupported extension`);
        continue;
      }
      const relativePath = path.relative(baseDir, absolutePath);
      const result = await loadModule(absolutePath, load);
      if (!result) continue;
      modules.push({
        defaultExport: result.defaultExport,
        namedExports: result.namedExports,
        filename: path.parse(file).name,
        extension: path.extname(file),
        absolutePath,
        relativePath,
      });
    }
  }
  return modules;
}

function loadDatabase(path: string) {
  return async (module: unknown): Promise<Kysely<Record<string, unknown>>> => {
    if (!isDatabase(module))
      throw new Error(
        `Invalid database config: expected a function as default export at ${path}`,
      );
    return module as Kysely<Record<string, unknown>>;
  };
}

function loadHttp(path: string) {
  return async (
    module: unknown,
  ): Promise<(config: Config) => Promise<express.Application>> => {
    if (typeof module !== "function")
      throw new Error(
        `Invalid http config: expected a function as default export at ${path}`,
      );
    return module as (config: Config) => Promise<express.Application>;
  };
}

function loadCommand(path: string) {
  return async (module: unknown): Promise<CommandDef> => {
    if (!isCommand(module))
      throw new Error(
        `Invalid command module at ${path}: expected a function as default export`,
      );
    return module as CommandDef;
  };
}

function loadJob(path: string) {
  return async (module: unknown): Promise<Job<unknown>> => {
    if (!isJob(module))
      throw new Error(
        `Invalid job module at ${path}: expected a function as default export`,
      );
    return module as Job<unknown>;
  };
}

function isQueue(m: unknown): m is Queue {
  return "add" in (m as object) && "schedule" in (m as object);
}

function loadQueue(path: string) {
  return async (module: unknown): Promise<Queue> => {
    if (!isQueue(module))
      throw new Error(
        `Invalid queue module at ${path}: expected a function as default export`,
      );
    return module as Queue;
  };
}

export type Manifest = {
  database: Kysely<Record<string, unknown>>;
  app: express.Application;
  queue?: Queue;
  jobs: Record<string, Job<unknown>>;
  commands: Record<string, CommandDef>;
  // TODO load routes here as well
};

let manifest: Manifest | undefined;

export async function loadManifest({
  config,
  cwd,
}: { config: Config; cwd: string }): Promise<void> {
  const log = getLogger("load-manifest");
  log.debug("starting to load app config");

  log.debug("loading database config module");
  const databaseConfigPath = join(cwd, config.paths.databaseConfig);
  const databaseModule = await loadModule(
    databaseConfigPath,
    loadDatabase(databaseConfigPath),
  );
  if (!databaseModule)
    throw new Error(`no database config found at ${databaseConfigPath}`);
  if (!databaseModule.defaultExport)
    throw new Error(
      `no default export found in database config at ${databaseConfigPath}`,
    );
  const database = databaseModule.defaultExport;

  log.debug("loading http config module");
  const httpConfigPath = join(cwd, config.paths.httpConfig);
  const httpModule = await loadModule(httpConfigPath, loadHttp(httpConfigPath));
  if (!httpModule) throw new Error(`no http config found at ${httpConfigPath}`);
  if (!httpModule.defaultExport)
    throw new Error(
      `no default export found in http config at ${httpConfigPath}`,
    );
  const app: express.Application = await httpModule.defaultExport(config);

  log.debug("loading commands");
  const commandsPath = join(cwd, config.paths.commands);
  const commandsModules = await loadModulesfromDir(
    commandsPath,
    loadCommand(commandsPath),
  );
  const commands: Record<string, CommandDef> = {};
  for (const commandModule of commandsModules) {
    if (!commandModule.defaultExport) {
      throw new Error(
        `no default export found in command module at ${commandModule.filename}`,
      );
    }
    log.debug(`loaded command ${commandModule.filename}`);
    commands[commandModule.filename] = commandModule.defaultExport;
  }

  log.debug("loading jobs");
  const jobsPath = join(cwd, config.paths.jobs);
  const jobsModules = await loadModulesfromDir(jobsPath, loadJob(jobsPath));
  const jobs: Record<string, Job<unknown>> = {};
  for (const jobModule of jobsModules) {
    if (!jobModule.defaultExport) {
      throw new Error(
        `no default export found in job module at ${jobModule.filename}`,
      );
    }
    log.debug(`loaded job ${jobModule.filename}`);
    jobs[jobModule.filename] = jobModule.defaultExport;
  }

  log.debug("loading queue");
  const queuePath = join(cwd, config.paths.queueConfig);
  const queueModule = await loadModule(queuePath, loadQueue(queuePath));
  const queue = queueModule?.defaultExport;

  log.debug("app config loaded successfully");
  manifest = { app, database, commands, jobs, queue };
}

export async function getManifest({
  config,
  cwd,
}: {
  config: Config;
  cwd: string;
}): Promise<Manifest> {
  if (manifest) return manifest;
  await loadManifest({ config, cwd });
  if (!manifest) {
    console.error("make sure to call loadAppConfig() before getAppConfig()");
    console.error(
      "this happens if you try to run code without implementing your own cli command",
    );
    throw new Error("app config not loaded");
  }
  return manifest;
}

export async function getPartialManifest(
  partial: keyof Manifest,
  opts: {
    config: Config;
    cwd: string;
  },
): Promise<Pick<Manifest, typeof partial>> {
  return Promise.reject();
}

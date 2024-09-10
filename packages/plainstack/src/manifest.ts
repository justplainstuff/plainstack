import fs from "node:fs/promises";
import { readdir } from "node:fs/promises";
import path, { join } from "node:path";
import { cwd } from "node:process";
import type { CommandDef } from "citty";
import type express from "express";
import type { Kysely } from "kysely";
import { isCommand } from "./command";
import type { Config } from "./config";
import { isDatabase } from "./database";
import { type Job, isJob } from "./job";
import { getLogger } from "./log";
import { directoryExists } from "./plainstack-fs";

const log = getLogger("manifest");

async function importModule(filePath: string): Promise<unknown> {
  const module = (await import(filePath)) as {
    default?: { default?: unknown } | unknown;
  };
  if (
    (module?.default as { default?: unknown })?.default &&
    (typeof (module.default as { default: unknown }).default === "object" ||
      typeof (module.default as { default: unknown }).default === "function")
  )
    return (module.default as { default: unknown }).default;
  if (
    module?.default &&
    (typeof module.default === "object" || typeof module.default === "function")
  )
    return module.default;
  throw new Error(
    `tried to import ${filePath}, but it doesn't export a default`,
  );
}

export async function importModulesFromDir(
  baseDir: string,
  extensions: string[] = [".ts", ".tsx"],
  currentDir: string = baseDir,
): Promise<
  {
    module: unknown;
    filename: string;
    extension: string;
    absolutePath: string;
    relativePath: string;
  }[]
> {
  const modules: {
    module: unknown;
    filename: string;
    extension: string;
    absolutePath: string;
    relativePath: string;
  }[] = [];
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
      const subModules = await importModulesFromDir(
        baseDir,
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
      modules.push({
        module: await importModule(absolutePath),
        filename: path.parse(file).name,
        extension: path.extname(file),
        absolutePath,
        relativePath,
      });
    }
  }
  return modules;
}

export type Manifest = {
  database: Kysely<Record<string, unknown>>;
  app: express.Application;
  jobs: Record<string, Job<unknown>>;
  commands: Record<string, CommandDef>;
  // TODO load routes here as well
};

let manifest: Manifest | undefined;

export async function loadManifest({
  config,
}: { config: Config; silent?: boolean }): Promise<void> {
  log.debug("starting to load app config");

  log.debug("loading database config module");
  const databaseConfigPath = join(cwd(), config.paths.databaseConfig);
  const databaseModule = await importModule(databaseConfigPath);
  log.debug("checking database module for valid default export");
  if (!isDatabase(databaseModule))
    throw new Error(
      `Invalid database config: expected a function as default export at ${databaseConfigPath}`,
    );
  const database = databaseModule as Kysely<Record<string, unknown>>;

  log.debug("loading http config module");
  const httpConfigPath = join(cwd(), config.paths.httpConfig);
  const httpModule = await importModule(httpConfigPath);
  log.debug("checking http module for valid default export");
  if (typeof httpModule !== "function") {
    throw new Error(
      `Invalid http config: expected a function as default export at ${httpConfigPath}`,
    );
  }
  const http = httpModule;
  const app: express.Application = await http(config);

  log.debug("loading commands");
  const commandsPath = join(cwd(), config.paths.commands);
  const commandsModules = await importModulesFromDir(commandsPath);
  const commands: Record<string, CommandDef> = {};
  for (const commandModule of commandsModules) {
    if (!isCommand(commandModule.module)) {
      throw new Error(
        `Invalid command module at ${commandModule.filename}: expected a function as default export`,
      );
    }
    commands[commandModule.filename] = commandModule.module;
  }

  log.debug("loading jobs");
  const jobsPath = join(cwd(), config.paths.jobs);
  const jobsModules = await importModulesFromDir(jobsPath);
  const jobs: Record<string, Job<unknown>> = {};
  for (const jobModule of jobsModules) {
    if (!isJob(jobModule.module)) {
      throw new Error(
        `Invalid job module at ${jobModule.filename}: expected a function as default export`,
      );
    }
    jobs[jobModule.filename] = jobModule.module;
  }

  log.debug("app config loaded successfully");
  manifest = { app, database, commands, jobs };
}

export function getManifest(): Manifest {
  if (!manifest) {
    console.error("make sure to call loadAppConfig() before getAppConfig()");
    console.error(
      "this happens if you try to run code without implementing your own cli command",
    );
    throw new Error("app config not loaded");
  }
  return manifest;
}

export async function loadAndGetManifest({
  config,
}: {
  config: Config;
}): Promise<Manifest> {
  if (manifest) return manifest;
  await loadManifest({ config });
  return getManifest();
}

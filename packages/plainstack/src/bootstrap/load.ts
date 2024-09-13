import { join } from "node:path";
import type { CommandDef } from "citty";
import { type ConsolaReporter, consola } from "consola";
import type { Application } from "express";
import type { Transporter } from "nodemailer";
import type { Queue } from "plainjobs";
import { isCommand } from "../command/command";
import { type GenericDatabase, isDatabase } from "../database/database";
import { type Seeder, isSeeder } from "../database/seed";
import { test } from "../env";
import { type Job, type Schedule, isJob, isQueue, isSchedule } from "../job";
import { getLogger, isLogger } from "../log";
import { devMailer, isMailer } from "../mail";
import { getFileRoutesFromFileModules } from "../web/file-router";
import { type Handler, isHandler } from "../web/handler";
import { isHttp } from "../web/http";
import { type Config, loadAndGetConfig } from "./config";
import { loadModule, loadModulesFromDir } from "./file-module";
import { type AppLoader, setAppLoader } from "./get";

type Opts = { cwd: string; config: Config };

function getDatabaseLoader(opts?: Opts): AppLoader["database"] {
  return async () => {
    const { cwd, config } = opts ?? {
      cwd: process.cwd(),
      config: await loadAndGetConfig(),
    };
    const modulePath = join(cwd, config.paths.database);
    const fileModule = await loadModule(modulePath, async (m: unknown) => {
      if (!isDatabase(m))
        throw new Error(
          `default export in ${modulePath} is not a valid database`,
        );
      return m as GenericDatabase;
    });
    if (!fileModule)
      throw new Error(`no default export found in ${modulePath}`);
    if (!fileModule.defaultExport)
      throw new Error(`no default export found in ${modulePath}`);
    return fileModule.defaultExport;
  };
}

function getServerLoader(opts?: Opts) {
  return async () => {
    const { cwd, config } = opts ?? {
      cwd: process.cwd(),
      config: await loadAndGetConfig(),
    };
    const modulePath = join(cwd, config.paths.http);
    const fileModule = await loadModule(modulePath, async (m: unknown) => {
      if (!isHttp(m))
        throw new Error(
          `default export in ${modulePath} is not a valid http server`,
        );
      return m as (config: Config) => Promise<Application>;
    });
    if (!fileModule)
      throw new Error(`no default export found in ${modulePath}`);
    if (!fileModule.defaultExport)
      throw new Error(`no default export found in ${modulePath}`);
    return {
      start: async () => {
        const app = (await fileModule.defaultExport?.(config)) as Application;
        return app;
      },
    };
  };
}

function getQueueLoader(opts?: Opts): AppLoader["queue"] {
  return async () => {
    const { cwd, config } = opts ?? {
      cwd: process.cwd(),
      config: await loadAndGetConfig(),
    };
    const modulePath = join(cwd, config.paths.queue);
    const fileModule = await loadModule(modulePath, async (m: unknown) => {
      if (!isQueue(m))
        throw new Error(`default export in ${modulePath} is not a valid queue`);
      return m as Queue;
    });
    if (!fileModule)
      throw new Error(`no default export found in ${modulePath}`);
    if (!fileModule.defaultExport)
      throw new Error(`no default export found in ${modulePath}`);
    const namedExports: Record<string, Queue> = {};
    for (const [key, value] of Object.entries(fileModule.namedExports)) {
      if (!isQueue(value))
        throw new Error(
          `named export ${key} in ${modulePath} is not a valid queue`,
        );
      namedExports[key] = value;
    }
    return {
      default: fileModule.defaultExport,
      named: namedExports,
    };
  };
}

function getMailerLoader(opts?: Opts): AppLoader["mailer"] {
  return async () => {
    const { cwd, config } = opts ?? {
      cwd: process.cwd(),
      config: await loadAndGetConfig(),
    };
    const modulePath = join(cwd, config.paths.mailer);
    const fileModule = await loadModule(modulePath, async (m: unknown) => {
      if (!isMailer(m))
        throw new Error(
          `default export in ${modulePath} is not a valid mailer`,
        );
      return m as Transporter;
    });
    if (!fileModule)
      throw new Error(`no default export found in ${modulePath}`);
    if (!fileModule.defaultExport)
      throw new Error(`no default export found in ${modulePath}`);
    const namedExports: Record<string, Transporter> = {};
    for (const [key, value] of Object.entries(fileModule.namedExports)) {
      if (!isMailer(value))
        throw new Error(
          `named export ${key} in ${modulePath} is not a valid mailer`,
        );
      namedExports[key] = test() ? devMailer : value;
    }
    if (test()) {
      const log = getLogger("app-loader");
      log.warn("NODE_ENV=test, skipping mailer");
    }
    return {
      default: test() ? devMailer : fileModule.defaultExport,
      named: namedExports,
    };
  };
}

function getJobsLoader(opts?: Opts): AppLoader["jobs"] {
  return async () => {
    const { cwd, config } = opts ?? {
      cwd: process.cwd(),
      config: await loadAndGetConfig(),
    };
    const modulePath = join(cwd, config.paths.jobs);
    const fileModules = await loadModulesFromDir(
      modulePath,
      async (m: unknown) => {
        if (!isJob(m))
          throw new Error(`default export in ${modulePath} is not a valid job`);
        return m as Job<unknown>;
      },
      [".ts"],
    );
    const jobs: Record<string, Job<unknown>> = {};
    for (const fileModule of fileModules) {
      if (!fileModule.defaultExport)
        throw new Error(`no default export found in ${modulePath}`);
      jobs[fileModule.filename] = fileModule.defaultExport;
    }
    return jobs;
  };
}

function getCommandsLoader(opts?: Opts): AppLoader["commands"] {
  return async () => {
    const { cwd, config } = opts ?? {
      cwd: process.cwd(),
      config: await loadAndGetConfig(),
    };
    const modulePath = join(cwd, config.paths.commands);
    const fileModules = await loadModulesFromDir(
      modulePath,
      async (m: unknown) => {
        if (!isCommand(m))
          throw new Error(
            `default export in ${modulePath} is not a valid command`,
          );
        return m as CommandDef;
      },
      [".ts"],
    );
    const commands: Record<string, CommandDef> = {};
    for (const fileModule of fileModules) {
      if (!fileModule.defaultExport)
        throw new Error(`no default export found in ${modulePath}`);
      commands[fileModule.filename] = fileModule.defaultExport;
    }
    return commands;
  };
}

function getSchedulesLoader(opts?: Opts): AppLoader["schedules"] {
  return async () => {
    const log = getLogger("app-loader");
    if (test()) {
      log.warn("NODE_ENV=test, skipping schedules");
      return {};
    }
    const { cwd, config } = opts ?? {
      cwd: process.cwd(),
      config: await loadAndGetConfig(),
    };
    const modulePath = join(cwd, config.paths.schedules);
    const fileModules = await loadModulesFromDir(
      modulePath,
      async (m: unknown) => {
        if (!isSchedule(m))
          throw new Error(
            `default export in ${modulePath} is not a valid schedule`,
          );
        return m as Schedule;
      },
      [".ts"],
    );
    const schedules: Record<string, Schedule> = {};
    for (const fileModule of fileModules) {
      if (!fileModule.defaultExport)
        throw new Error(`no default export found in ${modulePath}`);
      schedules[fileModule.filename] = fileModule.defaultExport;
    }
    return schedules;
  };
}

function getSeederLoader(opts?: Opts): AppLoader["seeder"] {
  return async () => {
    const { cwd, config } = opts ?? {
      cwd: process.cwd(),
      config: await loadAndGetConfig(),
    };
    const modulePath = join(cwd, config.paths.seed);
    const fileModule = await loadModule(modulePath, async (m: unknown) => {
      if (!isSeeder(m))
        throw new Error(
          `default export in ${modulePath} is not a valid seeder`,
        );
      return m as Seeder;
    });
    if (!fileModule)
      throw new Error(`no default export found in ${modulePath}`);
    if (!fileModule.defaultExport)
      throw new Error(`no default export found in ${modulePath}`);
    return fileModule.defaultExport;
  };
}

function getRoutesLoader(opts?: Opts): AppLoader["routes"] {
  return async () => {
    const { cwd, config } = opts ?? {
      cwd: process.cwd(),
      config: await loadAndGetConfig(),
    };
    const modulePath = join(cwd, config.paths.routes);
    const fileModules = await loadModulesFromDir(
      modulePath,
      async (m: unknown) => {
        if (!isHandler(m))
          throw new Error(
            `default export in ${modulePath} is not a valid handler`,
          );
        return m as Handler;
      },
      [".tsx"],
    );
    return getFileRoutesFromFileModules(fileModules);
  };
}

function getLoggersLoader(opts?: Opts): AppLoader["loggers"] {
  return async () => {
    const { cwd, config } = opts ?? {
      cwd: process.cwd(),
      config: await loadAndGetConfig(),
    };
    const modulePath = join(cwd, config.paths.logger);
    const fileModule = await loadModule(modulePath, async (m: unknown) => {
      if (!isLogger(m)) throw new Error(`${modulePath} is not a valid logger`);
      return m as ConsolaReporter;
    });
    if (!fileModule) throw new Error(`no module found in ${modulePath}`);
    const loggers: ConsolaReporter[] = [];
    for (const [key, value] of Object.entries(fileModule.namedExports)) {
      if (!isLogger(value))
        throw new Error(
          `named export ${key} in ${modulePath} is not a valid logger`,
        );
      loggers.push(value);
    }
    if (fileModule.defaultExport) loggers.push(fileModule.defaultExport);
    for (const logger of loggers) {
      consola.addReporter(logger);
    }
    return loggers;
  };
}

function memoize<T>(loader: () => Promise<T>): () => Promise<T> {
  const log = getLogger("load-memoize");
  let result: T | undefined;
  return async () => {
    if (result) {
      log.debug("returning memoized app component", { loader: loader.name });
      return result;
    }
    log.debug("loading app component", { loader: loader.name });
    result = await loader();
    return result;
  };
}

export function registerAppLoader(opts?: Opts) {
  const log = getLogger("app-loader");
  log.debug("registering app loader", { opts });
  const database = memoize(getDatabaseLoader(opts));
  const server = memoize(getServerLoader(opts));
  const queue = memoize(getQueueLoader(opts));
  const mailer = memoize(getMailerLoader(opts));
  const jobs = memoize(getJobsLoader(opts));
  const commands = memoize(getCommandsLoader(opts));
  const schedules = memoize(getSchedulesLoader(opts));
  const seeder = memoize(getSeederLoader(opts));
  const routes = memoize(getRoutesLoader(opts));
  const loggers = memoize(getLoggersLoader(opts));

  setAppLoader({
    database,
    server,
    queue,
    mailer,
    jobs,
    commands,
    schedules,
    seeder,
    routes,
    loggers,
  });
}

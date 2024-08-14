import fs from "node:fs/promises";
import path from "node:path";
import util from "node:util";
import type { ExpandedPlainwebConfig } from "config";
import { directoryExists } from "plainweb-fs";
import { type ErrorHandler, type Task, isTask, log } from "./task";

export async function loadTasks(tasksDir: string): Promise<Task<unknown>[]> {
  log.verbose(`loading tasks from ${tasksDir}`);

  if (!(await directoryExists(tasksDir))) {
    log.info("no tasks found to run");
    return [];
  }
  try {
    const files = await fs.readdir(tasksDir);
    const taskFiles = files.filter((file) => path.extname(file) === ".ts");

    if (files.length !== taskFiles.length) {
      log.warn(
        "warning: found non-task files or folders in the tasks directory",
      );
    }

    return (
      await Promise.all(
        taskFiles.map(async (file) => {
          const filePath = path.join(tasksDir, file);
          log.debug(`loading task from ${filePath}`);
          let taskModule = await import(filePath);
          if (!taskModule.default) {
            log.error(`no default export found in task at ${filePath}`);
            return;
          }
          if (taskModule.default?.default) {
            taskModule = taskModule.default;
          }
          if (!isTask(taskModule.default)) {
            log.error(`default export in ${filePath} is not a valid task`);
            log.error(util.inspect(taskModule.default, { depth: 3 }));
            return;
          }
          const task = taskModule.default as Task<unknown>;
          return task;
        }),
      )
    ).filter((t) => !!t) as Task<unknown>[];
  } catch (error) {
    log.error("error loading tasks:", error);
    return [];
  }
}

export function workLoadedTasks(
  loadedTasks: Task<unknown>[],
): Record<string, NodeJS.Timeout> {
  if (loadedTasks.length > 0) {
    log.info("starting tasks:");
    for (const task of loadedTasks) {
      log.info(`   * ${task.name}`);
    }
  } else {
    log.info("no tasks to run");
  }

  try {
    const timeouts = loadedTasks.map((task) => ({
      name: task.name,
      timeout: task.start(),
    }));
    return timeouts.reduce(
      (record, item) => {
        record[item.name] = item.timeout;
        return record;
      },
      {} as Record<string, NodeJS.Timeout>,
    );
  } catch (error) {
    log.error("error running tasks:", error);
    return {};
  }
}

export async function workTasks(
  config: Pick<
    ExpandedPlainwebConfig<Record<string, unknown>>,
    "database" | "paths" | "nodeEnv"
  >,
  error?: ErrorHandler,
): Promise<Record<string, NodeJS.Timeout>> {
  const loadedTasks = await loadTasks(config.paths.tasks);
  log.debug(`loaded ${loadedTasks.length} tasks`);
  return workLoadedTasks(loadedTasks);
}

/**
 * Enqueue a task to perform it later.
 * Return a promise when the task is enqueued, note that the task may not be performed immediately.
 * */
export async function perform<T>(
  task: Task<T>,
  data?: T extends void ? undefined : T,
): Promise<void> {
  try {
    await task.perform((data as T) ?? (undefined as unknown as T));
  } catch (error) {
    // TODO configurable logger
    log.error("error performing task:", error);
  }
}

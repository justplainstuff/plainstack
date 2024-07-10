import fs from "node:fs/promises";
import path from "node:path";
import { createId } from "@paralleldrive/cuid2";

type ErrorHandler = ({ err }: { err: unknown }) => Promise<void>;

export type Task<T> = {
  id: string;
  start(
    name: string,
    opts?: {
      debug?: boolean;
      error?: ErrorHandler;
    },
  ): NodeJS.Timeout;
  perform(data: T): Promise<void>;
};

type StartableTask = {
  taskId: string;
  start(): NodeJS.Timeout;
  name: string;
};

const startableTasks: Record<string, StartableTask> = {};

// also loads startable task into memory so it can be performed
export function composeStartableTask(
  task: Task<unknown>,
  name: string,
  opts?: { debug?: boolean; error?: ErrorHandler },
): StartableTask {
  const loaded = {
    taskId: task.id,
    start: () => task.start(name, opts),
    name,
  };
  startableTasks[task.id] = loaded;
  return loaded;
}

async function loadStartableTask(
  tasksDir: string,
  opts?: { debug?: boolean; error?: ErrorHandler },
): Promise<StartableTask[]> {
  const debug = opts?.debug ?? false;
  const error = opts?.error;

  debug && console.log(`[task] Loading tasks from ${tasksDir}`);

  try {
    const files = await fs.readdir(tasksDir);
    const taskFiles = files.filter((file) => path.extname(file) === ".ts");

    if (files.length !== taskFiles.length) {
      console.warn(
        "[task] Warning: Found non-task files or folders in the tasks directory",
      );
    }

    return Promise.all(
      taskFiles
        .map(async (file) => {
          const filePath = path.join(tasksDir as string, file);
          const absoluteFilePath = path.join(process.cwd(), filePath);
          console.log(`[task] Loading task from ${filePath}`);
          const taskModule = await import(absoluteFilePath);
          if (!taskModule.default) {
            console.error(
              `[task] No default export found in task at ${filePath}`,
            );
            return;
          }
          const task = taskModule.default as Task<unknown>;
          const taskName = path.basename(filePath).slice(0, -3);
          return composeStartableTask(task, taskName, { debug, error });
        })
        .filter(Boolean) as Promise<StartableTask>[],
    );
  } catch (error) {
    console.error("[task] Error loading tasks:", error);
    return [];
  }
}

export function _runTasks(
  runnableTasks: StartableTask[],
  opts?: { debug: boolean },
): Record<string, NodeJS.Timeout> {
  const debug = opts?.debug ?? false;

  if (debug) {
    console.log("[task] Starting tasks:");
    for (const task of runnableTasks) {
      console.log(`   * ${task.name}`);
    }
  }

  try {
    const timeouts = runnableTasks.map((task) => ({
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
    console.error("Error running tasks:", error);
    return {};
  }
}

export async function runTasks(
  tasksDir: string,
  opts?: { debug?: boolean; error?: ErrorHandler },
): Promise<Record<string, NodeJS.Timeout>> {
  const debug = opts?.debug ?? false;
  const error = opts?.error;

  const runnableTasks = await loadStartableTask(tasksDir, { debug, error });
  return _runTasks(runnableTasks, { debug });
}

export async function perform<T>(
  task: Task<T>,
  data?: T extends void ? undefined : T,
): Promise<void> {
  try {
    await task.perform((data as T) ?? (undefined as unknown as T));
  } catch (error) {
    // TOOD configurable logger
    console.error("Error performing task:", error);
  }
}

export type PersistedTask<T> = {
  data: T;
  id: string;
  name: string;
  created: number;
  failedLast: number | null;
  failedNr: number | null;
  failedError: string | null;
};

export function composePersistedTask<T>({
  data,
  name,
}: {
  data: T;
  name: string;
}): PersistedTask<T> {
  return {
    data,
    id: createId(),
    name,
    created: Date.now(),
    failedLast: null,
    failedNr: null,
    failedError: null,
  };
}

export interface TaskStorage<T> {
  enqueue: ({ data, name }: { data: T; name: string }) => Promise<void>;
  fetch: ({
    name,
    batchSize,
    maxRetries,
    retryIntervall,
  }: {
    name: string;
    batchSize: number;
    maxRetries: number;
    retryIntervall: number;
  }) => Promise<PersistedTask<T>[] | PersistedTask<T> | undefined>;
  success: ({ task }: { task: PersistedTask<T> }) => Promise<void>;
  failure: ({
    task,
    err,
  }: {
    task: PersistedTask<T>;
    err: unknown;
  }) => Promise<void>;
}

export interface DefineTaskOpts<T> {
  process: ({ data }: { data: T }) => Promise<void>;
  success?: ({ data }: { data: T }) => Promise<void>;
  failure?: ({ data, err }: { data: T; err: unknown }) => Promise<void>;
  pollIntervall?: number;
  batchSize?: number;
  maxRetries?: number;
  retryIntervall?: number;
}

export function defineTaskWithAdapter(
  {
    enqueue,
    fetch,
    success: adapterSuccess,
    failure: adapterFailure,
  }: TaskStorage<unknown>,
  {
    process,
    success,
    failure,
    pollIntervall = 1000,
    batchSize = 1,
    maxRetries = 5,
    retryIntervall = 1000 * 3,
  }: DefineTaskOpts<unknown>,
): Task<unknown> {
  const id = createId();
  return {
    id,
    perform: async (data) => {
      const startableTask = startableTasks[id];
      if (!startableTask)
        throw new Error(
          "You tried to call perform() before calling runTasks(). runTasks() must be called before perform() to load the task into memory.",
        );
      await enqueue({ data, name: startableTask.name });
    },
    start(name: string, { debug = false, error } = {}) {
      if (pollIntervall < 0)
        throw new Error(`pollIntervall in task ${name} must be positive`);

      if (debug) {
        console.log(`[task] Starting task: ${name}`);
      }

      let executing = false;

      const timeout = setInterval(async () => {
        if (executing) {
          console.log(`[task] Protect task ${name} from overrun`);
          return;
        }

        executing = true;
        const start = Date.now();

        try {
          // debug &&
          //   console.log(`[task] Run task ${name} for ${pollIntervall}ms`);

          while (Date.now() - start < pollIntervall) {
            try {
              const tasks = await fetch({
                name,
                batchSize,
                maxRetries,
                retryIntervall,
              });

              if (!tasks || (Array.isArray(tasks) && tasks.length === 0)) {
                break;
              }

              debug &&
                console.log(
                  `[task] Fetched ${Array.isArray(tasks) ? tasks.length : 1} job(s) for task ${name}`,
                );

              const toProcess = Array.isArray(tasks) ? tasks : [tasks];

              // run all tasks in parallel
              await Promise.all(
                toProcess.map((task) =>
                  process({ data: task.data })
                    .then(async () => {
                      await adapterSuccess?.({ task });
                      await success?.({ data: task.data });
                    })
                    .catch(async (err) => {
                      debug &&
                        console.log(
                          `[task] Error processing task ${name}:`,
                          err,
                        );
                      try {
                        await adapterFailure?.({ task, err });
                        await failure?.({ data: task.data, err });
                      } catch (err) {
                        // TODO make logging configurable
                        console.error(err);
                        await error?.({ err });
                      }
                    }),
                ),
              );

              debug &&
                console.log(
                  `[task] Processed ${toProcess.length} job(s) for task ${name}`,
                );
            } catch (err) {
              // TODO make logging configurable
              error?.({ err });

              console.error(
                `[task] Error occurred while processing task ${name}:`,
                err,
              );
            }
          }
        } finally {
          executing = false;
        }
      }, pollIntervall);
      return timeout;
    },
  };
}

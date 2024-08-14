import type { Task } from "./task";
import { log } from "./task";
import type { TaskStorage } from "./task-storage";

export interface DefineTaskOpts<T> {
  name: string;
  process: ({ data }: { data: T }) => Promise<void>;
  success?: ({ data }: { data: T }) => Promise<void>;
  failure?: ({ data, err }: { data: T; err: unknown }) => Promise<void>;
  pollIntervall?: number;
  batchSize?: number;
  maxRetries?: number;
  retryIntervall?: number;
}

function sanitizeTaskName(name: string): string {
  const fileName = name.split("/").pop() || name;
  const nameWithoutExtension = fileName.split(".").slice(0, -1).join(".");
  const sanitizedName = nameWithoutExtension.replace(/\s+/g, "-");
  return sanitizedName;
}

export function defineTaskWithStorageAdapter(
  {
    enqueue,
    fetch,
    success: adapterSuccess,
    failure: adapterFailure,
  }: TaskStorage<unknown>,
  {
    name,
    process,
    success,
    failure,
    pollIntervall = 1000,
    batchSize = 1,
    maxRetries = 5,
    retryIntervall = 1000 * 3,
  }: DefineTaskOpts<unknown>,
): Task<unknown> {
  log.verbose(`defining task "${name}"`);
  return {
    name: sanitizeTaskName(name),
    perform: async (data) => {
      await enqueue({ data, name });
    },
    start() {
      if (pollIntervall < 0)
        throw new Error(`pollIntervall in task ${name} must be positive`);

      log.verbose(`starting task: ${name}`);

      let executing = false;

      const timeout = setInterval(async () => {
        if (executing) {
          log.info(`protect task ${name} from overrun`);
          return;
        }

        executing = true;
        const start = Date.now();

        try {
          log.verbose(`Run task ${name} for ${pollIntervall}ms`);

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

              log.verbose(
                `fetched ${Array.isArray(tasks) ? tasks.length : 1} job(s) for task ${name}`,
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
                      log.verbose(`error processing task ${name}:`, err);
                      try {
                        await adapterFailure?.({ task, err });
                        await failure?.({ data: task.data, err });
                      } catch (err) {
                        // TODO make logging configurable
                        log.error(err);
                      }
                    }),
                ),
              );

              log.verbose(
                `processed ${toProcess.length} job(s) for task ${name}`,
              );
            } catch (err) {
              // TODO make logging configurable
              log.error(`error occurred while processing task ${name}:`, err);
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

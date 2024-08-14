import {
  type DefineTaskOpts,
  defineTaskWithStorageAdapter,
} from "./define-task";
import { type PersistedTask, createPersistedTask } from "./persisted-task";
import type { Task } from "./task";
import type { TaskStorage } from "./task-storage";

// only used for testing
export const inmemoryTasks = new Map<string, PersistedTask<unknown>>();

const InmemoryAdapter: TaskStorage<unknown> = {
  async enqueue({ data, name }) {
    const persistedTask = createPersistedTask({ data, name });
    inmemoryTasks.set(persistedTask.id, persistedTask);
  },
  async fetch({ name, batchSize, maxRetries, retryIntervall }) {
    const result = Array.from(inmemoryTasks.values())
      .filter(
        ({ name: taskName, failedNr, failedLast }) =>
          taskName === name &&
          (failedNr ?? 0) <= maxRetries &&
          (failedLast ?? 0) <= Date.now() - retryIntervall,
      )
      .slice(0, batchSize);
    return result;
  },
  async success({ task }) {
    inmemoryTasks.delete(task.id);
  },
  async failure({ task, err }) {
    inmemoryTasks.set(task.id, {
      ...task,
      failedNr: (task.failedNr ?? 0) + 1,
      failedLast: Date.now(),
      failedError: JSON.stringify({
        instance: (err as Error).constructor.name,
        message: (err as Error).message,
        stack: (err as Error).stack,
      }),
    });
  },
};

/** Define an inmemory task, DOES NOT survive server restarts. */
export function defineInmemoryTask<T>(opts: DefineTaskOpts<T>): Task<T> {
  return defineTaskWithStorageAdapter(
    InmemoryAdapter,
    opts as DefineTaskOpts<unknown>,
  );
}

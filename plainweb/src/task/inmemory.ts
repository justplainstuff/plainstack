import {
  DefineTaskOpts,
  PersistedTask,
  Task,
  TaskStorage,
  composePersistedTask,
  defineTaskWithAdapter,
} from "./task";

// only used for testing
export const inmemoryTasks = new Map<string, PersistedTask<unknown>>();

const InmemoryAdapter: TaskStorage<unknown> = {
  async enqueue({ data, name }) {
    const persistedTask = composePersistedTask({ data, name });
    inmemoryTasks.set(persistedTask.id, persistedTask);
  },
  async fetch({ name, batchSize, maxRetries, retryIntervall }) {
    const result = Array.from(inmemoryTasks.values())
      .filter(
        ({ name: taskName, failedNr, failedLast }) =>
          taskName === name &&
          (failedNr ?? 0) <= maxRetries &&
          (failedLast ?? 0) <= Date.now() - retryIntervall
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

export function defineInmemoryTask<T>(opts: DefineTaskOpts<T>): Task<T> {
  return defineTaskWithAdapter(
    InmemoryAdapter,
    opts as DefineTaskOpts<unknown>
  );
}

import type { PersistedTask } from "./persisted-task";

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

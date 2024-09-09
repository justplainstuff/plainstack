import type { Kysely } from "kysely";

export type Job<T> = {
  name: string;
  process: ({ data }: { data: T }) => Promise<void>;
};

export interface DefineJobOpts<T> {
  name: string;
  process: ({ data }: { data: T }) => Promise<void>;
  pollIntervall?: number;
  batchSize?: number;
  maxRetries?: number;
  retryIntervall?: number;
}

export function defineJob<T>(
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  database: Kysely<any>,
  opts: DefineJobOpts<T>,
): Job<T> {
  return {
    name: opts.name,
    process: opts.process,
  };
}

export async function spawnWorkers(database: Kysely<unknown>) {
  return Promise.reject(new Error("Not implemented"));
}

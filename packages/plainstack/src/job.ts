import type BetterSqlite3Database from "better-sqlite3";

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
  connection: BetterSqlite3Database.Database,
  opts: DefineJobOpts<T>,
): Job<T> {
  return {
    name: opts.name,
    process: opts.process,
  };
}

export async function work() {
  return Promise.reject(new Error("Not implemented"));
}

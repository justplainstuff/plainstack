import type SQLite from "better-sqlite3";
import type { Kysely } from "kysely";
import { type Queue, defineQueue as definePlainjobsQueue } from "plainjobs";

export type Job<T> = {
  name: string;
  run: ({ data }: { data: T }) => Promise<void>;
};

export async function spawnWorkers(database: Kysely<Record<string, unknown>>) {
  return Promise.reject(new Error("Not implemented"));
}

export function isJob<T>(job: unknown): job is Job<T> {
  return (
    typeof job === "object" &&
    job !== null &&
    "run" in job &&
    "name" in job &&
    typeof job.run === "function"
  );
}

export function defineJob<T>(opts: {
  name: string;
  run: ({ data }: { data: T }) => Promise<void>;
}): Job<T> {
  return {
    name: opts.name,
    run: opts.run,
  };
}

export function defineQueue(opts: {
  connection: SQLite.Database;
}): Queue {
  return definePlainjobsQueue({ connection: opts.connection });
}

import type { Kysely } from "kysely";

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

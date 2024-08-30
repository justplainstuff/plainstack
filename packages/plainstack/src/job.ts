import type { Config } from "config";

export interface DefineJobOpts<T> {
  name: string;
  process: ({ data }: { data: T }) => Promise<void>;
  success?: ({ data }: { data: T }) => Promise<void>;
  failure?: ({ data, err }: { data: T; err: unknown }) => Promise<void>;
  pollIntervall?: number;
  batchSize?: number;
  maxRetries?: number;
  retryIntervall?: number;
}

export type Job<T> = {
  name: string;
  process: ({ data }: { data: T }) => Promise<void>;
  success?: ({ data }: { data: T }) => Promise<void>;
  failure?: ({ data, err }: { data: T; err: unknown }) => Promise<void>;
};

export function defineJob<T>(opts: DefineJobOpts<T>): Job<T> {
  return {
    name: opts.name,
    process: opts.process,
    success: opts.success,
    failure: opts.failure,
  };
}

export function work(config: Pick<Config, "database"> | "paths" | "nodeEnv") {}

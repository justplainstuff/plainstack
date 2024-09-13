import path from "node:path";
import type SQLite from "better-sqlite3";
import {
  type Queue,
  defineQueue as definePlainjobsQueue,
  defineWorker,
} from "plainjobs";
import { getLogger } from "./log";
import { getManifest, getManifestOrThrow } from "./manifest/manifest";

export type Job<T> = {
  name: string;
  run: ({ data }: { data: T }) => Promise<void>;
};

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
    name: path.parse(opts.name).name,
    run: opts.run,
  };
}

export function defineQueue(opts: {
  connection: SQLite.Database;
}): Queue {
  const logger = getLogger("queue");
  return definePlainjobsQueue({ connection: opts.connection, logger });
}

// TODO expose scheduled jobs

export async function work(queue: Queue, jobs: Record<string, Job<unknown>>) {
  const log = getLogger("work");
  if (!jobs.length) log.warn("no jobs to run");
  log.info(`starting worker for jobs: ${Object.keys(jobs).join(", ")}`);
  const workers = Object.values(jobs).map((job) =>
    defineWorker(job.name, job.run, { queue, logger: log }),
  );
  await Promise.all(workers.map((worker) => worker.start()));
}

export async function perform<T>(job: Job<T>, data?: T) {
  const log = getLogger("perform");
  log.info(`performing job ${job.name}`);
  const { queue } = await getManifestOrThrow(["queue"]);
  queue.add(job.name, { data });
  log.info(`job ${job.name} queued`);
}

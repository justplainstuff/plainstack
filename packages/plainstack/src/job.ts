import path from "node:path";
import type SQLite from "better-sqlite3";
import {
  type Queue,
  defineQueue as definePlainjobsQueue,
  defineWorker,
} from "plainjobs";
import { getOrThrow } from "./bootstrap/get";
import { test } from "./env";
import { getLogger } from "./log";

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

export type Schedule = {
  name: string;
  cron: string;
  run: () => Promise<void>;
};

export function isSchedule(schedule: unknown): schedule is Schedule {
  return (
    typeof schedule === "object" &&
    schedule !== null &&
    "run" in schedule &&
    "name" in schedule &&
    typeof schedule.run === "function"
  );
}

export function defineSchedule(opts: {
  name: string;
  cron: string;
  run: () => Promise<void>;
}): Schedule {
  return {
    name: path.parse(opts.name).name,
    cron: opts.cron,
    run: opts.run,
  };
}

export function isQueue(q: unknown): q is Queue {
  return typeof q === "object" && q !== null && "add" in q && "schedule" in q;
}

export function defineQueue(opts: {
  connection: SQLite.Database;
}): Queue {
  const logger = getLogger("queue");
  return definePlainjobsQueue({ connection: opts.connection, logger });
}

export async function work(
  queue: Queue,
  jobs: Record<string, Job<unknown>>,
  schedules: Record<string, Schedule>,
) {
  const log = getLogger("work");
  if (!Object.values(jobs).length && !Object.values(schedules).length) {
    log.warn("started worker, but no jobs or schedules to run");
  }
  for (const schedule of Object.values(schedules)) {
    log.debug(`scheduling ${schedule.name} to run at ${schedule.cron}`);
    queue.schedule(schedule.name, { cron: schedule.cron });
  }
  log.debug(`starting worker for jobs: ${Object.keys(jobs).join(", ")}`);
  if (Object.values(schedules).length) {
    log.debug(
      `starting worker for schedules: ${Object.keys(schedules).join(", ")}`,
    );
  }
  const workables = [...Object.values(jobs), ...Object.values(schedules)];
  const workers = workables.map((w) =>
    defineWorker(w.name, w.run, { queue, logger: log }),
  );
  await Promise.all(workers.map((worker) => worker.start()));
}

export async function perform<T>(job: Job<T>, data?: T) {
  const log = getLogger("perform");
  if (test()) {
    log.warn("NODE_ENV=test, performing immediately job in test mode");
    const { jobs } = await getOrThrow(["jobs"]);
    if (!jobs[job.name]) throw new Error(`job ${job.name} not found`);
    await jobs[job.name]?.run({ data });
    return;
  }
  log.debug(`performing job ${job.name}`);
  const { queue } = await getOrThrow(["queue"]);
  queue.default.add(job.name, { data });
  log.debug(`job ${job.name} enqueued`);
}

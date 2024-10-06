import path from "node:path";
import consola from "consola";
import type { Connection } from "plainjob";
import { type Queue, defineQueue, defineWorker } from "plainjob";
import { test } from "./env";

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

export function job<T>(opts: {
  name: string;
  run: ({ data }: { data: T }) => Promise<void>;
}): Job<T> {
  return {
    name: opts.name,
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

export function schedule(opts: {
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

export function queue(opts: {
  connection: Connection;
}): Queue {
  const logger = consola;
  return defineQueue({ connection: opts.connection, logger });
}

export async function work(
  queue: Queue,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  jobs: Record<string, Job<any>>,
  schedules: Record<string, Schedule>,
) {
  const log = consola;
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

export async function perform<T>(queue: Queue, job: Job<T>, data: T) {
  const log = consola;
  if (test()) {
    log.warn("NODE_ENV=test, performing immediately job in test mode");
    await job.run({ data });
    return { id: "test" };
  }
  log.debug(`performing job ${job.name}`);
  return queue.add(job.name, { data });
}

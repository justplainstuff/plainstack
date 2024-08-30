import { parseExpression as parseCron } from "cron-parser";
import type { Job, Logger } from "./jobs";
import type { Queue } from "./queue";

/** Function that processes a job and optionally returns a promise. */
type JobProcessor = (job: Job) => Promise<void> | void;

/** A worker that processes jobs from a queue. */
export type Worker = {
  /** Start the worker, processing jobs one by one. Returns a promise that resolves when the worker is stopped. */
  start: () => Promise<void>;
  /** Stop the worker gracefully, waiting for the current job to finish. */
  stop: () => Promise<void>;
};

type WorkerOptions = {
  /** The queue instance to process jobs from. */
  queue: Queue;
  /** Interval in milliseconds to poll for new jobs (default: 1000). */
  pollIntervall?: number;
  /** Logger instance for the worker (default: console). */
  logger?: Logger;
  /** Callback function called when a job is completed successfully. */
  onCompleted?: (job: Job) => void;
  /** Callback function called when a job fails, providing the error message. */
  onFailed?: (job: Job, error: string) => void;
  /** Callback function called when a job starts processing. */
  onProcessing?: (job: Job) => void;
};

export function defineWorker(
  jobType: string,
  processor: JobProcessor,
  options: WorkerOptions,
): Worker {
  const log = options.logger || console;
  const id = Math.random().toString(36).substring(2, 15);
  const pollInterval = options.pollIntervall ?? 1000;
  const queue = options.queue;
  let shouldKeepRunning = false;
  let isRunning = true;
  let cancelSleep: (() => void) | undefined;
  let sleeping: Promise<void> | undefined;

  async function processScheduledJobs() {
    log.debug(`worker [${id}] checking for scheduled jobs`);
    const scheduledJob = queue.getAndMarkScheduledJobAsProcessing();
    if (scheduledJob) {
      log.debug(
        `worker [${id}] processing scheduled job '${scheduledJob.id}' '${scheduledJob.type}'`,
      );
      const nextRun = parseCron(scheduledJob.cronExpression)
        .next()
        .toDate()
        .getTime();
      queue.markScheduledJobAsIdle(scheduledJob.id, nextRun);
      log.debug(
        `worker [${id}] marking scheduled job ${scheduledJob.id} as 'idle'`,
      );
      queue.add(scheduledJob.type, {});
      log.debug(
        `worker [${id}] adding job '${scheduledJob.id}' '${scheduledJob.type}' from scheduled job`,
      );

      return true;
    }
    return false;
  }

  async function processRegularJobs() {
    log.debug(`worker [${id}] checking for regular jobs`);
    const job = queue.getAndMarkJobAsProcessing(jobType);
    if (job) {
      if (options.onProcessing) {
        options.onProcessing(job);
      }
      log.debug(
        `worker [${id}] processing job ${job.id}, ${job.type}, ${job.data}`,
      );
      try {
        await processor({ id: job.id, data: job.data, type: job.type });
        queue.markJobAsDone(job.id);
        if (options.onCompleted) {
          options.onCompleted(job);
        }
        log.debug(`worker [${id}] marking job ${job.id} as 'done'`);
      } catch (error) {
        const errorMessage = `${(error as Error).stack}\n${(error as Error).message}`;
        queue.markJobAsFailed(job.id, errorMessage);
        if (options.onFailed) {
          options.onFailed(job, errorMessage);
        }
        log.error(`worker [${id}] marking job ${job.id} as 'failed'`);
      }
      return true;
    }
    return false;
  }

  async function start() {
    shouldKeepRunning = true;
    while (shouldKeepRunning) {
      const processedScheduled = await processScheduledJobs();
      const processedRegular = await processRegularJobs();

      if (
        !processedScheduled &&
        !processedRegular &&
        isRunning &&
        shouldKeepRunning
      ) {
        // sleeping until next poll interval
        sleeping = new Promise<void>((resolve) => {
          const timeout = setTimeout(resolve, pollInterval);
          cancelSleep = () => {
            clearTimeout(timeout);
            resolve();
          };
        });
        await sleeping;
        cancelSleep = undefined;
      }
    }
    isRunning = false;
  }

  async function stop() {
    log.info(`worker [${id}] shutting down...`);
    shouldKeepRunning = false;
    if (cancelSleep) {
      cancelSleep();
    }
    log.debug(`worker [${id}] waiting for worker to stop...`);
    await sleeping;
    log.debug(`worker [${id}] shut down`);
  }

  return {
    start,
    stop,
  };
}

/**
 * Start a worker and wait for all jobs to be processed before shutting worker down.
 * This will hang until timeout of worker is not processing all job types in queue. */
export async function processAll(
  queue: Queue,
  worker: Worker,
  opts?: { logger?: Logger; timeout?: number },
) {
  const log = opts?.logger || console;
  const timeout = opts?.timeout ?? 1000;
  worker.start();
  const start = Date.now();
  await new Promise((resolve) => setTimeout(resolve, 10));
  while (
    queue.countJobs({ status: "pending" }) +
      queue.countJobs({ status: "processing" }) >
    0
  ) {
    log.debug("waiting for jobs to be processed");
    await new Promise((resolve) => setTimeout(resolve, 50));
    if (Date.now() - start > timeout) {
      throw new Error("timeout while waiting for all jobs the be processed");
    }
  }
  log.debug("all processed, shutting down worker");
  await worker.stop();
}

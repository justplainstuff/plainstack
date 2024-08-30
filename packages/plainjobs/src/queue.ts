import type { Database } from "better-sqlite3";
import { parseExpression as parseCron } from "cron-parser";
import type {
  JobStatus,
  Logger,
  PersistedJob,
  PersistedScheduledJob,
} from "./jobs";

type QueueOptions = {
  /** A better-sqlite3 database connection. */
  connection: Database;
  /** An optional logger, defaults to console. Winston compatible. */
  logger?: Logger;
  /** Job gets re-queued after this time in milliseconds, defaults to 30min. */
  timeout?: number;
  /** Interval for maintenance tasks in milliseconds, defaults to 1 minute. */
  maintenanceInterval?: number;
  /** Remove done jobs older than this time in milliseconds, defaults to 7 days. */
  removeDoneJobsOlderThan?: number;
  /** Remove failed jobs older than this time in milliseconds, defaults to 30 days. */
  removeFailedJobsOlderThan?: number;
  /** Gets called when done jobs are removed by the maintenance task. */
  onDoneJobsRemoved?: (n: number) => void;
  /** Gets called when failed jobs are removed by the maintenance task. */
  onFailedJobsRemoved?: (n: number) => void;
  /** Gets called when timed out jobs are requeued by the maintenance task. */
  onProcessingJobsRequeued?: (n: number) => void;
};

/** A queue of jobs. */
export type Queue = {
  /** Adds a new job to the queue. */
  add: (type: string, data: unknown) => { id: number };
  /** Schedules a recurring job using a cron expression. */
  schedule: (type: string, { cron }: { cron: string }) => { id: number };
  /** Counts jobs in the queue, optionally filtered by type and/or status. */
  countJobs: (opts?: { type?: string; status?: JobStatus }) => number;
  /** Retrieves a job by its ID. */
  getJobById: (id: number) => PersistedJob | undefined;
  /** Gets a list of all unique job types in the queue. */
  getJobTypes: () => string[];
  /** Retrieves all scheduled jobs. */
  getScheduledJobs: () => PersistedScheduledJob[];
  /** Retrieves a scheduled job by its ID. */
  getScheduledJobById: (id: number) => PersistedScheduledJob | undefined;
  /** Requeues jobs that have exceeded the specified timeout. */
  requeueTimedOutJobs: (timeout: number) => void;
  /** Removes completed jobs older than the specified duration. */
  removeDoneJobs: (olderThan: number) => void;
  /** Removes failed jobs older than the specified duration. */
  removeFailedJobs: (olderThan: number) => void;
  /** Fetches the next pending job of the specified type and marks it as processing. */
  getAndMarkJobAsProcessing: (type: string) => PersistedJob | undefined;
  /** Fetches the next scheduled job due for execution and marks it as processing. */
  getAndMarkScheduledJobAsProcessing: () => PersistedScheduledJob | undefined;
  /** Marks a job as completed. */
  markJobAsDone: (id: number) => void;
  /** Marks a job as failed with an error message. */
  markJobAsFailed: (id: number, error: string) => void;
  /** Marks a scheduled job as idle and sets its next execution time. */
  markScheduledJobAsIdle: (id: number, nextRun: number) => void;
  /** Closes the queue, stopping maintenance tasks and releasing resources. */
  close: () => void;
};

export function defineQueue(opts: QueueOptions): Queue {
  const db = opts.connection;
  const log = opts.logger || console;
  const jobProcessingTimeout = opts.timeout || 30 * 60 * 1000; // 30 minutes
  const maintenanceInterval = opts.maintenanceInterval || 60 * 1000; // 1 minute
  const removeDoneJobsOlderThan =
    opts.removeDoneJobsOlderThan || 7 * 24 * 60 * 60 * 1000; // 7 days
  const removeFailedJobsOlderThan =
    opts.removeFailedJobsOlderThan || 30 * 24 * 60 * 60 * 1000; // 30 days
  let maintenanceTimeout: NodeJS.Timeout;

  db.pragma("journal_mode = WAL");
  db.pragma("synchronous = 1");
  db.pragma("busy_timeout = 5000");

  db.exec(`
    CREATE TABLE IF NOT EXISTS plainjobs_jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      data TEXT NOT NULL,
      status TEXT DEFAULT 'pending' NOT NULL,
      failed_at INTEGER,
      error TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_jobs_status_type_created_at ON plainjobs_jobs (status, type, created_at);

    CREATE TABLE IF NOT EXISTS plainjobs_scheduled_jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL UNIQUE,
      status TEXT DEFAULT 'idle' NOT NULL,
      cron_expression TEXT,
      next_run INTEGER,
      created_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_status_type_next_run ON plainjobs_scheduled_jobs (status, type, next_run);
  `);

  const removeDoneJobsStmt = db.prepare(`
    DELETE FROM plainjobs_jobs 
    WHERE status = 'done' AND created_at < @threshold
  `);

  const removeFailedJobsStmt = db.prepare(`
    DELETE FROM plainjobs_jobs 
    WHERE status = 'failed' AND failed_at < @threshold
  `);

  function initializeMaintenance() {
    maintenanceTimeout = setInterval(() => {
      queue.requeueTimedOutJobs(jobProcessingTimeout);
      queue.removeDoneJobs(removeDoneJobsOlderThan);
      queue.removeFailedJobs(removeFailedJobsOlderThan);
    }, maintenanceInterval);
  }

  const countJobsStmt = db.prepare("SELECT COUNT(*) FROM plainjobs_jobs");

  const countJobsByTypeAndStatusStmt = db.prepare(
    "SELECT COUNT(*) FROM plainjobs_jobs WHERE status = @status AND type = @type",
  );

  const countJobsByStatusStmt = db.prepare(
    "SELECT COUNT(*) FROM plainjobs_jobs WHERE status = @status",
  );

  const countJobsByTypeStmt = db.prepare(
    "SELECT COUNT(*) FROM plainjobs_jobs WHERE type = @type",
  );

  const getJobTypesStmt = db.prepare(
    "SELECT DISTINCT type FROM plainjobs_jobs",
  );

  const getJobByIdStmt = db.prepare(`
    SELECT 
      id,
      type,
      data,
      status,
      created_at as createdAt,
      failed_at as failedAt,
      error
    FROM plainjobs_jobs 
    WHERE id = ?
  `);

  const getScheduledJobByIdStmt = db.prepare(`
    SELECT 
      id,
      type,
      status,
      created_at as createdAt,
      cron_expression as cronExpression,
      next_run as nextRun
    FROM plainjobs_scheduled_jobs 
    WHERE id = ?
  `);

  const getScheduledJobByTypeStmt = db.prepare(`
    SELECT 
      id,
      type,
      status,
      created_at as createdAt,
      cron_expression as cronExpression,
      next_run as nextRun
    FROM plainjobs_scheduled_jobs 
    WHERE type = @type
  `);

  const getScheduledJobsStmt = db.prepare(`
    SELECT 
      id,
      type,
      status,
      created_at as createdAt,
      cron_expression as cronExpression,
      next_run as nextRun
    FROM plainjobs_scheduled_jobs
    ORDER BY created_at
  `);

  const insertJobStmt = db.prepare(
    "INSERT INTO plainjobs_jobs (type, data, created_at) VALUES (@type, @data, @createdAt)",
  );

  const insertScheduledJobStmt = db.prepare(
    "INSERT INTO plainjobs_scheduled_jobs (type, cron_expression, next_run, created_at) VALUES (@type, @cronExpression, @nextRun, @createdAt)",
  );

  const updateScheduledJobCronExpressionStmt = db.prepare(`
    UPDATE plainjobs_scheduled_jobs SET cron_expression = @cronExpression WHERE id = @id
  `);

  const requeueTimedOutJobsStmt = db.prepare(`
    UPDATE plainjobs_jobs SET status = 'pending' WHERE status = 'processing' AND created_at < @threshold
  `);

  const getNextPendingJobStmt = db.prepare(`
    SELECT 
      id,
      type,
      data,
      created_at as createdAt,
      status,
      failed_at as failedAt,
      error
    FROM plainjobs_jobs 
    WHERE status = 'pending' AND type = @type
    ORDER BY created_at LIMIT 1
  `);

  const getNextScheduledJobStmt = db.prepare(`
    SELECT 
      id,
      type,
      status,
      created_at as createdAt,
      cron_expression as cronExpression,
      next_run as nextRun
    FROM plainjobs_scheduled_jobs 
    WHERE status = 'idle' AND next_run <= @now
    ORDER BY next_run LIMIT 1
  `);

  const updateJobStatusStmt = db.prepare(`
    UPDATE plainjobs_jobs SET status = @status WHERE id = @id
  `);

  const updateScheduledJobStatusStmt = db.prepare(`
    UPDATE plainjobs_scheduled_jobs SET status = @status, next_run = @nextRun WHERE id = @id
  `);

  const failJobStmt = db.prepare(`
    UPDATE plainjobs_jobs SET status = 'failed', failed_at = @failedAt, error = @error WHERE id = @id
  `);

  const queue: Queue = {
    add(type: string, data: unknown): { id: number } {
      const serializedData = JSON.stringify(data);
      const result = insertJobStmt.run({
        type,
        data: serializedData,
        createdAt: Date.now(),
      });
      return { id: result.lastInsertRowid as number };
    },
    schedule(type: string, { cron }: { cron: string }): { id: number } {
      try {
        parseCron(cron);
      } catch (error) {
        throw new Error(
          `invalid cron expression provided: ${cron} ${(error as Error).message}`,
        );
      }
      const found = getScheduledJobByTypeStmt.get({
        type,
      }) as PersistedScheduledJob | undefined;
      if (found) {
        log.debug(
          `updating existing scheduled job ${found.id} with cron expression ${cron}`,
        );
        updateScheduledJobCronExpressionStmt.run({
          cronExpression: cron,
          id: found.id,
        });
        return { id: found.id };
      }
      const result = insertScheduledJobStmt.run({
        type,
        cronExpression: cron,
        nextRun: 0,
        createdAt: Date.now(),
      });
      return { id: result.lastInsertRowid as number };
    },
    countJobs(opts?: { type?: string; status?: JobStatus }) {
      if (opts?.status && !opts?.type) {
        const result = countJobsByStatusStmt.get({ status: opts.status }) as {
          "COUNT(*)": number;
        };
        return result["COUNT(*)"];
      }
      if (opts?.type && !opts?.status) {
        const result = countJobsByTypeStmt.get({ type: opts.type }) as {
          "COUNT(*)": number;
        };
        return result["COUNT(*)"];
      }
      if (opts?.type && opts?.status) {
        const result = countJobsByTypeAndStatusStmt.get({
          type: opts.type,
          status: opts.status,
        }) as { "COUNT(*)": number };
        return result["COUNT(*)"];
      }
      const result = countJobsStmt.get() as { "COUNT(*)": number };
      return result["COUNT(*)"];
    },
    getJobById(id: number): PersistedJob | undefined {
      return getJobByIdStmt.get(id) as PersistedJob | undefined;
    },
    getJobTypes() {
      const result = getJobTypesStmt.all() as { type: string }[];
      return result.map((row) => row.type);
    },
    getScheduledJobs() {
      const result = getScheduledJobsStmt.all() as PersistedScheduledJob[];
      return result;
    },
    getScheduledJobById(id: number): PersistedScheduledJob | undefined {
      return getScheduledJobByIdStmt.get(id) as
        | PersistedScheduledJob
        | undefined;
    },
    requeueTimedOutJobs(timeout: number) {
      const now = Date.now();
      const result = requeueTimedOutJobsStmt.run({ threshold: now - timeout });
      log.debug(`requeued ${result.changes} timed out jobs`);
      if (opts.onProcessingJobsRequeued) {
        opts.onProcessingJobsRequeued(result.changes);
      }
    },
    removeDoneJobs(olderThan: number) {
      const now = Date.now();
      const result = removeDoneJobsStmt.run({ threshold: now - olderThan });
      log.debug(`removed ${result.changes} done jobs`);
      if (opts.onDoneJobsRemoved) {
        opts.onDoneJobsRemoved(result.changes);
      }
    },
    removeFailedJobs(olderThan: number) {
      const now = Date.now();
      const result = removeFailedJobsStmt.run({ threshold: now - olderThan });
      log.debug(`removed ${result.changes} failed jobs`);
      if (opts.onFailedJobsRemoved) {
        opts.onFailedJobsRemoved(result.changes);
      }
    },
    getAndMarkJobAsProcessing(type: string): PersistedJob | undefined {
      return db
        .transaction((type: string): PersistedJob | undefined => {
          const job = getNextPendingJobStmt.get({
            type,
          }) as PersistedJob | undefined;

          if (job) {
            updateJobStatusStmt.run({ status: "processing", id: job.id });
            return { ...job, status: "processing" };
          }
          return undefined;
        })
        .immediate(type);
    },
    getAndMarkScheduledJobAsProcessing(): PersistedScheduledJob | undefined {
      return db
        .transaction((): PersistedScheduledJob | undefined => {
          const job = getNextScheduledJobStmt.get({
            now: Date.now(),
          }) as PersistedScheduledJob | undefined;

          if (job) {
            updateScheduledJobStatusStmt.run({
              status: "processing",
              id: job.id,
              nextRun: job.nextRun,
            });
            return { ...job, status: "processing" };
          }
          return undefined;
        })
        .immediate();
    },
    markJobAsDone(id: number) {
      return updateJobStatusStmt.run({ status: "done", id });
    },
    markJobAsFailed(id: number, error: string) {
      return failJobStmt.run({
        failedAt: Date.now(),
        error,
        id,
      });
    },
    markScheduledJobAsIdle(id: number, nextRun: number) {
      return updateScheduledJobStatusStmt.run({
        status: "idle",
        id,
        nextRun,
      });
    },
    close() {
      if (maintenanceTimeout) {
        clearInterval(maintenanceTimeout);
      }
      db.close();
    },
  };

  initializeMaintenance();

  return queue;
}

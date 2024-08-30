import BetterSqlite3Database from "better-sqlite3";
import { describe, expect, it } from "vitest";
import { defineQueue, defineWorker } from "../src/plainjobs";
import type { Job } from "../src/plainjobs";
import { processAll } from "../src/worker";

describe("queue", async () => {
  it("should add a job to the queue", async () => {
    const connection = new BetterSqlite3Database(":memory:");
    const queue = defineQueue({ connection });
    queue.add("paint", { color: "red" });
    const job = queue.getAndMarkJobAsProcessing("paint");
    if (!job) throw new Error("Job not found");
    expect(JSON.parse(job.data)).toEqual({ color: "red" });
    queue.close();
  });

  it("should mark jobs as done or failed", async () => {
    const connection = new BetterSqlite3Database(":memory:");
    const queue = defineQueue({ connection });
    queue.add("test", { step: 1 });
    const job = queue.getAndMarkJobAsProcessing("test");
    if (!job) throw new Error("job not found");
    expect(job.status).toBe("processing");

    queue.markJobAsDone(job.id);

    queue.add("test", { step: 2 });
    const failedJob = queue.getAndMarkJobAsProcessing("test");
    if (!failedJob) throw new Error("job not found");
    queue.markJobAsFailed(failedJob.id, "test error");
    const found = queue.getJobById(failedJob.id);
    expect(found?.status).toBe("failed");
    expect(found?.error).toBe("test error");
  });

  it("should throw an error when adding a job with an invalid cron expression", () => {
    const connection = new BetterSqlite3Database(":memory:");
    const queue = defineQueue({ connection });

    expect(() => {
      queue.schedule("invalid", { cron: "invalid cron expression" });
    }).toThrow("invalid cron expression provided");
  });

  it("should get and mark scheduled job as processing", async () => {
    const connection = new BetterSqlite3Database(":memory:");
    const queue = defineQueue({ connection });

    queue.schedule("scheduled", { cron: "* * * * *" });

    const job = queue.getAndMarkScheduledJobAsProcessing();
    if (!job) throw new Error("Job not found");
    expect(job).toBeDefined();
    expect(job?.status).toBe("processing");

    const updatedJob = queue.getScheduledJobById(job.id);
    expect(updatedJob?.status).toBe("processing");

    queue.close();
  });

  it("should mark scheduled job as idle with next run time", async () => {
    const connection = new BetterSqlite3Database(":memory:");
    const queue = defineQueue({ connection });

    const { id } = queue.schedule("scheduled", { cron: "* * * * * *" });

    const job = queue.getAndMarkScheduledJobAsProcessing();
    expect(job).toBeDefined();

    const nextRun = Date.now() + 60000; // 1 minute from now
    queue.markScheduledJobAsIdle(id, nextRun);

    const updatedJob = queue.getScheduledJobById(id);
    expect(updatedJob?.status).toBe("idle");
    expect(updatedJob?.nextRun).toBe(nextRun);

    queue.close();
  });

  it("should requeue timed out jobs", async () => {
    const connection = new BetterSqlite3Database(":memory:");
    const queue = defineQueue({
      connection,
      timeout: 25,
      maintenanceInterval: 20,
    });

    const { id } = queue.add("test", { value: "timeout test" });

    const job = queue.getAndMarkJobAsProcessing("test");
    expect(job).toBeDefined();
    expect(job?.id).toBe(id);
    expect(job?.status).toBe("processing");

    await new Promise((resolve) => setTimeout(resolve, 80));

    const requeuedJob = queue.getJobById(id);
    expect(requeuedJob?.status).toBe("pending");

    queue.close();
  });

  it("should remove done jobs older than specified time", async () => {
    const connection = new BetterSqlite3Database(":memory:");
    const queue = defineQueue({
      connection,
      removeDoneJobsOlderThan: 20,
    });

    const { id: oldJobId } = queue.add("test", { value: "old job" });
    const oldJob = queue.getAndMarkJobAsProcessing("test");
    if (oldJob) queue.markJobAsDone(oldJob.id);

    await new Promise((resolve) => setTimeout(resolve, 50));

    const { id: newJobId } = queue.add("test", { value: "new job" });
    const newJob = queue.getAndMarkJobAsProcessing("test");
    if (newJob) queue.markJobAsDone(newJob.id);

    queue.removeDoneJobs(20);

    expect(queue.getJobById(oldJobId)).toBeUndefined();
    expect(queue.getJobById(newJobId)).toBeDefined();

    queue.close();
  });

  it("should remove failed jobs older than specified time", async () => {
    const connection = new BetterSqlite3Database(":memory:");
    const queue = defineQueue({
      connection,
      removeFailedJobsOlderThan: 20,
    });

    const { id: oldJobId } = queue.add("test", { value: "old job" });
    const oldJob = queue.getAndMarkJobAsProcessing("test");
    if (oldJob) queue.markJobAsFailed(oldJob.id, "Test error");

    await new Promise((resolve) => setTimeout(resolve, 50));

    const { id: newJobId } = queue.add("test", { value: "new job" });
    const newJob = queue.getAndMarkJobAsProcessing("test");
    if (newJob) queue.markJobAsFailed(newJob.id, "Test error");

    queue.removeFailedJobs(20);

    expect(queue.getJobById(oldJobId)).toBeUndefined();
    expect(queue.getJobById(newJobId)).toBeDefined();

    queue.close();
  });

  it("should count jobs by type and status", async () => {
    const connection = new BetterSqlite3Database(":memory:");
    const queue = defineQueue({ connection });

    queue.add("test1", { value: 1 });
    queue.add("test1", { value: 2 });
    queue.add("test2", { value: 3 });
    queue.add("test3", { value: 3 });

    expect(queue.countJobs({ type: "test1", status: "pending" })).toBe(2);
    expect(queue.countJobs({ type: "test2", status: "pending" })).toBe(1);
    expect(queue.countJobs({ type: "test1", status: "processing" })).toBe(0);
    expect(queue.countJobs({ type: "test3" })).toBe(1);
    expect(queue.countJobs({ status: "pending" })).toBe(4);
    expect(queue.countJobs()).toBe(4);

    const job = queue.getAndMarkJobAsProcessing("test1");
    expect(queue.countJobs({ type: "test1", status: "processing" })).toBe(1);
    expect(queue.countJobs({ type: "test1", status: "pending" })).toBe(1);
    expect(queue.countJobs({ status: "pending" })).toBe(3);

    if (job) queue.markJobAsDone(job.id);
    expect(queue.countJobs({ type: "test1", status: "done" })).toBe(1);
    expect(queue.countJobs()).toBe(4);

    queue.close();
  });

  it("should return all scheduled jobs", async () => {
    const connection = new BetterSqlite3Database(":memory:");
    const queue = defineQueue({ connection });

    queue.schedule("job1", { cron: "* * * * *" });
    queue.schedule("job2", { cron: "0 0 * * *" });
    queue.schedule("job3", { cron: "0 12 * * MON-FRI" });

    const scheduledJobs = queue.getScheduledJobs();

    expect(scheduledJobs).toHaveLength(3);
    expect(scheduledJobs[0]?.type).toBe("job1");
    expect(scheduledJobs[1]?.type).toBe("job2");
    expect(scheduledJobs[2]?.type).toBe("job3");
    expect(scheduledJobs[0]?.cronExpression).toBe("* * * * *");
    expect(scheduledJobs[1]?.cronExpression).toBe("0 0 * * *");
    expect(scheduledJobs[2]?.cronExpression).toBe("0 12 * * MON-FRI");

    queue.close();
  });

  it("should return an empty array when no scheduled jobs exist", async () => {
    const connection = new BetterSqlite3Database(":memory:");
    const queue = defineQueue({ connection });

    const scheduledJobs = queue.getScheduledJobs();

    expect(scheduledJobs).toHaveLength(0);
    expect(scheduledJobs).toEqual([]);

    queue.close();
  });

  it("should return all unique job types", async () => {
    const connection = new BetterSqlite3Database(":memory:");
    const queue = defineQueue({ connection });

    queue.add("type1", { data: "job1" });
    queue.add("type2", { data: "job2" });
    queue.add("type1", { data: "job3" });
    queue.add("type3", { data: "job4" });

    const jobTypes = queue.getJobTypes();

    expect(jobTypes).toHaveLength(3);
    expect(jobTypes).toContain("type1");
    expect(jobTypes).toContain("type2");
    expect(jobTypes).toContain("type3");

    queue.close();
  });

  it("should return an empty array when no jobs exist", async () => {
    const connection = new BetterSqlite3Database(":memory:");
    const queue = defineQueue({ connection });

    const jobTypes = queue.getJobTypes();

    expect(jobTypes).toHaveLength(0);
    expect(jobTypes).toEqual([]);

    queue.close();
  });

  it("should call onDoneJobsRemoved when done jobs are removed", async () => {
    let removedJobs = 0;
    const connection = new BetterSqlite3Database(":memory:");
    const queue = defineQueue({
      connection,
      removeDoneJobsOlderThan: 10,
      onDoneJobsRemoved: (n) => {
        removedJobs = n;
      },
    });

    queue.add("test", { value: "old job" });
    const job = queue.getAndMarkJobAsProcessing("test");
    if (job) queue.markJobAsDone(job.id);

    await new Promise((resolve) => setTimeout(resolve, 20));

    queue.removeDoneJobs(10);

    expect(removedJobs).toBe(1);

    queue.close();
  });

  it("should call onFailedJobsRemoved when failed jobs are removed", async () => {
    let removedJobs = 0;
    const connection = new BetterSqlite3Database(":memory:");
    const queue = defineQueue({
      connection,
      removeFailedJobsOlderThan: 10,
      onFailedJobsRemoved: (n) => {
        removedJobs = n;
      },
    });

    queue.add("test", { value: "old job" });
    const job = queue.getAndMarkJobAsProcessing("test");
    if (job) queue.markJobAsFailed(job.id, "Test error");

    await new Promise((resolve) => setTimeout(resolve, 20));

    queue.removeFailedJobs(10);

    expect(removedJobs).toBe(1);

    queue.close();
  });

  it("should call onProcessingJobsRequeued when processing jobs are requeued", async () => {
    let requeuedJobs = 0;
    const connection = new BetterSqlite3Database(":memory:");
    const queue = defineQueue({
      connection,
      timeout: 10,
      onProcessingJobsRequeued: (n) => {
        requeuedJobs = n;
      },
    });

    queue.add("test", { value: "timeout test" });
    queue.getAndMarkJobAsProcessing("test");

    await new Promise((resolve) => setTimeout(resolve, 20));

    queue.requeueTimedOutJobs(10);

    expect(requeuedJobs).toBe(1);

    queue.close();
  });

  it("should update an existing scheduled job when adding the same type with a different cron expression", async () => {
    const connection = new BetterSqlite3Database(":memory:");
    const queue = defineQueue({ connection });

    const { id: initialId } = queue.schedule("updateTest", {
      cron: "0 * * * *",
    });

    const initialJob = queue.getScheduledJobById(initialId);
    expect(initialJob).toBeDefined();
    expect(initialJob?.cronExpression).toBe("0 * * * *");

    const { id: updatedId } = queue.schedule("updateTest", {
      cron: "*/30 * * * *",
    });

    expect(updatedId).toBe(initialId);

    const updatedJob = queue.getScheduledJobById(updatedId);
    expect(updatedJob).toBeDefined();
    expect(updatedJob?.cronExpression).toBe("*/30 * * * *");

    const allJobs = queue.getScheduledJobs();
    const updateTestJobs = allJobs.filter((job) => job.type === "updateTest");
    expect(updateTestJobs).toHaveLength(1);

    queue.close();
  });
});

describe("worker", async () => {
  it("should process jobs with a worker", async () => {
    const connection = new BetterSqlite3Database(":memory:");
    const queue = defineQueue({ connection });
    const results: unknown[] = [];
    const worker = defineWorker(
      "test",
      async (job: Job) => {
        results.push(JSON.parse(job.data));
      },
      { queue },
    );

    queue.add("test", { value: 1 });
    queue.add("test", { value: 2 });

    await processAll(queue, worker);

    expect(results).toEqual([{ value: 1 }, { value: 2 }]);
  });

  it("should process scheduled jobs", async () => {
    const connection = new BetterSqlite3Database(":memory:");
    const queue = defineQueue({ connection });
    const results: unknown[] = [];
    const worker = defineWorker(
      "scheduled",
      async (job: Job) => {
        results.push(JSON.parse(job.data));
      },
      { queue },
    );

    queue.schedule("scheduled", { cron: "* * * * *" });

    worker.start();
    await worker.stop();

    expect(results[0]).toEqual({});
  });

  it("should add a job with id and retrieve it", async () => {
    const connection = new BetterSqlite3Database(":memory:");
    const queue = defineQueue({ connection });

    const { id } = queue.add("paint", { color: "blue" });
    expect(id).toBeDefined();

    const job = queue.getJobById(id);
    expect(job).toBeDefined();
    expect(job?.type).toBe("paint");
    expect(JSON.parse(job?.data as string)).toEqual({ color: "blue" });

    const worker = defineWorker("paint", async (job: Job) => {}, { queue });

    await processAll(queue, worker);

    const processedJob = queue.getJobById(id);
    expect(processedJob?.status).toBe("done");
    expect(processedJob?.type).toBe("paint");
  });

  it("should reprocess a job that has been stuck in processing for too long", async () => {
    const connection = new BetterSqlite3Database(":memory:");
    const queue = defineQueue({
      connection,
      timeout: 10,
      maintenanceInterval: 40,
    });

    const { id } = queue.add("test", { value: "timeout test" });

    // simulate worker dying
    const job = queue.getAndMarkJobAsProcessing("test");
    expect(job).toBeDefined();
    expect(job?.id).toBe(id);
    expect(job?.status).toBe("processing");

    await new Promise((resolve) => setTimeout(resolve, 70));

    const results: unknown[] = [];
    const worker = defineWorker(
      "test",
      async (job: Job) => {
        results.push(JSON.parse(job.data));
      },
      { queue },
    );

    await processAll(queue, worker);

    expect(results).toEqual([{ value: "timeout test" }]);
  });

  it("should store error information when a job fails", async () => {
    const connection = new BetterSqlite3Database(":memory:");
    const queue = defineQueue({ connection });

    const { id } = queue.add("test", { value: "error test" });

    const worker = defineWorker(
      "test",
      async (job: Job) => {
        throw new Error("test error");
      },
      { queue },
    );

    await processAll(queue, worker);

    const failedJob = queue.getJobById(id);
    expect(failedJob).toBeDefined();
    expect(failedJob?.status).toBe("failed");
    expect(failedJob?.failedAt).toBeDefined();
    expect(failedJob?.failedAt).not.toBeNull();
    expect(failedJob?.error).toContain("test error");
  });

  it("should store error information when a scheduled job fails", async () => {
    const connection = new BetterSqlite3Database(":memory:");
    const queue = defineQueue({ connection });

    const { id } = queue.schedule("paint", { cron: "* * * * * *" });

    const worker = defineWorker(
      "paint",
      async (job: Job) => {
        throw new Error("test error");
      },
      { queue },
    );

    worker.start();
    await worker.stop();

    const failedJob = queue.getJobById(id);
    expect(failedJob).toBeDefined();
    expect(failedJob?.status).toBe("failed");
    expect(failedJob?.failedAt).toBeDefined();
    expect(failedJob?.error).toContain("test error");
    expect(failedJob?.failedAt).not.toBeNull();
  });

  it("should call onProcessing when a job starts processing", async () => {
    const connection = new BetterSqlite3Database(":memory:");
    const queue = defineQueue({ connection });
    let processingCalled = false;

    const worker = defineWorker("test", async (job: Job) => {}, {
      queue,
      onProcessing: (job: Job) => {
        processingCalled = true;
      },
    });

    queue.add("test", { value: "processing test" });
    await processAll(queue, worker);

    expect(processingCalled).toBe(true);
  });

  it("should call onCompleted when a job is completed", async () => {
    const connection = new BetterSqlite3Database(":memory:");
    const queue = defineQueue({ connection });
    let completedJob!: Job;

    const worker = defineWorker("test", async (job: Job) => {}, {
      queue,
      onCompleted: (job: Job) => {
        completedJob = job;
      },
    });

    queue.add("test", { value: "completed test" });
    await processAll(queue, worker);

    expect(JSON.parse(completedJob.data)).toEqual({ value: "completed test" });
  });

  it("should call onFailed when a job fails", async () => {
    const connection = new BetterSqlite3Database(":memory:");
    const queue = defineQueue({ connection });
    let failedJob!: Job;
    let failedError!: string;

    const worker = defineWorker(
      "test",
      async (job: Job) => {
        throw new Error("Test error");
      },
      {
        queue,
        onFailed: (job: Job, error: string) => {
          failedJob = job;
          failedError = error;
        },
      },
    );

    queue.add("test", { value: "failed test" });
    await processAll(queue, worker);

    expect(JSON.parse(failedJob.data)).toEqual({ value: "failed test" });
    expect(failedError).toContain("Test error");
  });
});

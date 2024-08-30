import { type ChildProcess, fork } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { defineQueue, defineWorker } from "../src/plainjobs";
import type { Job, Logger, Queue, Worker } from "../src/plainjobs";
import { processAll } from "../src/worker";

const logger: Logger = {
  error: console.error,
  warn: console.warn,
  info: () => {},
  debug: () => {},
};

function queueJobs(queue: Queue, count: number) {
  for (let i = 0; i < count; i++) {
    queue.add("bench", { jobId: i });
  }
}

async function runScenario(
  dbUrl: string,
  jobCount: number,
  concurrent: number,
  parallel: number,
) {
  console.log(
    `running scenario - jobs: ${jobCount}, workers: ${concurrent}, parallel workers: ${parallel}`,
  );

  if (dbUrl !== ":memory:" && fs.existsSync(dbUrl)) {
    fs.unlinkSync(dbUrl);
  }
  const connection = new Database(dbUrl);
  const queue = defineQueue({ connection, logger });

  queueJobs(queue, jobCount);

  const start = Date.now();

  const workerPromises: Promise<void>[] = [];

  for (let i = 0; i < concurrent; i++) {
    const worker = defineWorker(
      "bench",
      async (job: Job) => new Promise((resolve) => setTimeout(resolve, 0)),
      { queue, logger },
    );
    workerPromises.push(
      processAll(queue, worker, { logger, timeout: 60 * 1000 }),
    );
  }

  for (let i = 0; i < parallel; i++) {
    workerPromises.push(spawnWorkerProcess(dbUrl));
  }

  await Promise.all(workerPromises);

  queue.close();

  const elapsed = Date.now() - start;
  const jobsPerSecond = jobCount / (elapsed / 1000);

  console.log(`database: ${dbUrl}`);
  console.log(`jobs: ${jobCount}`);
  console.log(`concurrent workers: ${concurrent}`);
  console.log(`parallel workers: ${parallel}`);
  console.log(`time elapsed: ${elapsed} ms`);
  console.log(`jobs/second: ${jobsPerSecond.toFixed(2)}`);
  console.log("------------------------");

  return jobsPerSecond;
}

function spawnWorkerProcess(dbUrl: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const workerPath = path.join(__dirname, "bench-worker");
    const child: ChildProcess = fork(workerPath, [dbUrl]);

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`worker process exited with code ${code}`));
      }
    });
  });
}

// TODO implement throw if slower with diff printing
async function runScenarios() {
  // memory-based scenarios
  await runScenario(":memory:", 1000, 1, 0);
  await runScenario(":memory:", 4000, 4, 0);
  await runScenario(":memory:", 8000, 8, 0);
  // file-based scenarios
  await runScenario("bench.db", 100, 0, 1);
  await runScenario("bench.db", 1000, 0, 1);
  await runScenario("bench.db", 2000, 0, 2);
  await runScenario("bench.db", 4000, 0, 4);
  await runScenario("bench.db", 8000, 0, 8);
  await runScenario("bench.db", 16000, 0, 16);
  await runScenario("bench.db", 32000, 0, 32);
  await runScenario("bench.db", 64000, 0, 64);
}

runScenarios().catch(console.error);

// running scenario - jobs: 1000, workers: 1, parallel workers: 0
// database: :memory:
// jobs: 1000
// concurrent workers: 1
// parallel workers: 0
// time elapsed: 1314 ms
// jobs/second: 761.04
// ------------------------
// running scenario - jobs: 4000, workers: 4, parallel workers: 0
// database: :memory:
// jobs: 4000
// concurrent workers: 4
// parallel workers: 0
// time elapsed: 1588 ms
// jobs/second: 2518.89
// ------------------------
// running scenario - jobs: 8000, workers: 8, parallel workers: 0
// database: :memory:
// jobs: 8000
// concurrent workers: 8
// parallel workers: 0
// time elapsed: 2391 ms
// jobs/second: 3345.88
// ------------------------
// running scenario - jobs: 100, workers: 0, parallel workers: 1
// database: bench.db
// jobs: 100
// concurrent workers: 0
// parallel workers: 1
// time elapsed: 191 ms
// jobs/second: 523.56
// ------------------------
// running scenario - jobs: 1000, workers: 0, parallel workers: 1
// database: bench.db
// jobs: 1000
// concurrent workers: 0
// parallel workers: 1
// time elapsed: 188 ms
// jobs/second: 5319.15
// ------------------------
// running scenario - jobs: 2000, workers: 0, parallel workers: 2
// database: bench.db
// jobs: 2000
// concurrent workers: 0
// parallel workers: 2
// time elapsed: 195 ms
// jobs/second: 10256.41
// ------------------------
// running scenario - jobs: 4000, workers: 0, parallel workers: 4
// database: bench.db
// jobs: 4000
// concurrent workers: 0
// parallel workers: 4
// time elapsed: 203 ms
// jobs/second: 19704.43
// ------------------------
// running scenario - jobs: 8000, workers: 0, parallel workers: 8
// database: bench.db
// jobs: 8000
// concurrent workers: 0
// parallel workers: 8
// time elapsed: 289 ms
// jobs/second: 27681.66
// ------------------------
// running scenario - jobs: 16000, workers: 0, parallel workers: 16
// database: bench.db
// jobs: 16000
// concurrent workers: 0
// parallel workers: 16
// time elapsed: 575 ms
// jobs/second: 27826.09
// ------------------------
// running scenario - jobs: 32000, workers: 0, parallel workers: 32
// database: bench.db
// jobs: 32000
// concurrent workers: 0
// parallel workers: 32
// time elapsed: 1193 ms
// jobs/second: 26823.13
// ------------------------
// running scenario - jobs: 64000, workers: 0, parallel workers: 64
// database: bench.db
// jobs: 64000
// concurrent workers: 0
// parallel workers: 64
// time elapsed: 2440 ms
// jobs/second: 26229.51
// ------------------------

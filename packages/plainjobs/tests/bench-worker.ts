import Database from "better-sqlite3";
import { defineQueue, defineWorker } from "../src/plainjobs";
import type { Job, Logger } from "../src/plainjobs";
import { processAll } from "../src/worker";

const logger: Logger = {
  error: console.error,
  warn: console.warn,
  info: () => {},
  debug: () => {},
};

const dbUrl = process.argv[2];

if (!dbUrl) {
  console.error("invalid database url specified");
  process.exit(1);
}

const connection = new Database(dbUrl);

const queue = defineQueue({ connection, logger });
const worker = defineWorker(
  "bench",
  async (job: Job) => new Promise((resolve) => setTimeout(resolve, 0)),
  { queue, logger },
);

async function run() {
  processAll(queue, worker, { logger, timeout: 60 * 1000 });
  queue.close();
  process.exit(0);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

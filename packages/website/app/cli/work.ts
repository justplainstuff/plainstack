import { getLogger, getWorker } from "plainstack";
import config from "plainweb.config";

const log = getLogger("work");

async function serve() {
  const worker = getWorker(config);
  await worker.start();
  log.info("⚡️ background workers");
}

serve();

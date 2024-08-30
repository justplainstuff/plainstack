import { getApp, getWorker, log } from "plainstack";
import config from "plainweb.config";

async function serve() {
  const worker = getWorker(config);
  await worker.start();
  log.info("⚡️ background task worker started");
  const app = await getApp(config);
  app.listen(config.http.port);
  log.info(`⚡️ http://localhost:${config.http.port}`);
}

serve();

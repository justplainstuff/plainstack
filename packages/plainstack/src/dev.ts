#!/usr/bin/env -S npx tsx watch

import { loadAndGetAppConfig } from "./app-config";
import { loadAndGetConfig } from "./config";
import { spawnWorkers } from "./job";
import { getLogger } from "./log";

const log = getLogger("dev");

async function main() {
  const config = await loadAndGetConfig();
  const appConfig = await loadAndGetAppConfig({ config });
  // TODO start-inmemory worker
  appConfig.app.listen(config.port);
  log.info(`⚡️ http://localhost:${config.port}`);
  //   void spawnWorkers(appConfig.database);
  //   log.info("⚡️ worker started");
}

void main();

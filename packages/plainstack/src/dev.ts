#!/usr/bin/env -S npx tsx watch

import { loadAndGetConfig } from "./config";
import { spawnWorkers } from "./job";
import { getLogger } from "./log";
import { loadAndGetManifest } from "./manifest";

const log = getLogger("dev");

async function main() {
  const config = await loadAndGetConfig();
  const appConfig = await loadAndGetManifest({ config });
  // TODO start-inmemory worker
  appConfig.app.listen(config.port);
  log.info(`⚡️ http://localhost:${config.port}`);
  //   void spawnWorkers(appConfig.database);
  //   log.info("⚡️ worker started");
}

void main();

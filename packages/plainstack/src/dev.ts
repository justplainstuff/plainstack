#!/usr/bin/env -S npx tsx watch

import { cwd } from "node:process";
import { loadAndGetConfig } from "./config";
import { getLogger } from "./log";
import { loadAndGetManifest } from "./manifest";

const log = getLogger("dev");

async function main() {
  const config = await loadAndGetConfig();
  const appConfig = await loadAndGetManifest({ config, cwd: cwd() });
  // TODO start-inmemory worker
  appConfig.app.listen(config.port);
  log.info(`⚡️ http://localhost:${config.port}`);
  //   void spawnWorkers(appConfig.database);
  //   log.info("⚡️ worker started");
}

void main();

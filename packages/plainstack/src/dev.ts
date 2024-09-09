#!/usr/bin/env -S npx tsx watch

import { loadAndGetAppConfig } from "./app-config";
import { loadAndGetConfig } from "./config";
import { spawnWorkers } from "./job";

async function main() {
  const config = await loadAndGetConfig();
  const appConfig = await loadAndGetAppConfig({ config });
  // TODO start-inmemory worker
  appConfig.app.listen(config.port);
  console.log(`⚡️ http://localhost:${config.port}`);
  void spawnWorkers(appConfig.database);
  console.log("⚡️ worker started");
}

void main();

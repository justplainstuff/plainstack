#!/usr/bin/env -S npx tsx watch

import { loadAndGetAppConfig } from "./app-config";
import { loadAndGetConfig } from "./config";

async function main() {
  const config = await loadAndGetConfig();
  const appConfig = await loadAndGetAppConfig({ config });
  // TODO start-inmemory worker
  appConfig.app.listen(config.port);
  console.log(`⚡️ watching changes & serving http://localhost:${config.port}`);
}

void main();

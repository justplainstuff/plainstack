#!/usr/bin/env -S npx tsx

import { loadAppConfig } from "./app-config";
import { runCommand } from "./command";
import { getConfig, loadConfig } from "./config";

async function main() {
  await loadConfig();
  const config = getConfig();
  const appConfig = await loadAppConfig({ config });
  await runCommand({ config, appConfig });
}

void main();

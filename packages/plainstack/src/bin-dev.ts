#!/usr/bin/env -S npx tsx watch

import { cwd } from "node:process";
import { loadAndGetConfig } from "./config";
import { work } from "./job";
import { getLogger } from "./log";
import { getManifest } from "./manifest";

async function main() {
  const log = getLogger("dev");
  const config = await loadAndGetConfig();
  const { app, queue, jobs } = await getManifest({ config, cwd: cwd() });
  app.listen(config.port);
  log.info(`⚡️ http://localhost:${config.port}`);
  if (queue && Object.values(jobs).length) {
    log.info("⚡️ worker started");
    await work(queue, jobs);
  }
}

void main();

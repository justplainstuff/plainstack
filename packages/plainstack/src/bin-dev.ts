#!/usr/bin/env -S npx tsx watch

import { loadAndGetConfig } from "./config";
import { work } from "./job";
import { getLogger } from "./log";
import { getManifest, getManifestOrThrow } from "./manifest/manifest";

async function main() {
  const log = getLogger("dev");
  const config = await loadAndGetConfig();
  const [{ http }, { queue, jobs }] = await Promise.all([
    getManifestOrThrow(["http"]),
    getManifest(["queue", "jobs"]),
  ]);
  http();
  log.info(`⚡️ http://localhost:${config.port}`);
  if (queue && jobs && Object.values(jobs).length) {
    log.info("⚡️ worker started");
    await work(queue, jobs);
  }
}

void main();

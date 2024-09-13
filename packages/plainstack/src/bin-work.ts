#!/usr/bin/env -S npx tsx

import { cwd } from "node:process";
import { loadAndGetConfig } from "./config";
import { work } from "./job";
import { getLogger } from "./log";
import { getManifest, getManifestOrThrow } from "./manifest/manifest";

async function main() {
  const log = getLogger("work");
  const config = await loadAndGetConfig();
  const { queue, jobs } = await getManifestOrThrow(["queue", "jobs"], {
    config,
    cwd: cwd(),
  });
  if (!queue)
    throw new Error(
      `can not start job worker without a queue, make sure you have a export default defineQueue() in ${config.paths.queueConfig}`,
    );
  await work(queue, jobs);
  log.info("⚡️ worker started");
}

void main();

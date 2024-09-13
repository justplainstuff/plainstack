#!/usr/bin/env -S npx tsx

import { loadAndGetConfig } from "../bootstrap/config";
import { getOrThrow } from "../bootstrap/get";
import { registerAppLoader } from "../bootstrap/load";
import { work } from "../job";
import { getLogger } from "../log";

registerAppLoader();
async function main() {
  const log = getLogger("work");
  const config = await loadAndGetConfig();
  // TODO use immediate queue if testing
  const { queue, jobs, schedules } = await getOrThrow([
    "queue",
    "jobs",
    "schedules",
  ]);
  if (!queue.default)
    throw new Error(
      `can not start job worker without a queue, make sure you have a export default defineQueue() in ${config.paths.queue}`,
    );
  await work(queue.default, jobs, schedules);
  log.info("⚡️ worker started");
}

void main();

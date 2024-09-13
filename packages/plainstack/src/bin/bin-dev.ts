#!/usr/bin/env -S npx tsx watch

import { loadAndGetConfig } from "../bootstrap/config";
import { get, getOrThrow } from "../bootstrap/get";
import { registerAppLoader } from "../bootstrap/load";
import { work } from "../job";
import { getLogger } from "../log";

registerAppLoader();

async function main() {
  const log = getLogger("dev");
  const config = await loadAndGetConfig();
  const [{ server }, { queue, jobs, schedules }] = await Promise.all([
    getOrThrow(["server"]),
    get(["queue", "jobs", "schedules"]),
  ]);
  server.start();
  log.log(`⚡️ http://localhost:${config.http.port}`);
  if (queue?.default) {
    log.log("⚡️ worker started");
    await work(queue.default, jobs ?? {}, schedules ?? {});
  }
  if (
    !queue &&
    (Object.values(jobs ?? {}).length || Object.values(schedules ?? {}).length)
  ) {
    throw new Error(
      `jobs or schedules found, but no queue was defined in ${config.paths.queue}`,
    );
  }
}

void main();

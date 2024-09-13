import packageJson from "../package.json";
import { getLogger } from "./log";
import type { Manifest } from "./manifest/manifest";

export function printInfo({
  database,
  http,
  queue,
  jobs,
  commands,
}: Partial<Manifest>) {
  const log = getLogger("manifest");
  log.info(`plainstack v${packageJson.version}`);
  log.info("✓ database");
  log.info("✓ app");
  queue ? log.info("✓ queue") : log.info("✗ queue");
  jobs && Object.values(jobs).length
    ? log.info(
        "✓ jobs:",
        Object.values(jobs)
          .map((j) => j.name)
          .join(", "),
      )
    : log.info("✗ jobs");
  commands && Object.values(commands).length
    ? log.info("✓ commands:", Object.keys(commands).join(", "))
    : log.info("✗ commands");
}

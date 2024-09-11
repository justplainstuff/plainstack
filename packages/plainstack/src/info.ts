import packageJson from "../package.json";
import { getLogger } from "./log";
import type { Manifest } from "./manifest";

export function printInfo(manifest: Manifest) {
  const log = getLogger("manifest");
  log.info(`plainstack v${packageJson.version}`);
  log.info("✓ database");
  log.info("✓ app");
  manifest.queue ? log.info("✓ queue") : log.info("✗ queue");
  Object.values(manifest.jobs).length
    ? log.info(
        "✓ jobs:",
        Object.values(manifest.jobs)
          .map((j) => j.name)
          .join(", "),
      )
    : log.info("✗ jobs");
  Object.values(manifest.commands).length
    ? log.info("✓ commands:", Object.keys(manifest.commands).join(", "))
    : log.info("✗ commands");
}

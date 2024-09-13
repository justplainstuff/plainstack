import { $ } from "execa";
import packageJson from "../../package.json";
import { loadAndGetConfig } from "../bootstrap/config";
import { get } from "../bootstrap/get";
import { getLogger } from "../log";

async function checkBinary(binary: string): Promise<boolean> {
  try {
    await $`${binary} --help`;
    return true;
  } catch {
    return false;
  }
}

export async function printInfo() {
  const log = getLogger("info");
  const config = await loadAndGetConfig();
  const app = await get([
    "database",
    "server",
    "queue",
    "jobs",
    "commands",
    "mailer",
    "schedules",
    "seeder",
    "routes",
  ]);

  log.log(`plainstack v${packageJson.version}`);
  log.log("");

  log.log("app:");
  log.log(app.database ? "✓ database" : "✗ database");
  log.log(app.server ? "✓ http" : "✗ http");
  log.log(app.queue ? "✓ queue" : "✗ queue");
  log.log(app.mailer ? "✓ mailer" : "✗ mailer");
  log.log(app.seeder ? "✓ seeder" : "✗ seeder");

  if (app.jobs && Object.keys(app.jobs).length > 0) {
    log.log("✓ jobs:");
    for (const job of Object.keys(app.jobs)) {
      log.log(`  * ${job}`);
    }
  } else {
    log.log("✗ jobs");
  }

  if (app.commands && Object.keys(app.commands).length > 0) {
    log.log("✓ commands:");
    for (const command of Object.keys(app.commands)) {
      log.log(`  * ${command}`);
    }
  } else {
    log.log("✗ commands");
  }

  if (app.schedules && Object.keys(app.schedules).length > 0) {
    log.log("✓ schedules:");
    for (const schedule of Object.keys(app.schedules)) {
      log.log(`  * ${schedule}`);
    }
  } else {
    log.log("✗ schedules");
  }

  log.log(app.routes && app.routes.length > 0 ? "✓ routes" : "✗ routes");

  log.log("");
  log.log("binaries:");
  const binaries = ["esbuild", "tailwindcss", "tsx", "tsc", "biome"];
  for (const binary of binaries) {
    const installed = await checkBinary(binary);
    log.log(installed ? `✓ ${binary} installed` : `✗ ${binary} not installed`);
  }

  log.log("");
  log.log("config:");
  log.log(`  * node environment: ${config.nodeEnv}`);
  log.log("  * logger:");
  log.log(`    - level: ${config.logger.level}`);
  log.log("  * http:");
  log.log(`    - port: ${config.http.port}`);
  log.log(`    - static path: ${config.http.staticPath}`);
  log.log("  * paths:");
  for (const [key, value] of Object.entries(config.paths)) {
    log.log(`    - ${key}: ${value}`);
  }
}

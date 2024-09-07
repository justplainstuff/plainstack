import fs from "node:fs";
import path from "node:path";
import type { PlainWebConfig } from "config";
import { defineConfig } from "config";
import { log } from "./log";

export async function run(config: PlainWebConfig) {
  const expandedConfig = defineConfig(config);
  const cwd = process.cwd();
  const cliPath = path.join(cwd, expandedConfig.paths.cli);

  const tsFiles = fs
    .readdirSync(cliPath)
    .filter((file) => file.endsWith(".ts"))
    .map((file) => path.parse(file).name);

  const command = process.argv[2];

  if (!command) {
    log.error("no command provided");
    return;
  }

  if (tsFiles.includes(command)) {
    const modulePath = path.join(cliPath, `${command}.ts`);
    const moduleUrl = `file://${modulePath}`;

    try {
      const module = await import(moduleUrl);
      if (typeof module.default === "function") {
        await module.default(expandedConfig);
      } else {
        console.error(
          `The ${command} module does not export a default function.`,
        );
      }
    } catch (error) {
      console.error(`Error importing or running the ${command} module:`, error);
    }
  } else {
    console.log("Available commands:");
    for (const file of tsFiles) {
      if (file.startsWith(command)) {
        console.log(`- ${file}`);
      }
    }
  }
}

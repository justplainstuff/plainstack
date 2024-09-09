import fs from "node:fs";
import path from "node:path";
import { type CommandDef, defineCommand, runMain } from "citty";
import { $ } from "execa";
import {
  type AppConfig,
  loadAndGetAppConfig,
  loadAppConfig,
} from "./app-config";
import { type Config, loadAndGetConfig } from "./config";
import { log } from "./log";
import { printRoutes } from "./print-routes";

function getBuiltInCommands(): Record<string, CommandDef> {
  const migrate = defineCommand({
    run: async () => {
      console.log("running migrate");
    },
  });

  const generate = defineCommand({
    run: async () => {
      console.log("running generate");
    },
  });

  const build = defineCommand({
    run: async () => {
      console.log("build start");

      const now = Date.now();
      Promise.all([
        await $({
          all: true,
          preferLocal: true,
          stdout: "inherit",
          stderr: "inherit",
        })`biome check --fix .`,
        await $({
          all: true,
          preferLocal: true,
          stdout: "inherit",
          stderr: "inherit",
        })`tsc --noEmit`,
      ]);
      console.log("build took", Date.now() - now, "ms");
    },
  });

  const test = defineCommand({
    run: async () => {
      await $({
        all: true,
        preferLocal: true,
        stdout: "inherit",
        stderr: "inherit",
      })`vitest run`;
    },
  });

  const dev = defineCommand({
    run: async () => {
      const config = await loadAndGetConfig();
      await Promise.all([
        $({
          all: true,
          preferLocal: true,
          stdout: "inherit",
          stderr: "inherit",
        })`plainstack-dev`,
        $({
          all: true,
          preferLocal: true,
          stdout: "inherit",
          stderr: "inherit",
        })`tailwindcss -i ${config.paths.styles} -o ${config.paths.out}/public/output.css --watch --content "./app/**/*.{tsx,html,ts}"`,
      ]);
    },
  });

  const routes = defineCommand({
    run: async () => {
      const config = await loadAndGetConfig();
      const { app } = await loadAndGetAppConfig({ config });
      await printRoutes(app);
    },
  });

  return { dev, build, test, migrate, generate, routes };
}

export async function loadUserCommands(): Promise<Record<string, CommandDef>> {
  const config = await loadAndGetConfig();
  const cliPath = config.paths.cli;

  if (!fs.existsSync(cliPath)) {
    console.debug(`CLI directory not found: ${cliPath}`);
    return {};
  }

  const tsFiles = fs
    .readdirSync(cliPath)
    .filter((file) => file.endsWith(".ts"))
    .map((file) => path.parse(file).name);

  const commands: Record<string, CommandDef> = {};

  for (const file of tsFiles) {
    const modulePath = path.join(cliPath, `${file}.ts`);
    const moduleUrl = `file://${modulePath}`;

    try {
      const module = await import(moduleUrl);
      log.debug("module %s", file);

      const commandModule = module.default?.default;

      log.debug("module %s command: %O", file, commandModule);

      if (
        typeof commandModule === "object" &&
        commandModule !== null &&
        "run" in commandModule
      ) {
        commands[file] = commandModule;
        log.debug("loaded command %s", file);
      } else {
        throw new Error(
          `${file} should export a citty command with at least a "run" function`,
        );
      }
    } catch (error) {
      console.error(`Error importing the ${file} module:`, error);
    }
  }

  return commands;
}

function getRootCommand({
  userCommands,
  builtInCommands,
}: {
  userCommands: Record<string, CommandDef>;
  builtInCommands: Record<string, CommandDef>;
}) {
  return defineCommand({
    meta: {
      name: "plainstack",
      description: "The all-in-one web framework obsessing about velocity 🏎️",
    },
    subCommands: {
      ...userCommands,
      ...builtInCommands,
    },
  });
}

export async function runCommand() {
  const userCommands = await loadUserCommands();
  const builtInCommands = getBuiltInCommands();
  const rootCommand = getRootCommand({ userCommands, builtInCommands });
  await runMain(rootCommand);
}

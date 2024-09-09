import fs from "node:fs";
import path from "node:path";
import { type CommandDef, defineCommand, runMain } from "citty";
import type { AppConfig } from "./app-config";
import type { Config } from "./config";
import { log } from "./log";
import { printRoutes } from "./print-routes";

function getBuiltInCommands({
  config,
  appConfig,
}: {
  config: Config;
  appConfig: AppConfig;
}): Record<string, CommandDef> {
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
      console.log("running build");
    },
  });

  const test = defineCommand({
    run: async () => {
      console.log("running test");
    },
  });

  const dev = defineCommand({
    run: async () => {
      console.log("running dev");
    },
  });

  const routes = defineCommand({
    run: async () => {
      await printRoutes(appConfig.app);
    },
  });

  return { dev, build, test, migrate, generate, routes };
}

export async function loadUserCommands({
  config,
}: { config: Config }): Promise<Record<string, CommandDef>> {
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

export async function runCommand({
  config,
  appConfig,
}: {
  config: Config;
  appConfig: AppConfig;
}) {
  const userCommands = await loadUserCommands({ config });
  const builtInCommands = getBuiltInCommands({ config, appConfig });
  const rootCommand = getRootCommand({ userCommands, builtInCommands });
  await runMain(rootCommand);
}

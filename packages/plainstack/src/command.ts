import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "config";
import type { Config, ExpandedPlainwebConfig, PlainWebConfig } from "./config";
import { log } from "./log";

export type Command = {
  handler: (args: Config) => Promise<void>;
  name: string;
  help?: string;
};

export function defineCommand(
  handler: (args: Config) => Promise<void>,
  opts: {
    help?: string;
  },
) {
  return {
    help: opts.help,
    handler,
  };
}

export async function loadCommands(
  config: ExpandedPlainwebConfig,
): Promise<Command[]> {
  const expandedConfig = defineConfig(config);
  const cliPath = expandedConfig.paths.cli;

  if (!fs.existsSync(cliPath)) {
    console.error(`CLI directory not found: ${cliPath}`);
    return [];
  }

  const tsFiles = fs
    .readdirSync(cliPath)
    .filter((file) => file.endsWith(".ts"))
    .map((file) => path.parse(file).name);

  const commands: Command[] = [];

  for (const file of tsFiles) {
    const modulePath = path.join(cliPath, `${file}.ts`);
    const moduleUrl = `file://${modulePath}`;

    try {
      const module = await import(moduleUrl);
      log.debug("module %s", file);

      let commandModule = module.default?.default;
      if (typeof commandModule === "function") {
        commandModule = commandModule();
      }

      log.debug("module %s command: %O", file, commandModule);

      if (
        typeof commandModule === "object" &&
        commandModule !== null &&
        "handler" in commandModule &&
        "help" in commandModule
      ) {
        commands.push({
          name: file,
          handler: commandModule.handler,
          help: commandModule.help,
        });
        log.debug("loaded command %s", file);
      } else {
        throw new Error(
          `The ${file} module does not export a default object with a "handler" and "help" property.`,
        );
      }
    } catch (error) {
      console.error(`Error importing the ${file} module:`, error);
    }
  }

  return commands;
}

export async function runCommand(
  config: ExpandedPlainwebConfig,
  commands: Command[],
) {
  const commandName = process.argv[2];

  if (!commandName) {
    printHelp(commands);
    return;
  }

  const command = commands.find((cmd) => cmd.name === commandName);

  if (command) {
    try {
      await command.handler(config);
    } catch (error) {
      console.error(`Error running the ${commandName} command:`, error);
    }
  } else {
    console.log(`Command "${commandName}" not found.`);
    printHelp(commands);
  }
}

function printHelp(commands: Command[]) {
  console.log("Available commands:");
  const maxNameLength = Math.max(...commands.map((cmd) => cmd.name.length));

  for (const cmd of commands) {
    if (cmd.help) {
      console.log(`  ${cmd.name.padEnd(maxNameLength)}  ${cmd.help}`);
    }
  }
}

export async function run(config: PlainWebConfig) {
  const expandedConfig = defineConfig(config);
  const commands = await loadCommands(expandedConfig);
  await runCommand(expandedConfig, commands);
}

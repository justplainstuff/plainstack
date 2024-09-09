import fs from "node:fs";
import path from "node:path";
import { type CommandDef, defineCommand, runMain } from "citty";
import { $ } from "execa";
import { loadAndGetAppConfig } from "./app-config";
import { loadAndGetConfig } from "./config";
import { spawnWorkers } from "./job";
import { getLogger } from "./log";
import { migrateToLatest, writeMigrationFile } from "./migrations";
import { printRoutes } from "./print-routes";
import { runSeed } from "./seed";

const log = getLogger("command");

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function getBuiltInCommands(): Record<string, CommandDef<any>> {
  const build = defineCommand({
    run: async () => {
      log.info("build start");

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
      log.info("build took", Date.now() - now, "ms");
    },
  });

  const test = defineCommand({
    args: {
      watch: {
        type: "boolean",
        description: "Run tests in watch mode",
        default: false,
      },
    },
    run: async ({ args }) => {
      await $({
        all: true,
        preferLocal: true,
        stdout: "inherit",
        stderr: "inherit",
      })`vitest ${args.watch ? "watch" : "run"}`;
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

  const serve = defineCommand({
    run: async () => {
      const config = await loadAndGetConfig();
      const appConfig = await loadAndGetAppConfig({ config });
      appConfig.app.listen(config.port);
      log.info(`⚡️ serving from port ${config.port}`);
    },
  });

  const work = defineCommand({
    run: async () => {
      const config = await loadAndGetConfig();
      const appConfig = await loadAndGetAppConfig({ config });
      await spawnWorkers(appConfig.database);
    },
  });

  const routes = defineCommand({
    run: async () => {
      const config = await loadAndGetConfig();
      const { app } = await loadAndGetAppConfig({ config });
      await printRoutes(app);
    },
  });

  const migrate = defineCommand({
    args: {
      name: {
        type: "positional",
        description: "If provided, create migration with the given name",
        required: false,
      },
      schema: {
        type: "boolean",
        description:
          "If provided, generate a new schema file based on the current database",
        required: false,
      },
    },
    run: async ({ args }) => {
      if (args.schema) {
        const config = await loadAndGetConfig();
        process.env.DATABASE_URL = config.dbUrl;
        await $({
          all: true,
          preferLocal: true,
          stdout: "inherit",
          stderr: "inherit",
        })`kysely-codegen --camel-case --dialect sqlite --out-file ${config.paths.schema}`;
      } else {
        if (args.name) {
          await writeMigrationFile(args.name);
        } else {
          await migrateToLatest();
          const config = await loadAndGetConfig();
          process.env.DATABASE_URL = config.dbUrl;
          await $({
            all: true,
            preferLocal: true,
            stdout: "inherit",
            stderr: "inherit",
          })`kysely-codegen --camel-case --dialect sqlite --out-file ${config.paths.schema}`;
        }
      }
    },
  });

  const seed = defineCommand({
    run: async () => {
      await runSeed();
    },
  });

  return {
    dev,
    build,
    test,
    serve,
    work,
    routes,
    migrate,
    seed,
  };
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

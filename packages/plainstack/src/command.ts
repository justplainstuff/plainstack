import { type CommandDef, defineCommand, runMain } from "citty";
import { $ } from "execa";
import { loadAndGetConfig } from "./config";
import { migrateToLatest, writeMigrationFile } from "./database";
import { spawnWorkers } from "./job";
import { getLogger } from "./log";
import { loadAndGetManifest } from "./manifest";
import { printRoutes } from "./print-routes";
import { runSeed } from "./seed";

const log = getLogger("command");

function getBuiltInCommands({
  cwd,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
}: { cwd: string }): Record<string, CommandDef<any>> {
  const build = defineCommand({
    meta: {
      name: "build",
      description: "Type-check, lint and bundle assets",
    },
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
    meta: {
      name: "test",
      description: "Run tests",
    },
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
    meta: {
      name: "dev",
      description: "Start the local development server",
    },
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
    meta: {
      name: "serve",
      description: "Start the production web server",
    },
    run: async () => {
      const config = await loadAndGetConfig();
      const appConfig = await loadAndGetManifest({ config, cwd });
      appConfig.app.listen(config.port);
      log.info(`⚡️ serving from port ${config.port}`);
    },
  });

  const work = defineCommand({
    meta: {
      name: "work",
      description: "Start the background worker",
    },
    run: async () => {
      const config = await loadAndGetConfig();
      const manifest = await loadAndGetManifest({ config, cwd });
      await spawnWorkers(manifest.database);
    },
  });

  const routes = defineCommand({
    meta: {
      name: "routes",
      description: "Print all file routes",
    },
    run: async () => {
      const config = await loadAndGetConfig();
      const { app } = await loadAndGetManifest({ config, cwd });
      await printRoutes(app);
    },
  });

  const migrate = defineCommand({
    meta: {
      name: "migrate",
      description: "Apply all pending migrations",
    },
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
    meta: {
      name: "seed",
      description: "Run the seeds in seed.ts",
    },
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

export async function runCommand({ cwd }: { cwd: string }) {
  const builtInCommands = getBuiltInCommands({ cwd });
  const config = await loadAndGetConfig();
  const manifest = await loadAndGetManifest({ config, cwd });
  const rootCommand = getRootCommand({
    userCommands: manifest.commands,
    builtInCommands,
  });
  await runMain(rootCommand);
}

export function isCommand(cmd: unknown): cmd is CommandDef {
  return typeof cmd === "object" && cmd !== null && "run" in cmd;
}

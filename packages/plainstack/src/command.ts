import { type CommandDef, defineCommand, runMain } from "citty";
import { $ } from "execa";
import { loadAndGetConfig } from "./config";
import { migrateToLatest, writeMigrationFile } from "./database";
import { printInfo } from "./info";
import { getLogger } from "./log";
import { getManifest, getManifestOrThrow } from "./manifest/manifest";
import { printRoutes } from "./print-routes";
import { runSeed } from "./seed";

function getBuiltInCommands({
  cwd,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
}: { cwd: string }): Record<string, CommandDef<any>> {
  const log = getLogger("command");
  const build = defineCommand({
    meta: {
      name: "build",
      description: "Type-check, lint and bundle assets",
    },
    run: async () => {
      log.info("build start");
      const config = await loadAndGetConfig();

      const now = Date.now();
      await Promise.all([
        $({
          all: true,
          preferLocal: true,
          stdout: "inherit",
          stderr: "inherit",
        })`biome check --fix .`.then(() => log.info("✓ lint")),
        $({
          all: true,
          preferLocal: true,
          stdout: "inherit",
          stderr: "inherit",
        })`tsc --noEmit`.then(() => log.info("✓ types")),
        $({
          all: true,
          preferLocal: true,
          stdout: "inherit",
          stderr: "inherit",
        })`tailwindcss -i ${config.paths.styles} -o ${config.paths.out}/styles.css --content "./app/**/*.{tsx,html,ts} --minify"`.then(
          () => log.info("✓ styles.css"),
        ),
        $({
          all: true,
          preferLocal: true,
          stdout: "inherit",
          stderr: "inherit",
        })`esbuild ${config.paths.assets}/*.ts --bundle --outdir=${config.paths.out} --minify --sourcemap`.then(
          () => log.info("✓ .ts -> .js"),
        ),
        $({
          all: true,
          preferLocal: true,
          stdout: "inherit",
          stderr: "inherit",
        })`cpy --cwd=${config.paths.assets} . \!${config.paths.assets}/styles.css \!${config.paths.assets}/\*.ts ${config.paths.out}`.then(
          () => log.info("✓ assets"),
        ),
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
        })`tailwindcss -i ${config.paths.styles} -o ${config.paths.out}/styles.css --watch --content "./app/**/*.{tsx,html,ts}"`,
        $({
          all: true,
          preferLocal: true,
          stdout: "inherit",
          stderr: "inherit",
        })`esbuild ${config.paths.assets}/*.ts --bundle --outdir=${config.paths.out} --sourcemap`,
        $({
          all: true,
          preferLocal: true,
          stdout: "inherit",
          stderr: "inherit",
        })`chokidar "${config.paths.assets}/**/*" --ignore "${config.paths.assets}/styles.css" --ignore "${config.paths.assets}/*.ts" -c "cpy --cwd=${config.paths.assets} . \!${config.paths.assets}/styles.css \!${config.paths.assets}/\*.ts ${config.paths.out}"`,
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
      const { http } = await getManifestOrThrow(["http"], { config, cwd });
      http();
      log.info(`⚡️ serving from port ${config.port}`);
    },
  });

  const work = defineCommand({
    meta: {
      name: "work",
      description: "Start background workers",
    },
    args: {
      parallel: {
        type: "string",
        description: "Number of parallel workers to run",
        default: "1",
      },
    },
    run: async ({ args }) => {
      const parallel = Number.parseInt(args.parallel);
      await Promise.all(
        Array.from(
          { length: parallel },
          () =>
            $({
              all: true,
              preferLocal: true,
              stdout: "inherit",
              stderr: "inherit",
            })`plainstack-work`,
        ),
      );
    },
  });

  const routes = defineCommand({
    meta: {
      name: "routes",
      description: "Print all file routes",
    },
    run: async () => {
      const config = await loadAndGetConfig();
      const { http } = await getManifestOrThrow(["http"], { config, cwd });
      await printRoutes(await http());
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
      const log = getLogger("migrate");
      if (args.schema) {
        const config = await loadAndGetConfig();
        process.env.DATABASE_URL = config.dbUrl;
        log.info(
          `generate schema file to ${config.paths.schema} with DATABASE_URL=${config.dbUrl}`,
        );
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
          log.info(
            `generate schema file to ${config.paths.schema} with DATABASE_URL=${config.dbUrl}`,
          );
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

  const info = defineCommand({
    meta: {
      name: "info",
      description: "Print project info",
    },
    run: async () => {
      const config = await loadAndGetConfig();
      const manifest = await getManifest(
        ["database", "http", "queue", "jobs", "commands"],
        {
          config,
          cwd,
        },
      );
      printInfo(manifest);
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
    info,
  };
}

async function getUserSubCommands({ cwd }: { cwd: string }) {
  const config = await loadAndGetConfig();
  const { commands } = await getManifestOrThrow(["commands"], { config, cwd });
  return commands;
}

function getRootCommand({
  builtInCommands,
  cwd,
}: {
  builtInCommands: Record<string, CommandDef>;
  cwd: string;
}) {
  return defineCommand({
    meta: {
      name: "plainstack",
      description: "The all-in-one web framework obsessing about velocity 🏎️",
    },
    subCommands: {
      ...builtInCommands,
      custom: {
        meta: {
          name: "custom",
          description: "Run a custom command",
        },
        subCommands: () => getUserSubCommands({ cwd }),
      },
    },
  });
}

export async function runCommand(opts?: { cwd?: string }) {
  const cwd = opts?.cwd ?? process.cwd();
  const builtInCommands = getBuiltInCommands({ cwd });
  const rootCommand = getRootCommand({
    cwd,
    builtInCommands,
  });
  await runMain(rootCommand);
}

export function isCommand(cmd: unknown): cmd is CommandDef {
  return typeof cmd === "object" && cmd !== null && "run" in cmd;
}

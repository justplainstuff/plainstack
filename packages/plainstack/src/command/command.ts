import path from "node:path";
import chokidar from "chokidar";
import { type CommandDef, defineCommand, runMain } from "citty";
import { $ } from "execa";
import fs from "fs-extra";
import { type Config, loadAndGetConfig } from "../bootstrap/config";
import { get, getOrThrow } from "../bootstrap/get";
import {
  hasPendingMigrations,
  migrateToLatest,
  writeMigrationFile,
} from "../database/database";
import { runSeed } from "../database/seed";
import { getLogger } from "../log";
import { printRoutes } from "../web/http";
import { printInfo } from "./info";

function isCopyableAsset(config: Config, src: string) {
  // ignore styles.css file (tailwind will handle it)
  if (src.endsWith(config.paths.styles)) return false;
  // ignore top level .ts files (esbuild will handle them)
  if (
    src.endsWith(".ts") &&
    !src.includes(path.sep, config.paths.assets.length + 1)
  )
    return false;
  return true;
}

async function copyAssets(config: Config) {
  const log = getLogger("copy-assets");
  return fs
    .copy(config.paths.assets, config.paths.out, {
      filter: (src: string, dest: string) => {
        const shouldCopy = isCopyableAsset(config, src);
        log.debug(`copy: ${src} -> ${dest}`, { shouldCopy });
        return shouldCopy;
      },
    })
    .catch((err) => {
      log.error("error copying assets:", err);
      throw err;
    });
}

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
        await copyAssets(config).then(() => log.info("✓ assets")),
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
      if (await hasPendingMigrations()) {
        log.warn(
          "there are pending migrations, run `plainstack migrate` to apply them",
        );
      }
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
      if (await hasPendingMigrations()) {
        log.warn(
          "there are pending migrations, run `plainstack migrate` to apply them",
        );
      }
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
        copyAssets(config).then(() =>
          chokidar
            .watch(config.paths.assets, {
              persistent: true,
              ignored: (path) => {
                const shouldIgnore = !isCopyableAsset(config, path);
                log.debug(`watch: ${path}`, { shouldIgnore });
                return shouldIgnore;
              },
            })
            .on("add", (srcPath) => {
              const relPath = path.relative(config.paths.assets, srcPath);
              const destPath = path.join(config.paths.out, relPath);
              fs.copy(srcPath, destPath)
                .then(() =>
                  log.debug(`file ${relPath} has been added and copied`),
                )
                .catch((err) =>
                  log.error(`error copying added file ${relPath}:`, err),
                );
            })
            .on("change", (srcPath) => {
              const relPath = path.relative(config.paths.assets, srcPath);
              const destPath = path.join(config.paths.out, relPath);
              fs.copy(srcPath, destPath)
                .then(() =>
                  log.debug(`file ${relPath} has been changed and copied`),
                )
                .catch((err) =>
                  log.error(`error copying changed file ${relPath}:`, err),
                );
            })
            .on("unlink", (srcPath) => {
              const relPath = path.relative(config.paths.assets, srcPath);
              const destPath = path.join(config.paths.out, relPath);
              fs.remove(destPath)
                .then(() => log.debug(`file ${relPath} has been removed`))
                .catch((err) =>
                  log.error(`error removing file ${relPath}:`, err),
                );
            })
            .on("error", (error) => {
              log.error("error watching assets:", error);
            }),
        ),
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
      const { server } = await getOrThrow(["server"]);
      server.start();
      log.info(`⚡️ serving from port ${config.http.port}`);
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
      const { server } = await getOrThrow(["server"]);
      await printRoutes(await server.start());
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
        if (process.env.DB_URL) process.env.DATABASE_URL = process.env.DB_URL;
        log.info(
          `generate schema file to ${config.paths.schema} with DATABASE_URL=${process.env.DATABASE_URL}`,
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
          if (process.env.DB_URL) process.env.DATABASE_URL = process.env.DB_URL;
          log.info(
            `generate schema file to ${config.paths.schema} with DATABASE_URL=${process.env.DATABASE_URL}`,
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
      await printInfo();
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
  const { commands } = await getOrThrow(["commands"]);
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
      description: "The fastest way to build TypeScript apps",
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

import { defineCommand, loadCommands, runCommand } from "./command";
import { type PlainWebConfig, expandConfig } from "./config";
import { printRoutes } from "./print-routes";

async function ensureBinaryExists(binary: string) {
  // TODO
  // check in cwd() node_modules/.bin and if not found, print: "${binary} is not installed. Please install it with `pnpm i ${binary}`"
  // and throw error
}

const printRoutesCommand = {
  ...defineCommand(
    async ({ app }) => {
      await printRoutes(app);
    },
    {
      help: "Print all express routes to the console",
    },
  ),
  name: "routes",
};

const assetsCommand = {
  ...defineCommand(
    async ({ app }) => {
      await ensureBinaryExists("tailwindcss");
      // TODO implement
      // execute `node_modules/.bin/tailwindcss -i ${app.locals.config.paths.styles} -o ${app.locals.config.paths.out}/public/styles.css --minify`,
    },
    {
      help: "Compile and minify CSS",
    },
  ),
  name: "assets",
};

const assetsWatchCommand = {
  ...defineCommand(
    async ({ app }) => {
      await ensureBinaryExists("tailwindcss");
      // TODO implement
      // execute `node_modules/.bin/tailwindcss -i ${app.locals.config.paths.styles} -o ${app.locals.config.paths.out}/public/styles.css --watch`,
    },
    {
      help: "Compile and watch for changes in CSS",
    },
  ),
  name: "assets:watch",
};

const migrateCommand = {
  ...defineCommand(
    async ({ app, dbUrl, paths }) => {
      await ensureBinaryExists("kysely-ctl");
      await ensureBinaryExists("kysely-codegen");
      // TODO implement
      // execute `node_modules/.bin/kysely-ctl migrate`,
      // execute DATABASE_URL=${dbUrl} kysely-codegen --dialect sqlite --out-file ${paths.schema},
    },
    {
      help: "Run migrations using kysely-ctl",
    },
  ),
  name: "migrate",
};

const migrationsMakeCommand = {
  ...defineCommand(
    async ({ app }) => {
      await ensureBinaryExists("kysely-codegen");
      // TODO implement
      // execute `node_modules/.bin/kysely-codegen` migrations:make,
    },
    {
      help: "Create new migration file",
    },
  ),
  name: "migrations:make",
};

const builtInCommands = [
  printRoutesCommand,
  assetsCommand,
  assetsWatchCommand,
  migrateCommand,
  migrationsMakeCommand,
];

export async function run(config: PlainWebConfig) {
  const expandedConfig = await expandConfig(config);
  const commands = await loadCommands(expandedConfig);
  await runCommand(expandedConfig, [...builtInCommands, ...commands]);
}

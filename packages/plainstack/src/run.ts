import { execSync } from "node:child_process";
import { defineCommand, loadCommands, runCommand } from "./command";
import { type PlainWebConfig, expandConfig } from "./config";
import { printRoutes } from "./print-routes";

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
    async ({ app, paths }) => {
      execSync(
        `npx -p tailwindcss -i ${paths.styles} -o ${paths.out}/public/styles.css --minify`,
        { stdio: "inherit" },
      );
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
      execSync(
        `npx -p tailwindcss -i ${app.locals.config.paths.styles} -o ${app.locals.config.paths.out}/public/styles.css --watch`,
        { stdio: "inherit" },
      );
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
      execSync("npx -p kysely-ctl migrate", { stdio: "inherit" });
      execSync(
        `DATABASE_URL=${dbUrl} npx -p kysely-codegen --dialect sqlite --out-file ${paths.schema}`,
        { stdio: "inherit" },
      );
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
      execSync("npx -p kysely-ctl migrations:make", { stdio: "inherit" });
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

#!/usr/bin/env node

import fs from "node:fs";
import { join } from "node:path";
import consola from "consola";
import { downloadTemplate } from "giget";
import packageJson from "../package.json";

async function createEnvFile(path: string) {
  if (fs.existsSync(join(path, ".env"))) return;
  consola.log("creating .env file");
  await fs.promises.writeFile(
    join(path, ".env"),
    `
NODE_ENV=development
DB_URL=db.sqlite3
PORT=3000
SMTP_HOST=
SMTP_USER=
SMTP_PASS=`,
    "utf-8",
  );
}

async function createEnvTestFile(path: string) {
  if (fs.existsSync(join(path, ".env.test"))) return;
  consola.log("creating .env.test file");
  await fs.promises.writeFile(
    join(path, ".env.test"),
    `
NODE_ENV=test
DB_URL=:memory:
SMTP_HOST=
SMTP_USER=
SMTP_PASS=`,
    "utf-8",
  );
}

async function main() {
  consola.log(`create-plainstack v${packageJson.version}`);
  const path = await consola.prompt(
    "where do you want to create your new project?",
    {
      type: "text",
      default: "./my-app",
      initial: "./my-app",
    },
  );
  consola.log(`creating project at ${path}`);
  await downloadTemplate("github:justplainstuff/template", {
    dir: path,
  });
  console.log("creating .env and .env.test files");
  await Promise.all([createEnvFile(path), createEnvTestFile(path)]);
  console.log("done");
}

main();

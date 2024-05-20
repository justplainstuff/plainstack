import BetterSqlite3Database from "better-sqlite3";
import { test, describe } from "node:test";
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { hasPendingMigrations, migrate } from "./migrate";

async function writeDrizzleConfig(dir: string) {
  const content = `
export default {
  out: "${path.join(dir, "migrations")}"
};
`;
  await fs.writeFile(`${dir}/drizzle.config.ts`, content);
}

function getDatabase() {
  const connection = new BetterSqlite3Database(":memory:");
  connection.pragma("journal_mode = WAL");
  return drizzle(connection);
}

async function writeMigration(dir: string, name: string, content: string) {
  await fs.mkdir(path.join(dir, "migrations"), { recursive: true });
  await fs.writeFile(path.join(dir, "migrations", name), content);
}

async function writeMigration1(dir: string) {
  await writeMigration(
    dir,
    "0000_foo_bar.ts",
    "CREATE TABLE `users` (`email` text PRIMARY KEY NOT NULL)"
  );
}

async function writeMigration2(dir: string) {
  await writeMigration(
    dir,
    "0001_other_bar.ts",
    "CREATE TABLE `orders` (`id` text PRIMARY KEY NOT NULL)"
  );
}

describe("migrate", () => {
  test.skip("has pending migrations", async () => {
    const { temporaryDirectory } = await import("tempy");
    const database = getDatabase();
    const tmp = temporaryDirectory();
    console.log("Running tests in", tmp);
    await writeDrizzleConfig(tmp);
    assert.deepEqual(await hasPendingMigrations(database, { cwd: tmp }), false);
    await writeMigration1(tmp);
    assert.deepEqual(await hasPendingMigrations(database, { cwd: tmp }), true);
    await migrate(database, { cwd: tmp });
    assert.deepEqual(await hasPendingMigrations(database, { cwd: tmp }), false);
    await writeMigration2(tmp);
    assert.deepEqual(await hasPendingMigrations(database, { cwd: tmp }), true);
  });
});

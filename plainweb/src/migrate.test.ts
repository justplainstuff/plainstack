import fs from "node:fs/promises";
import path from "node:path";
import { type ExpandedPlainwebConfig, defaultConfigPaths } from "config";
import { ensureDirectoryExists } from "plainweb-fs";
import { describe, expect, test } from "vitest";
import { hasPendingMigrations, migrate } from "./migrate";

// schema.ts
const schemaBefore = `
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  email: text("email").primaryKey(),
  created: int("created").notNull(),
});`;

// meta/_journal.json
const journalBefore = `
{
  "version": "7",
  "dialect": "sqlite",
  "entries": [
    {
      "idx": 0,
      "version": "6",
      "when": 1721630890671,
      "tag": "0000_lonely_rhino",
      "breakpoints": true
    }
  ]
}
`;

// 0000_lonely_rhino.sql
const migration0000 = `
CREATE TABLE users (
	email text PRIMARY KEY NOT NULL,
	created integer NOT NULL
);
`;

// meta/0000_snapshot.json
const snapshot0000 = `
{
  "version": "6",
  "dialect": "sqlite",
  "id": "170f154d-2372-4110-8b32-f519a6b63a52",
  "prevId": "00000000-0000-0000-0000-000000000000",
  "tables": {
    "users": {
      "name": "users",
      "columns": {
        "email": {
          "name": "email",
          "type": "text",
          "primaryKey": true,
          "notNull": true,
          "autoincrement": false
        },
        "created": {
          "name": "created",
          "type": "integer",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {}
    }
  },
  "enums": {},
  "_meta": {
    "schemas": {},
    "tables": {},
    "columns": {}
  },
  "internal": {
    "indexes": {}
  }
}
`;

// schema.ts
const schemaAfter = `
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  email: text("email").primaryKey()
});
`;

// migrations/0001_boring_killer_shrike.sql
const migration0001 = "ALTER TABLE users DROP COLUMN created";

// meta/_journal.json
const journalAfter = `
{
  "version": "7",
  "dialect": "sqlite",
  "entries": [
    {
      "idx": 0,
      "version": "6",
      "when": 1721630890671,
      "tag": "0000_lonely_rhino",
      "breakpoints": true
    },
    {
      "idx": 1,
      "version": "6",
      "when": 1721630957466,
      "tag": "0001_boring_killer_shrike",
      "breakpoints": true
    }
  ]
}
`;

// meta/0001_snapshot.json
const snapshot0001 = `
{
  "version": "6",
  "dialect": "sqlite",
  "id": "a535ce15-fc3a-44fd-8e63-ccaf36842cf3",
  "prevId": "170f154d-2372-4110-8b32-f519a6b63a52",
  "tables": {
    "users": {
      "name": "users",
      "columns": {
        "email": {
          "name": "email",
          "type": "text",
          "primaryKey": true,
          "notNull": true,
          "autoincrement": false
        }
      },
      "indexes": {},
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {}
    }
  },
  "enums": {},
  "_meta": {
    "schemas": {},
    "tables": {},
    "columns": {}
  },
  "internal": {
    "indexes": {}
  }
}
`;

async function generateMigrationsBefore({
  schemaPath,
  out,
}: { schemaPath: string; out: string }) {
  await fs.writeFile(path.join(out, "0000_lonely_rhino.sql"), migration0000);
  await ensureDirectoryExists(path.join(out, "meta"));
  const journalPath = path.join(out, "meta/_journal.json");
  await fs.writeFile(journalPath, journalBefore);
  await fs.writeFile(schemaPath, schemaBefore);
  await fs.writeFile(path.join(out, "meta/0000_snapshot.json"), snapshot0000);
}

async function generateMigrationsAfter({
  schemaPath,
  out,
}: { schemaPath: string; out: string }) {
  await fs.writeFile(
    path.join(out, "0001_boring_killer_shrike.sql"),
    migration0001,
  );
  await ensureDirectoryExists(path.join(out, "meta"));
  const journalPath = path.join(out, "meta/_journal.json");
  await fs.writeFile(journalPath, journalAfter);
  await fs.writeFile(schemaPath, schemaAfter);
  await fs.writeFile(path.join(out, "meta/0001_snapshot.json"), snapshot0001);
}

describe("migrate", () => {
  test("has pending migrations", async () => {
    const { temporaryDirectory, temporaryFile } = await import("tempy");
    const dbFile = temporaryFile({ extension: "sqlite3" });
    const config = {
      nodeEnv: "test",
      paths: {
        ...defaultConfigPaths,
        migrations: temporaryDirectory(),
        schema: temporaryFile({ extension: "ts" }),
      },
      database: {
        dbUrl: dbFile,
        schema: {},
        testDbUrl: dbFile,
        pragma: { journal_mode: "WAL" },
        migrationsTable: "__drizzle_migrations",
      },
    } satisfies Pick<
      ExpandedPlainwebConfig<Record<string, unknown>>,
      "database" | "nodeEnv" | "paths"
    >;
    expect(await hasPendingMigrations(config)).toBe(false);
    console.log("[test] generate initial migrations");
    await generateMigrationsBefore({
      schemaPath: config.paths.schema,
      out: config.paths.migrations,
    });
    expect(await hasPendingMigrations(config)).toBe(true);
    console.log("[test] apply migrations");
    await migrate(config);
    expect(await hasPendingMigrations(config)).toBe(false);
    console.log("[test] generate changed schema migrations");
    await generateMigrationsAfter({
      schemaPath: config.paths.schema,
      out: config.paths.migrations,
    });
    expect(await hasPendingMigrations(config)).toBe(true);
  });
});

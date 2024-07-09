import fs from "node:fs/promises";
import path from "node:path";
import { eq, sql } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate as migrateSql } from "drizzle-orm/better-sqlite3/migrator";
import type { MigrationConfig } from "drizzle-orm/migrator";

type Config = {
  dialect: "sqlite";
  out?: string;
  migrations?: {
    table?: string;
    schema?: string;
  };
};

async function getConfig(opts?: { cwd?: string }) {
  const configPath = path.join(opts?.cwd ?? process.cwd(), "drizzle.config.ts");
  const stat = await fs.stat(configPath);
  if (!stat.isFile()) {
    console.log(
      "No drizzle.config.ts in project root, can not migrate database",
    );
    return;
  }
  const configModule = await import(configPath);
  if (!configModule.default) {
    console.log(
      "No default export in drizzle.config.ts, can not migrate database",
    );
    return;
  }
  const config = configModule.default as Config;

  return config;
}

export async function migrate<T extends Record<string, unknown>>(
  db: BetterSQLite3Database<T>,
  opts?: { cwd?: string },
) {
  const config = await getConfig(opts);
  if (!config) return;

  const migrationConfig = {
    migrationsFolder: config.out ?? "migrations",
    migrationsTable: config.migrations?.table,
    migrationsSchema: config.migrations?.schema,
  } satisfies MigrationConfig;

  console.log("Migrating database...");
  migrateSql(db, migrationConfig);
  console.log("Migrations complete");
}

const DEFAULT_TABLE = "__drizzle_migrations";

// WIP
export async function getLatestMigrationTimestamp(
  config: Config,
  opts?: { cwd?: string },
) {
  const journalPath = path.join(config.out ?? "migrations", "_journal.json");
  const fullJournalPath = path.join(opts?.cwd ?? process.cwd(), journalPath);
  try {
    const stat = await fs.stat(fullJournalPath);
    if (!stat.isFile()) {
      console.warn(
        "No _journal.json file found in migrations folder, something seems to be wrong",
      );
      return;
    }
    const journal = await fs.readFile(fullJournalPath, "utf-8");
    const { entries } = JSON.parse(journal);
    if (!entries || entries.length === 0) return;
    const latestEntry = entries[entries.length - 1];
    if (!latestEntry.when) {
      console.warn(
        "No 'when' field found in latest migration entry, something seems to be wrong",
      );
      return;
    }
    return latestEntry.when;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

// WIP
export async function hasPendingMigrations<T extends Record<string, unknown>>(
  database: BetterSQLite3Database<T>,
  opts?: { cwd?: string },
): Promise<boolean> {
  const config = await getConfig(opts);
  if (!config) return false;
  const table = config.migrations?.table ?? DEFAULT_TABLE;
  const latestTimestamp = await getLatestMigrationTimestamp(config, opts);
  if (!latestTimestamp) return false;
  const rows = await database
    .select()
    .from(sql`${table}`)
    .where(eq(sql`${table}.created_at`, latestTimestamp));
  return rows.length === 0;
}

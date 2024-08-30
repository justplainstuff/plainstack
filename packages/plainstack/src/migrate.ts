import fs from "node:fs/promises";
import path from "node:path";
import type { ExpandedPlainwebConfig } from "config";
import { sql } from "drizzle-orm";
import { migrate as drizzleMigrate } from "drizzle-orm/better-sqlite3/migrator";
import type { MigrationConfig } from "drizzle-orm/migrator";
import { getDatabase } from "get-database";
import { getLogger } from "log";
import { directoryExists, fileExists } from "plainweb-fs";

const log = getLogger("migrate");

/**
 * Run pending daatabasae migrations given a plainweb config.
 * Migrations change the database schema.
 */
export async function migrate(
  config: Pick<
    ExpandedPlainwebConfig<Record<string, unknown>>,
    "database" | "paths" | "nodeEnv"
  >,
) {
  try {
    const migrationConfig = {
      migrationsFolder: config.paths.migrations,
      migrationsTable: config.database.migrationsTable,
      migrationsSchema: config.paths.schema,
    } satisfies MigrationConfig;

    log.info("applying migrations...");
    log.debug("using migration config", migrationConfig);
    const db = getDatabase(config);
    drizzleMigrate(db, migrationConfig);
    log.info("migrations have been applied");
  } catch (error) {
    log.error("could not apply migrations, something went wrong");
    throw error;
  }
}

/**
 * Return the timestamp of the latest migration in the migrations folder.
 */
async function getLatestLocalMigrationTimestamp(
  config: Pick<ExpandedPlainwebConfig<Record<string, unknown>>, "paths">,
): Promise<number | undefined> {
  log.debug("getting latest local migration timestamp");
  if (!(await directoryExists(config.paths.migrations))) {
    log.debug("migrations directory does not exist yet");
    return undefined;
  }
  const journalPath = path.join(
    config.paths.migrations,
    "meta",
    "_journal.json",
  );
  log.debug("looking for migrations in journal", journalPath);
  if (!(await fileExists(journalPath))) {
    log.warn("no _journal.json file found in migrations folder");
    return undefined;
  }
  const journal = await fs.readFile(journalPath, "utf-8");
  log.debug("journal content", journal);
  const { entries } = JSON.parse(journal);
  if (!entries || entries.length === 0) {
    log.debug("journal found but it's empty");
    return;
  }
  const latestEntry = entries[entries.length - 1];
  if (!latestEntry.when || typeof latestEntry.when !== "number") {
    log.warn(
      "No or invalid 'when' field found in latest migration entry, something seems to be wrong",
    );
    return undefined;
  }
  log.debug("latest local migration timestamp", latestEntry.when);
  return latestEntry.when as number;
}

async function getLatestAppliedMigrationTimestamp(
  config: Pick<
    ExpandedPlainwebConfig<Record<string, unknown>>,
    "database" | "paths" | "nodeEnv"
  >,
): Promise<number | undefined> {
  log.debug("getting latest applied migration timestamp");
  const db = getDatabase(config);

  try {
    const query = sql`SELECT * FROM ${sql.identifier(
      config.database.migrationsTable,
    )} ORDER BY created_at DESC LIMIT 1`;

    const found = db.all<{ created_at: number }>(query);

    if (!found[0]) {
      log.debug("no migrations found in database");
      return undefined;
    }
    log.debug("latest migration timestamp", found[0].created_at);
    return found[0].created_at;
  } catch (error) {
    if (error instanceof Error && error.message.includes("no such table")) {
      log.debug("migrations table not found in database");
      return undefined;
    }
    // If it's a different error, we'll rethrow it
    throw error;
  }
}

export async function hasPendingMigrations<T extends Record<string, unknown>>(
  config: Pick<ExpandedPlainwebConfig<T>, "database" | "paths" | "nodeEnv">,
): Promise<boolean> {
  log.debug("checking for pending migrations");
  const latestLocalTimestamp = await getLatestLocalMigrationTimestamp(config);
  if (!latestLocalTimestamp) {
    log.debug("no migrations found, no migrations pending");
    return false;
  }
  const latestAppliedTimestamp =
    await getLatestAppliedMigrationTimestamp(config);
  if (!latestAppliedTimestamp) {
    log.debug("no migrations found in database, migrations pending");
    return true;
  }
  if (latestLocalTimestamp > latestAppliedTimestamp) {
    log.debug(
      "local migrations found that have not been applied yet, migrations pending",
    );
    return true;
  }
  return false;
}

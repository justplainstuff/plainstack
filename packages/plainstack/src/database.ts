import fs from "node:fs/promises";
import path from "node:path";
import { cwd } from "node:process";
import { type Kysely, Migrator, sql } from "kysely";
import { TSFileMigrationProvider } from "kysely-ctl";
import { loadAndGetConfig } from "./config";
import { getLogger } from "./log";
import { loadAndGetManifest } from "./manifest";
import { ensureDirectoryExists, fileExists } from "./plainstack-fs";

const log = getLogger("database");

async function getMigrator() {
  const config = await loadAndGetConfig();
  const appConfig = await loadAndGetManifest({ config, cwd: cwd() });
  return new Migrator({
    db: appConfig.database,
    provider: new TSFileMigrationProvider({
      migrationFolder: path.join(process.cwd(), config.paths.migrations),
    }),
  });
}

export async function migrateToLatest() {
  const migrator = await getMigrator();
  log.info("running migrations");
  const result = await migrator.migrateToLatest();
  log.info(`applied ${result?.results?.length} migrations`);
  if (result?.error) log.error("migration error:", result.error);
}

const migrationFileTemplate = `
import type { Kysely } from "kysely";

// check https://kysely.dev/docs/migrations
export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("person")
    .addColumn("id", "varchar", (col) => col.primaryKey())
    .addColumn("first_name", "text", (col) => col.notNull())
    .addColumn("last_name", "text")
    .addColumn("gender", "text", (col) => col.notNull())
    .addColumn("created_at", "integer", (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("pet")
    .addColumn("id", "varchar", (col) => col.primaryKey())
    .addColumn("name", "text", (col) => col.notNull().unique())
    .addColumn("owner_id", "varchar", (col) => col.notNull())
    .addColumn("species", "text", (col) => col.notNull())
    .addColumn("created_at", "integer", (col) => col.notNull())
    .execute();

  await db.schema
    .createIndex("pet_owner_id_index")
    .on("pet")
    .column("owner_id")
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("pet").execute();
  await db.schema.dropTable("person").execute();
}
`;

export async function writeMigrationFile(name: string) {
  const config = await loadAndGetConfig();
  const sanitizedName = name.toLowerCase().replace(/[^a-z0-9_]/g, "_");
  const timestamp = Date.now();
  const fileName = `${timestamp}_${sanitizedName}.ts`;
  await ensureDirectoryExists(config.paths.migrations);
  const filePath = path.join(config.paths.migrations, fileName);
  if (await fileExists(filePath)) {
    throw new Error(`Migration file ${fileName} already exists`);
  }
  await fs.writeFile(filePath, migrationFileTemplate);
  log.info(`Generated migration: ${fileName}`);
}

/**
 * Run a a function in a database transaction.
 * The transaction is automatically rolled back, even if the function doesn't throw an error.
 * Use during testing, to keep test cases isolated from each other.
 * */
export async function isolate<T>(
  db: Kysely<T>,
  fn: (db: Kysely<T>) => Promise<void>,
) {
  // TODO check if pending migrations, and print warning if so
  let err: Error | null = null;

  try {
    // Begin the transaction
    await sql.raw("BEGIN").execute(db);
    try {
      await fn(db);
    } catch (e) {
      err = e as Error;
    }
  } finally {
    await sql.raw("ROLLBACK").execute(db);
  }

  if (err) {
    throw err;
  }
}

export function defineDatabase<T>(db: Kysely<T>): Kysely<T> {
  return db;
}

export function isDatabase(db: unknown): db is Kysely<Record<string, unknown>> {
  return (
    typeof db === "object" &&
    db !== null &&
    "schema" in db &&
    "selectFrom" in db
  );
}

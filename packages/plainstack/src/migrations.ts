import fs from "node:fs/promises";
import path from "node:path";
import { Migrator } from "kysely";
import { TSFileMigrationProvider } from "kysely-ctl";
import { loadAndGetAppConfig } from "./app-config";
import { loadAndGetConfig } from "./config";
import { ensureDirectoryExists, fileExists } from "./plainstack-fs";

async function getMigrator() {
  const config = await loadAndGetConfig();
  const appConfig = await loadAndGetAppConfig({ config });
  return new Migrator({
    db: appConfig.database,
    provider: new TSFileMigrationProvider({
      migrationFolder: path.join(process.cwd(), config.paths.migrations),
    }),
  });
}

export async function migrateToLatest() {
  const migrator = await getMigrator();
  const result = await migrator.migrateToLatest();
  console.log(result);
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
  console.log(`Generated migration: ${fileName}`);
}

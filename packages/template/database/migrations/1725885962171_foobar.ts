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

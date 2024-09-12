import type { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema
    .createTable("contacts")
    .addColumn("id", "text", (col) => col.primaryKey())
    .addColumn("email", "text", (col) => col.notNull())
    .addColumn("created_at", "integer", (col) => col.notNull())
    .addColumn("double_opt_in_sent", "integer")
    .addColumn("double_opt_in_confirmed", "integer")
    .addColumn("double_opt_in_token", "text", (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("sparks")
    .addColumn("nr", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("last", "integer", (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable("contacts").execute();
  await db.schema.dropTable("sparks").execute();
}

import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate as migrateSql } from "drizzle-orm/better-sqlite3/migrator";

export async function migrate<T extends Record<string, unknown>>(
  db: BetterSQLite3Database<T>
) {
  console.log("migrating database...");
  migrateSql(db, { migrationsFolder: "./migrations" });
  console.log("migrations complete");
}

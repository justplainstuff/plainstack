import { migrate as migrateSql } from "drizzle-orm/better-sqlite3/migrator";
import { connection, db } from "~/app/database/database";

export function migrate() {
  console.log("migrating database...");
  migrateSql(db, { migrationsFolder: "./migrations" });
  console.log("migrations complete");
  connection.close();
}

migrate();

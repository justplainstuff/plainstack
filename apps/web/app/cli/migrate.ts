import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { connection, db } from "~/app/database/database";

console.log("migrating database...");
migrate(db, { migrationsFolder: "./migrations" });
console.log("migrations complete");
connection.close();

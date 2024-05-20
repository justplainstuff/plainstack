import { sql } from "drizzle-orm";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

export async function isolate<Schema extends Record<string, unknown>>(
  db: BetterSQLite3Database<Schema>,
  fn: (db: BetterSQLite3Database<Schema>) => Promise<void>
) {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("Make sure NODE_ENV=test is set before running tests");
  }
  // TODO check if pending migrations, and print warning if so
  let err: Error | null = null;

  try {
    // Begin the transaction
    db.run(sql.raw("BEGIN"));
    try {
      await fn(db);
    } catch (e) {
      err = e as Error;
    }
  } catch (e) {
    console.error(e);
    throw e;
  } finally {
    db.run(sql.raw("ROLLBACK"));
  }

  if (err) throw err;
}

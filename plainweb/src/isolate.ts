import { sql } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

export async function isolate<Schema extends Record<string, unknown>>(
  db: BetterSQLite3Database<Schema>,
  fn: (db: BetterSQLite3Database<Schema>) => Promise<void>,
) {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("Make sure NODE_ENV=test is set when running tests");
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
  } finally {
    db.run(sql.raw("ROLLBACK"));
  }

  if (err) {
    // rethrow the error with the original error attached
    const e = new Error(`Rethrowing the "${err.message}" error`);
    // @ts-ignore
    e.original_error = err;
    e.stack = err.stack;
    throw e;
  }
}

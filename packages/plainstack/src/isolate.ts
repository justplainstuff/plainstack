import { type Kysely, sql } from "kysely";

/**
 * Run a a function in a database transaction.
 * The transaction is automatically rolled back, even if the function doesn't throw an error.
 * Use during testing, to keep test cases isolated from each other.
 * */
export async function isolate(
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  db: Kysely<any>,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  fn: (db: Kysely<any>) => Promise<void>,
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
    // rethrow the error with the original error attached
    const e = new Error(`Rethrowing error: "${err.message}"`);
    // @ts-ignore
    e.original_error = err;
    e.stack = err.stack;
    throw e;
  }
}

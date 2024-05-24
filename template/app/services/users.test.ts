import { test, describe, before } from "node:test";
import { migrate as migrateSql } from "drizzle-orm/better-sqlite3/migrator";
import { createUser } from "~/app/services/users";
import { Db, db } from "~/app/database/database";
import { sql } from "drizzle-orm";
import assert from "node:assert";

async function transaction(fn: (db: Db) => Promise<void>) {
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

describe("users", async () => {
  before(() => {
    console.log("migrating database...");
    migrateSql(db, { migrationsFolder: "./migrations" });
    console.log("migrations complete");
  });

  test("createUser", async () => {
    await transaction(async (tx) => {
      await createUser(tx, "aang@example.org");
    });
  });

  test("createUser already exists", async () => {
    await transaction(async (tx) => {
      await createUser(tx, "aang@example.org");

      await assert.rejects(async () => {
        await createUser(tx, "aang@example.org");
      });
    });
  });
});

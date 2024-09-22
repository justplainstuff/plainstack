import SQLite from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";
import { describe, expect, it } from "vitest";
import { rollback } from "./database";

interface Contacts {
  email: string;
  id: string | null;
}

type Database = {
  contacts: Contacts;
};

async function createDatabase() {
  const db = new Kysely<Database>({
    dialect: new SqliteDialect({
      database: new SQLite(":memory:"),
    }),
  });
  await db.schema
    .createTable("contacts")
    .addColumn("id", "integer", (col) => col.primaryKey())
    .addColumn("email", "text")
    .execute();
  return db;
}

describe("database", () => {
  it("should rollback changes after successful execution", async () => {
    const db = await createDatabase();

    await rollback(db, async (tx) => {
      await tx
        .insertInto("contacts")
        .values({ id: "123", email: "test@example.com" })
        .execute();
    });

    const result = await db.selectFrom("contacts").selectAll().execute();
    expect(result).toHaveLength(0);
  });

  it("should rollback changes after throwing an error", async () => {
    const db = await createDatabase();

    await expect(
      rollback(db, async (tx) => {
        await tx
          .insertInto("contacts")
          .values({ id: "123", email: "test@example.com" })
          .execute();
        throw new Error("Test error");
      }),
    ).rejects.toThrow("Test error");

    const result = await db.selectFrom("contacts").selectAll().execute();
    expect(result).toHaveLength(0);
  });

  it("should allow querying during transaction", async () => {
    const db = await createDatabase();

    await rollback(db, async (tx) => {
      await tx
        .insertInto("contacts")
        .values({ id: "123", email: "test@example.com" })
        .execute();
      const result = await tx.selectFrom("contacts").selectAll().execute();
      expect(result).toHaveLength(1);
      expect(result[0].email).toBe("test@example.com");
    });

    const result = await db.selectFrom("contacts").selectAll().execute();
    expect(result).toHaveLength(0);
  });
});

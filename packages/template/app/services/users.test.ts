import database from "app/config/database";
import { createUser } from "app/services/users";
import { isolate } from "plainstack";
import { describe, expect, test } from "vitest";

describe("users", async () => {
  test("create user", async () => {
    await isolate(database, async (tx) => {
      await createUser(tx, "aang@example.org");
      expect(
        database.selectFrom("users").selectAll().executeTakeFirstOrThrow(),
      ).resolves.toBeDefined();
    });
  });

  test("create user already exists", async () =>
    isolate(database, async (tx) => {
      await createUser(tx, "aang@example.org");

      expect(async () => {
        await createUser(tx, "aang@example.org");
      }).rejects.toThrowError("User already exists");
    }));
});

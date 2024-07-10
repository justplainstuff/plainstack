import { database } from "app/config/database";
import { createUser } from "app/services/users";
import { isolate, migrate } from "plainweb";
import { beforeAll, describe, expect, test } from "vitest";

describe("users", async () => {
  beforeAll(() => migrate(database));

  test("createUser", async () => {
    await isolate(database, async (tx) => {
      await createUser(tx, "aang@example.org");
      expect(database.query.users.findFirst()).resolves.toBeDefined();
    });
  });

  test("createUser already exists", async () =>
    isolate(database, async (tx) => {
      await createUser(tx, "aang@example.org");

      expect(async () => {
        await createUser(tx, "aang@example.org");
      }).rejects.toThrowError("User already exists");
    }));
});

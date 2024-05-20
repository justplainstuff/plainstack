import { test, describe, before } from "node:test";
import { createUser } from "~/app/services/users";
import { database } from "~/app/config/database";
import assert from "node:assert";
import { isolate, migrate } from "plainweb";

describe("users", async () => {
  before(() => migrate(database));

  test("createUser", async () =>
    isolate(database, async (tx) => {
      await createUser(tx, "aang@example.org");
    }));

  test("createUser already exists", async () =>
    isolate(database, async (tx) => {
      await createUser(tx, "aang@example.org");

      await assert.rejects(async () => {
        await createUser(tx, "aang@example.org");
      });
    }));
});

import assert from "node:assert";
import { before, describe, test } from "node:test";
import { isolate, migrate } from "plainweb";
import { database } from "~/app/config/database";
import { createUser } from "~/app/services/users";

describe("users", async () => {
  before(() => migrate(database));

  test("createUser", async () => {
    await isolate(database, async (tx) => {
      await createUser(tx, "aang@example.org");
    });
    // TOOD add assertion
  });

  test("createUser already exists", async () =>
    isolate(database, async (tx) => {
      await createUser(tx, "aang@example.org");

      await assert.rejects(async () => {
        await createUser(tx, "aang@example.org");
      });
    }));
});

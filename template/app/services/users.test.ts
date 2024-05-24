import { test, describe, before } from "node:test";
import { createUser } from "~/app/services/users";
import { db } from "~/app/database/database";
import assert from "node:assert";
import { isolate, migrate } from "plainweb";

describe("users", async () => {
  before(() => migrate(db));

  test("createUser", async () =>
    isolate(db, async (tx) => {
      await createUser(tx, "aang@example.org");
    }));

  test("createUser already exists", async () =>
    isolate(db, async (tx) => {
      await createUser(tx, "aang@example.org");

      await assert.rejects(async () => {
        await createUser(tx, "aang@example.org");
      });
    }));
});

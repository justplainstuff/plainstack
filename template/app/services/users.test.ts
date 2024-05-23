import { test, describe, afterEach } from "node:test";
import assert from "node:assert/strict";
import { createUser } from "~/app/services/users";

describe("users", async () => {
  afterEach(() => console.log("finished running a test"));

  test("createUser", async () => {
    await createUser("aang@example.org");
  });

  test("createUser already exists", async () => {
    await createUser("aang@example.org");

    assert.rejects(async () => {
      await createUser("aang@exampe.org");
    }, "User already exists");
  });
});

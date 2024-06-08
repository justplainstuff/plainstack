---
title: Testing
---

# Testing

One of the main benefits of running SQLite is easy testing. There is not need to spin up another database for testing.
To further keep things simple, plainweb uses the new built-in Node.js test runner.

## Example setup

```typescript
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
```

Note the `isolate` function. It runs the test in a separate database transaction, which gets rolled back after the test is done. This ensures the database is always in a clean state after a test.

Use the `migrate` helper to run migrations before running tests.

### Testing services

plainweb calls functions in `app/services` services because they encapsulate business logic. Pass in the database as first argument to avoid hardcoding the database connection. This allows for better testability, because you can pass in the database transaction handle using `isolate`.

```typescript
import { database } from "~/app/config/database";
import { createUser } from "~/app/services/users";

test("some test involving users", async () => {
  await isolate(database, async (tx) => {
    await createUser(tx, "aang@example.org");
  });
});
```

### Testing handlers

```typescript
import { before, test, describe } from "node:test";
import assert from "node:assert/strict";
import { isolate, migrate, outbox, testHandler } from "plainweb";
import { database } from "~/app/config/database";
import { GET } from "~/app/routes/double-opt-in";
import { createRequest } from "node-mocks-http";
import { contacts } from "~/app/config/schema";
import { eq } from "drizzle-orm";

describe("double opt in", () => {
  before(async () => await migrate(database));

  test("send email with correct token and email", async () => {
    await isolate(database, async (tx) => {
      await tx.insert(contacts).values({
        email: "walter@example.org",
        created: Date.now(),
        doubleOptInSent: Date.now(),
        doubleOptInToken: "123",
      });

      const req = createRequest({
        url: `/double-opt-in?token=123&email=walter@example.org`,
      });
      const res = await testHandler(GET, req, { database });
      const contact = await database.query.contacts.findFirst({
        where: eq(contacts.email, "walter@example.org"),
      });
      assert.equal(contact?.doubleOptInConfirmed! > 0, true);
      assert.equal(res._getStatusCode(), 200);
      assert.equal(res._getData().includes("Thanks for signing up"), true);
      assert.equal(outbox[0]!.message.includes("successfully"), true);
    });
  });
});
```

### Testing emails

During testing `NODE_ENV` is set to `testing` and emails are sent to `outbox`.

```typescript
import { outbox } from "plainweb";
import assert from "node:assert";

// ...

assert.equal(outbox[0]!.message.includes("successfully"), true);
```

### Testing tasks

WIP

# Testing

One of the key advantages of using SQLite in plainweb is simplified testing. There's no need to spin up a separate database for running tests. plainweb uses Node.js's built-in test runner and assertion library to keep things straightforward.

## Testing Services

Let's start by testing a `createUser` function in `app/services/users.ts`:

```typescript
import { eq } from "drizzle-orm";
import { Database } from "~/app/config/database";
import { users } from "~/app/config/schema";

export async function createUser(db: Database, email: string) {
  if (
    await db.query.users.findFirst({ where: (user) => eq(user.email, email) })
  ) {
    throw new Error("User already exists");
  }
  const created = { email, created: Date.now() };
  await db.insert(users).values(created);
  return created;
}
```

In plainweb, functions in `app/services` are called "services" because they encapsulate business logic. We pass the database as the first argument to avoid hardcoding the database connection, improving testability. This allows us to pass in the database transaction handle using `isolate`.

Here's how to test the `createUser` service:

```typescript
import { test, describe, before } from "node:test";
import assert from "node:assert";
import { createUser } from "~/app/services/users";
import { database } from "~/app/config/database";
import { isolate, migrate } from "plainweb";

describe("users", async () => {
  before(() => migrate(database));

  test("createUser throws error when user already exists", async () =>
    isolate(database, async (tx) => {
      await createUser(tx, "aang@example.org");
      await assert.rejects(() => createUser(tx, "aang@example.org"), {
        message: "User already exists",
      });
    }));
});
```

Key points:

- `isolate` runs the test in a separate database transaction, which gets rolled back after the test is done. This ensures the database is always in a clean state after each test.
- `migrate` runs migrations before executing the test suite.

## Testing Handlers

plainweb provides a `testHandler` helper to test `GET` and `POST` handlers. Here's an example:

```typescript
import { before, test, describe } from "node:test";
import assert from "node:assert/strict";
import { isolate, migrate, outbox, testHandler } from "plainweb";
import { database } from "~/app/config/database";
import { GET } from "~/app/routes/double-opt-in";
import { createRequest } from "node-mocks-http";
import { contacts } from "~/app/config/schema";
import { eq } from "drizzle-orm";

describe("double opt-in", () => {
  before(async () => await migrate(database));

  test("confirms opt-in with correct token and email", async () => {
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

      assert.ok(contact?.doubleOptInConfirmed! > 0);
      assert.equal(res._getStatusCode(), 200);
      assert.ok(res._getData().includes("Thanks for signing up"));
      assert.ok(outbox[0]?.message.includes("successfully"));
    });
  });
});
```

Important notes for testing handlers:

1. Use `node-mocks-http` to create a mock request.
2. Pass the database handle to ensure the handler runs in the same `isolate` transaction.

## Testing Emails

During testing, `NODE_ENV` is set to `testing`, and emails are sent to an `outbox` array instead of being actually sent. You can assert on the contents of these emails:

```typescript
import { outbox } from "plainweb";
import assert from "node:assert";

// ...

assert.ok(outbox[0]?.message.includes("successfully"));
```

This approach allows you to verify email content without trapping sent emails or using a real email service for your tests.

# Testing

One of the main benefits of running SQLite is testing. There is not need to spin up another database to run tests.

To further keep things simple, plainweb uses the built-in Node.js test runner and the built-in assertion library.

## Testing Services

Let's test a `createUser` function in `app/services/users.ts`.

```typescript
import { eq } from "drizzle-orm";
import { Database } from "~/app/config/database";
import { users } from "~/app/config/schema";

export async function createUser(db: Database, email: string) {
  if (
    await db.query.users.findFirst({
      where: (user) => eq(user.email, email),
    })
  )
    throw new Error("User already exists");
  const created = { email: email, created: Date.now() };
  await db.insert(users).values(created);
  return created;
}
```

plainweb calls functions in `app/services` services because they encapsulate business logic. Pass in the database as first argument to avoid hardcoding the database connection. This allows for better testability, because you can pass in the database transaction handle using `isolate`.

```typescript
import { test, describe, before } from "node:test";
import { createUser } from "~/app/services/users";
import { database } from "~/app/config/database";
import assert from "node:assert";
import { isolate, migrate } from "plainweb";

describe("users", async () => {
  before(() => migrate(database));

  test("createUser already exists", async () =>
    isolate(database, async (tx) => {
      await createUser(tx, "aang@example.org");

      await assert.rejects(async () => {
        await createUser(tx, "aang@example.org");
      });
    }));
});
```

`isolate` runs the test in a separate database transaction, which gets rolled back after the test is done. This ensures the database is always in a clean state after a test.

`migrate` runs migrations before running the test suite.

### Testing handlers

plainweb provides a `testHandler` helper to test `GET` and `POST` handlers.

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

In order to test a handler you need a mock request and a database handle.

Create a mock request using `node-mocks-http`.

It's important to pass in the database handle, so the handler is running in the same `isolate` transaction.

### Testing emails

During testing `NODE_ENV` is set to `testing` and emails are sent to `outbox`.

```typescript
import { outbox } from "plainweb";
import assert from "node:assert";

// ...

assert.equal(outbox[0]!.message.includes("successfully"), true);
```

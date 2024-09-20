# Testing

One of the key advantages of using SQLite in plainstack is simplified testing. There's no need to spin up a separate database for running tests. plainstack uses vitest, a fast and feature-rich testing framework, to keep things straightforward.

## Services

Let's start by testing a `createUser` function in `app/services/users.ts`:

```typescript
import { Database } from "app/config/database";

export async function createUser(db: Database, email: string) {
  const existingUser = await db
    .selectFrom("users")
    .where("email", "=", email)
    .executeTakeFirst();

  if (existingUser) {
    throw new Error("User already exists");
  }

  const created = { email, created: Date.now() };
  await db.insertInto("users").values(created).execute();
  return created;
}
```

In plainstack, functions in `app/services` are called "services" because they encapsulate business logic. We pass the database as the first argument to avoid hardcoding the database connection, improving testability. This allows us to pass in the database transaction handle using `rollback`.

Here's how to test the `createUser` service:

```typescript
import { describe, test, beforeAll } from "vitest";
import { expect } from "vitest";
import { createUser } from "app/services/users";
import database from "app/config/database";
import { rollback, migrateToLatest } from "plainstack";

describe("users", () => {
  beforeAll(async () => await migrateToLatest());

  test("creating user throws error when user already exists", async () => {
    await rollback(database, async (db) => {
      await createUser(db, "aang@example.org");
      await expect(createUser(db, "aang@example.org")).rejects.toThrow(
        "User already exists"
      );
    });
  });
});
```

Key points:

- `rollback` runs the test in a separate database transaction, which gets rolled back after the test is done. This ensures the database is always in a clean state after each test.
- `migrateToLatest` runs migrations before executing the test suite.

## Handlers

plainstack provides a `testHandler` helper to test `GET` and `POST` handlers. Here's an example:

```typescript
import { describe, test, beforeAll } from "vitest";
import { expect } from "vitest";
import { rollback, migrateToLatest, outbox, testHandler } from "plainstack";
import database from "app/config/database";
import { GET } from "app/routes/double-opt-in";
import { createRequest } from "node-mocks-http";

describe("double opt-in", () => {
  beforeAll(async () => await migrateToLatest());

  test("confirms opt-in with correct token and email", async () => {
    await rollback(database, async (db) => {
      await db
        .insertInto("contacts")
        .values({
          email: "walter@example.org",
          createdAt: Date.now(),
          doubleOptInSent: Date.now(),
          doubleOptInToken: "123",
        })
        .execute();

      const req = createRequest({
        url: `/double-opt-in?token=123&email=walter@example.org`,
      });

      const res = await testHandler(GET, req, { database });

      const contact = await db
        .selectFrom("contacts")
        .selectAll()
        .where("email", "=", "walter@example.org")
        .executeTakeFirst();

      expect(contact?.doubleOptInConfirmed).toBeGreaterThan(0);
      expect(res._getStatusCode()).toBe(200);
      expect(res._getData()).toContain("Thanks for signing up");
      expect(outbox[0]?.message).toContain("successfully");
    });
  });
});
```

Important notes for testing handlers:

1. Use `node-mocks-http` to create a mock request.
2. Pass the database handle to ensure the handler runs in the same `rollback` transaction.

## Emails

During testing, `NODE_ENV` is set to `test`, and emails are sent to an `outbox` array instead of being actually sent. You can assert on the contents of these emails:

```typescript
import { outbox } from "plainstack";
import { expect } from "vitest";

// ...

expect(outbox[0]?.message).toContain("successfully");
```

This approach allows you to verify email content without trapping sent emails or using a real email service for your tests.

## Jobs

During testing, jobs are executed immediately.

```typescript
// app/jobs/hello.ts
import { defineJob } from "plainstack";

export default defineJob({
  name: import.meta.filename,
  run: async () => {
    console.log("Hello from a job!");
  },
});
```

For example:

```typescript
import helloJob from "app/jobs/hello";

await perform(helloJob);
```

During local development or in production, this would print "Hello from a job!" to the console once the worker picks up the job and executed the function.

If `NODE_ENV=test`, the job is executed immediately.

## Schedules

Schedules are skipped during testing. If you want to test schedules, extract the function as a service and test that service.

---
title: Task Queue
---

# Task Queue

plainweb comes with a simple persistent task queue backed by SQLite, which allows only a single writer. plainweb runs in a single Node.js process, so concurrent tasks can write to the database without any locking.

If you want to run truly parallel tasks, you have to spawn processes and manage them yourself. Keep in mind that you must not write to the database from parallel processes.

## Setup

```typescript
// app/config/schema.ts

import { text, integer, sqliteTable, int } from "drizzle-orm/sqlite-core";

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  data: text("data", { mode: "json" }),
  created: int("created").notNull(),
  failedLast: int("failed_last"),
  failedNr: int("failed_nr"),
  failedError: text("failed_error"),
});

export type Task = typeof tasks.$inferSelect;
```

```typescript
// app/cli/serve.ts

import { runTasks } from "plainweb";
await runTasks("app/tasks", { debug: true });
```

## Task definition

```typescript
// app/tasks/double-opt-in.ts

import { eq } from "drizzle-orm";
import { defineDatabaseTask } from "plainweb";
import { database } from "~/app/config/database";
import { Contact, contacts } from "~/app/config/schema";
import { sendDoubleOptInEmail } from "~/app/services/contacts";

export default defineDatabaseTask<Contact>(database, {
  batchSize: 5,
  async process({ data }) {
    await sendDoubleOptInEmail(database, data);
  },
  async success({ data }) {
    await database
      .update(contacts)
      .set({ doubleOptInSent: Date.now() })
      .where(eq(contacts.email, data.email));
  },
});
```

`batchSize` 5 means that 5 tasks are pulled from the database at a time for processing.

## Performing tasks

```typescript
// app/services/contacts.ts

import { perform } from "plainweb";
import doubleOptIn from "~/app/tasks/double-opt-in";

const contact = await db.query.contacts.findFirst({});
await perform(doubleOptIn, contact);
```

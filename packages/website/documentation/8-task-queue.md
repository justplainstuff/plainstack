# Task Queue

plainweb includes a simple, persistent task queue backed by SQLite. The web server and task workers run in a single Node.js process, allowing concurrent tasks to write to the database without locking issues.

**Note:** If you need to run parallel tasks, you'll need to manage process spawning yourself. Be cautious not to write to the database from parallel processes to avoid conflicts.

## Setup

### 1. Tasks Table

Add a `tasks` table to your database schema:

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

### 2. Start Background Task Worker

To start the task worker when running `pnpm start` and `pnpm dev`, call `getWorker()` to get an instance of you worker to start in your `app/cli/serve.ts` file:

```typescript
// app/cli/serve.ts
import { getWorker, log } from "plainstack";
import config from "plainweb.config";

async function serve() {
  const worker = getWorker(config);
  await worker.start(); // work all tasks in tasks directory
  log.info("⚡️ background task worker started");
  // rest of your code, starting http server, etc.
}

serve();
```

## Defining Tasks

Tasks are defined in files within the `app/tasks` directory. Any file with a default export is automatically discovered as a task.

Here's an example of a task definition:

```typescript
// app/tasks/double-opt-in.ts
import { eq } from "drizzle-orm";
import { defineDatabaseTask } from "plainstack";
import { database } from "app/config/database";
import { Contact, contacts } from "app/config/schema";
import { sendDoubleOptInEmail } from "app/services/contacts";

export default defineDatabaseTask<Contact>(database, {
  name: __filename,
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

In this example:

- `name` is the name of the task type, this has to be unique. Use `__filename` to get the filename of the current file.
- `batchSize: 5` means that 5 tasks are pulled from the database at a time for concurrent processing.
- `process` defines the main task logic.
- `success` defines actions to take after successful task completion.

## Performing Tasks

To enqueue a task, use the `perform` function:

```typescript
// app/services/contacts.ts
import type { Database } from "app/config/database";
import doubleOptIn from "app/tasks/double-opt-in";
import { perform } from "plainstack";

export async function createContact(database: Database, email: string) {
  const contact = // create contact
  if (contact) {
    await perform(doubleOptIn, contact); // enqueue task
  }
}
```

**Important:** Always `await` the `perform` function. This ensures the task is successfully enqueued before proceeding. It doesn't mean that the task has been processed yet!

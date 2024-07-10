# Task Queue

plainweb includes a simple, persistent task queue backed by SQLite. The web server and task workers run in a single Node.js process, allowing concurrent tasks to write to the database without locking issues.

**Note:** If you need to run parallel tasks, you'll need to manage process spawning yourself. Be cautious not to write to the database from parallel processes to avoid conflicts.

## Setup

### 1. Define the Tasks Table

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

### 2. Initialize the Task Worker

To start the task worker when running `pnpm start` and `pnpm dev`, call `runTasks` in your `app/cli/serve.ts` file:

```typescript
// app/cli/serve.ts
import { runTasks } from "plainweb";
import { http } from "app/config/http";

async function serve() {
  await runTasks("app/tasks"); // Initialize task worker
  await http();
}

serve();
```

## Defining Tasks

Tasks are defined in files within the `app/tasks` directory. Any file with a default export is automatically discovered as a task.

Here's an example of a task definition:

```typescript
// app/tasks/double-opt-in.ts
import { eq } from "drizzle-orm";
import { defineDatabaseTask } from "plainweb";
import { database } from "app/config/database";
import { Contact, contacts } from "app/config/schema";
import { sendDoubleOptInEmail } from "app/services/contacts";

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

In this example:

- `batchSize: 5` means that 5 tasks are pulled from the database at a time for concurrent processing.
- `process` defines the main task logic.
- `success` defines actions to take after successful task completion.

## Performing Tasks

To enqueue a task, use the `perform` function:

```typescript
// app/services/contacts.ts
import { perform } from "plainweb";
import doubleOptIn from "app/tasks/double-opt-in";

export async function enqueueDoubleOptIn(contact: Contact) {
  const contact = await database.query.contacts.findFirst({
    where: eq(contacts.email, email),
  });
  if (contact) {
    await perform(doubleOptIn, contact);
  }
}
```

**Important:** Always `await` the `perform` function. This ensures the task is successfully enqueued before proceeding.

## Best Practices

1. **Error Handling**: Implement robust error handling in your task definitions. The `defineDatabaseTask` function also accepts an optional `error` callback for handling task failures.

2. **Idempotency**: Design your tasks to be idempotent whenever possible. This ensures that if a task is accidentally run multiple times, it doesn't cause unintended side effects.

3. **Monitoring**: Implement logging or monitoring for your tasks to track their execution and any potential issues.

4. **Task Priorities**: If you need to prioritize certain tasks, consider implementing a priority system using additional fields in your tasks table.

5. **Long-running Tasks**: For tasks that might take a long time to complete, consider implementing a timeout mechanism or breaking them into smaller subtasks.

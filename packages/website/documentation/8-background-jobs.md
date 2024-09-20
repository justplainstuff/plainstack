# Background Jobs

plainstack includes a simple, persistent job queue backed by SQLite. It uses [plainjobs](https://github.com/justplainstuff/plainjobs) under the hood, which can process around 15,000 jobs per second.

## Setup

### Queue Configuration

Create a `app/config/queue.ts` file to define the default queue:

```typescript
// app/config/queue.ts
import env from "app/config/env";
import SQLite from "better-sqlite3";
import { defineQueue } from "plainstack";

export default defineQueue({
  connection: new SQLite(env.DB_URL),
});
```

This default queue will be used for all jobs. You can optionally provide a different SQLite database to decrease writes on the main database.

### Starting Workers

To start workers, you can use the `plainstack work` command:

```bash
plainstack work
```

For parallel processing, use the `--parallel` flag. For instance, to start 2 parallel workers:

```bash
plainstack work --parallel 2
```

When running `plainstack dev`, a worker is automatically started in the same process.

## Defining Jobs

Jobs are defined in files within the `app/jobs` directory. Any file with a default export is automatically discovered as a job.

Here's an example of a job definition:

```typescript
// app/jobs/double-opt-in.ts
import { defineJob } from "plainstack";
import { database } from "app/config/database";
import type { Contact } from "app/config/schema";
import { sendDoubleOptInEmail } from "app/services/contacts";

export default defineJob<Contact>({
  name: import.meta.filename,
  async run({ data }) {
    await sendDoubleOptInEmail(database, data);
    await database
      .updateTable("contacts")
      .set({ doubleOptInSent: Date.now() })
      .where("email", "=", data.email)
      .execute();
  },
});
```

In this example:

- `name` is the name of the job type, which must be unique. Use `import.meta.filename` to get the filename of the current file.
- `run` defines the main job logic.

## Performing Jobs

To enqueue a job, use the `perform` function:

```typescript
// app/services/contacts.ts
import type { Database } from "app/config/database";
import doubleOptIn from "app/jobs/double-opt-in";
import { perform } from "plainstack";

export async function createContact(database: Database, email: string) {
  const contact = // create contact
  if (contact) {
    await perform(doubleOptIn, contact); // enqueue job
  }
}
```

**Important:** Always `await` the `perform` function. This ensures the job is successfully enqueued before proceeding. It doesn't mean that the job has been processed yet!

## Testing

During testing, jobs are executed immediately and the database backed queue is not used.

## Performance

With plainjobs, the background job system can process approximately 15,000 jobs per second, providing high-performance job processing capabilities for your application.

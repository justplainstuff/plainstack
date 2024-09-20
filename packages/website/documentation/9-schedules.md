# Schedules

plainstack includes a simple scheduling system backed by SQLite. It uses [plainjobs](https://github.com/justplainstuff/plainjobs) under the hood, allowing you to run tasks on a regular basis using cron syntax.

## Setup

### Queue Configuration

The schedules use the same queue configuration as background jobs. If you haven't already, create a `app/config/queue.ts` file to define the default queue:

```typescript
// app/config/queue.ts
import env from "app/config/env";
import SQLite from "better-sqlite3";
import { defineQueue } from "plainstack";

export default defineQueue({
  connection: new SQLite(env.DB_URL),
});
```

### Starting Workers

Schedules are processed by the same workers that handle background jobs. To start workers, use the `plainstack work` command:

```bash
plainstack work
```

For parallel processing, use the `--parallel` flag:

```bash
plainstack work --parallel 2
```

When running `plainstack dev`, a worker is automatically started in the same process, which will handle both jobs and schedules.

## Defining Schedules

Schedules are defined in files within the `app/schedules` directory. Any file with a default export is automatically discovered as a schedule.

Here's an example of a schedule definition:

```typescript
// app/schedules/daily-report.ts
import { defineSchedule } from "plainstack";
import { database } from "app/config/database";
import { sendDailyReport } from "app/services/reports";

export default defineSchedule({
  name: import.meta.filename,
  cron: "0 0 * * *", // Run daily at midnight
  async run() {
    const users = await database
      .selectFrom("users")
      .select(["id", "email"])
      .where("isActive", "=", true)
      .execute();

    for (const user of users) {
      await sendDailyReport(user.email);
    }
  },
});
```

In this example:

- `name` is the name of the schedule, which must be unique. Using `import.meta.filename` ensures uniqueness based on the file path.
- `cron` defines when the schedule should run using cron syntax.
- `run` defines the main logic to be executed on schedule.

## Cron Syntax

The `cron` field uses standard cron syntax. Here are some examples:

- `"0 0 * * *"`: Run daily at midnight
- `"*/15 * * * *"`: Run every 15 minutes
- `"0 9 * * 1-5"`: Run at 9 AM every weekday (Monday through Friday)
- `"0 0 1 * *"`: Run at midnight on the first day of each month

## Testing

During testing, schedules are not automatically run. You can manually trigger a schedule's `run` function in your tests if needed.

## Performance

The scheduling system uses the same underlying mechanism as background jobs, so it benefits from the high-performance capabilities of plainjobs. However, keep in mind that schedules are meant for recurring tasks, not high-frequency operations.

## Best Practices

1. Keep scheduled tasks lightweight. If a task is heavy, consider using it to trigger background jobs instead.
2. Use appropriate cron expressions. Avoid scheduling tasks too frequently, as this can impact system performance.
3. Handle errors gracefully within your scheduled tasks to prevent the worker from crashing.
4. Use logging within your scheduled tasks to track their execution and any potential issues.

```typescript
import { defineSchedule, perform } from "plainstack";
import { database } from "app/config/database";
import generateReport from "app/jobs/generate-report";

export default defineSchedule({
  name: import.meta.filename,
  cron: "0 1 * * *", // Run daily at 1 AM
  async run() {
    const users = await database
      .selectFrom("users")
      .select("id")
      .where("needsReport", "=", true)
      .execute();

    for (const user of users) {
      await perform(generateReport, { userId: user.id });
    }
  },
});
```

This example demonstrates a schedule that triggers individual report generation jobs for each user, allowing for parallel processing and better error handling.

# Logging

plainstack uses [consola](https://github.com/unjs/consola) for logging, providing a flexible and powerful logging solution.

## Setup

By default, plainstack logs everything from `info` level and above to the console.

### Configuration

You can configure the log level in your `plainstack.config.ts` file:

```typescript
import { defineConfig } from "plainstack";

export default defineConfig({
  // ... other config options
  logLevel: "info", // only log info and above
});
```

### Custom Reporters

You can add custom reporters by creating an `app/config/logger.ts` file. This file can export multiple consola reporters, which will then be used by the logging system.

Here's an example of how to implement a custom reporter:

```typescript
// app/config/logger.ts
import { formatWithOptions } from "node:util";
import type {
LogObject,
ConsolaReporter,
FormatOptions,
ConsolaOptions,
} from "consola";
import { parseStack } from "consola/utils/error";
import { writeStream } from "consola/utils/stream";

const bracket = (x: string) => (x ? `[${x}]` : "");

export class CustomReporter implements ConsolaReporter {
formatStack(stack: string, opts: FormatOptions) {
return " " + parseStack(stack).join("\n ");
}

formatArgs(args: any[], opts: FormatOptions) {
const \_args = args.map((arg) => {
if (arg && typeof arg.stack === "string") {
return arg.message + "\n" + this.formatStack(arg.stack, opts);
}
return arg;
});

    return formatWithOptions(opts, ..._args);

}

formatDate(date: Date, opts: FormatOptions) {
return opts.date ? date.toLocaleTimeString() : "";
}

filterAndJoin(arr: any[]) {
return arr.filter(Boolean).join(" ");
}

formatLogObj(logObj: LogObject, opts: FormatOptions) {
const message = this.formatArgs(logObj.args, opts);

    if (logObj.type === "box") {
      return (
        "\n" +
        [
          bracket(logObj.tag),
          logObj.title && logObj.title,
          ...message.split("\n"),
        ]
          .filter(Boolean)
          .map((l) => " > " + l)
          .join("\n") +
        "\n"
      );
    }

    return this.filterAndJoin([
      bracket(logObj.type),
      bracket(logObj.tag),
      message,
    ]);

}

log(logObj: LogObject, ctx: { options: ConsolaOptions }) {
const line = this.formatLogObj(logObj, {
columns: (ctx.options.stdout as any).columns || 0,
...ctx.options.formatOptions,
});

    return writeStream(
      line + "\n",
      logObj.level < 2
        ? ctx.options.stderr || process.stderr
        : ctx.options.stdout || process.stdout,
    );

}
}

export default [new CustomReporter()];
```

## Usage

To use the logger in your application, import the `getLogger` function from `plainstack` and create a logger instance:

```typescript
import { getLogger } from "plainstack";

const log = getLogger("myComponent");

log.info("This is an informational message");
log.error("An error occurred", new Error("Something went wrong"));
```

Here's an example from the `contacts.ts` file:

```typescript
import { getLogger } from "plainstack";

export async function sendDoubleOptInEmail(
  database: Database,
  contact: Contacts
) {
  const log = getLogger("contacts");
  log.info(
    `Sending double opt-in email to ${contact.email} using base url <base url>`
  );
  // ... rest of the function
}
```

The logger automatically adds context to your logs, such as the component name ("contacts" in this case), making it easier to trace the source of log messages.

## Log Levels

Consola supports various log levels, including:

- `fatal`
- `error`
- `warn`
- `log`
- `info`
- `success`
- `debug`
- `trace`

Use the appropriate level for your messages to ensure proper filtering and handling of logs.

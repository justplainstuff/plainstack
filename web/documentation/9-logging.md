# Logging

plainweb uses [winston](https://github.com/winstonjs/winston) for logging.

## Setup

By default, plainweb logs everything from `info` above to the console.

```typescript
import { defineConfig } from "plainweb";

export default defineConfig({
  // ... other config options
  logger: {
    level: "info", // only log info and above
  },
});
```

## Usage

Create a custom logger instance using `getLogger`, then use it to log messages:

```typescript
import { getLogger } from "plainweb";

const log = getLogger("myComponent");

log.info("This is an informational message");
log.error("An error occurred", { error: new Error("Something went wrong") });
```

## Custom Transports

You can add custom transports to the logger by using the `logger.transports` option:

```typescript
import { defineConfig } from "plainweb";
import { createLogger, transports } from "winston";

export default defineConfig({
  // ... other config options
  logger: {
    transports: [
      new winston.transports.File({ filename: "error.log", level: "error" }),
      new winston.transports.File({ filename: "combined.log" }),
    ],
  },
});
```

# Environment Variables

plainstack validates environment variables using [zod](https://zod.dev). By default, `.env` files are automatically loaded. During tests, `NODE_ENV=test` is set automatically and `.env.test` is loaded and merged with existing variables and the `.env` file.

## Setup

```typescript
// app/config/env.ts
import { defineEnv } from "plainstack";

export default defineEnv((z) =>
  z.object({
    NODE_ENV: z.enum(["development", "production", "test"]),
    PORT: z.coerce.number().optional(),
    LOG_LEVEL: z.enum(["error", "warn", "info", "debug", "trace"]).optional(),
    DB_URL: z.string(),
  })
);
```

## Usage

```typescript
import env from "app/config/env";

console.log(env.NODE_ENV); // either "development", "production" or "test"
```

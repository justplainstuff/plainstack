---
title: Environment Variables
---

# Environment Variables

plainweb uses [dotenv](https://github.com/motdotla/dotenv) and [zod](zod.dev) to parse environment variables.

## Setup

```typescript
import dotenv from "dotenv";
import z from "zod";

dotenv.config();

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.coerce.number().default(3000),
  DB_URL: z.string().default("db.sqlite3"),
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);
```

## Usage

```typescript
import { env } from "~/app/config/env";

console.log(env.NODE_ENV); // either "development", "production" or "test"
```

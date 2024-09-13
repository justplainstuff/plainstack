# Directory Structure

Running `npx create-plainstack` will create a starter project with the following structure:

```
├── Dockerfile
├── app
│   ├── commands
│   ├── components
│   ├── config
│   ├── jobs
│   ├── layouts
│   ├── routes
│   ├── schedules
│   └── services
├── assets
├── database
├── package.json
├── plainstack.config.ts
└── tsconfig.json
```

## `app`

This directory contains the main application code and everything that doesn't need to be in the root.

### `commands`

Custom CLI commands that can be executed with `plainstack custom <name>`. Custom commands can be implemented using [citty](https://github.com/unjs/citty).

### `components`

Contains React-like components used in the application. While plainstack doesn't use React directly, it employs type-safe `.tsx` components that behave like server-side rendered React components.

### `config`

Houses configuration files, such as database connection strings and mailer settings.

### `jobs`

Background jobs are defined in this directory.

### `layouts`

This directory contains page layouts defines as JSX components.

### `routes`

plainstack uses file-based routing with a convention similar to Next.js Pages Router. Routes are defined in `.tsx` files and are converted to express routes at startup.

### `schedules`

Schedules are cron-based background jobs that run periodically.

### `services`

This directory is for your business logic. Often called `features` or `utils` in other frameworks, feel free to rename it as you see fit.

### `assets`

This is where you store static assets such as images, fonts, and stylesheets. Root `.ts` files are compiled and bundles to `.js` files.

## `database`

This directory contains a list of kysely migrations and a `seed.ts` file that is used for seeding the database. `plainstack migrate` runs all pending migrations and `plainstack seed` runs the seed file.

## `plainstack.config.ts`

Contains the central plainstack configuration for the project.

```typescript
import env from "app/config/env";
import { defineConfig } from "plainstack";

export default defineConfig({
  nodeEnv: env.NODE_ENV,
  logger: {
    level: env.LOG_LEVEL,
  },
});
```

## Other Files

- `Dockerfile`: Used for containerizing the application.
- `package.json`: Defines project dependencies and scripts.
- `tsconfig.json`: TypeScript compiler options and project settings.

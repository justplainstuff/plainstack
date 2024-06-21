# Directory Structure

Running `npx create-plainweb` will create a starter project with the structure below.

```bash
├── Dockerfile
├── app
│   ├── cli
│   ├── components
│   ├── config
│   ├── env.ts
│   ├── root.tsx
│   ├── routes
│   ├── services
│   └── styles.css
├── drizzle.config.ts
├── fly.toml
├── migrations
├── package.json
├── public
│   └── output.css
├── tailwind.config.ts
└── tsconfig.json
```

## `app`

This is where the application code lives and everything that doesn't have to be in root.

### `cli`

One-off scripts that are aliases in `package.json`. Low-overhead and super simple convention for adding CLI entrypoints such as `pnpm db:gen`, `pnpm start` or `pnpm dev`.

### `components`

React components that are used in the application. plainweb is not really using React, but type-safe `.tsx` components that behave like server-side rendered React components.

### `config`

Configuration such as database connection strings and mailer live here.

### `env.ts`

Type safe environment variables using zod and dotenv.

### `root.tsx`

The root layout that is used for all pages. It is a simple wrapper around the `<html>` tag. This is where you can add global styles and scripts.

### `routes`

plainweb does file-based routing with a routing convention similar to Next.js Pages Router. Routes are `.tsx` files and are converted to express routes at startup.

### `services`

This is where you can put your business logic. This directory is often called `features` or `utils`, feel free to call it whatever you want.

### `styles.css`

The input file for Tailwind CSS.

### `tasks`

This is where background tasks are defined that are stored on the simple SQLite-based task queue.

## `migrations`

`pnpm db:gen` creates new migration files in this directory. Run `pnpm db:apply` to apply all migrations stored in this directory.

## `drizzle.config.ts`

drizzle-kit configuration to generate and run migrations.

## `public`

These are the static files that are served by the server.

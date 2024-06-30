# Directory Structure

Running `npx create-plainweb` will create a starter project with the following structure:

```bash
├── Dockerfile
├── app
│   ├── cli
│   ├── components
│   ├── config
│   ├── env.ts
│   ├── root.tsx
│   ├── routes
│   ├── services
│   └── styles.css
├── drizzle.config.ts
├── fly.toml
├── migrations
├── package.json
├── public
│   └── output.css
├── tailwind.config.ts
└── tsconfig.json
```

## `app`

This directory contains the main application code and everything that doesn't need to be in the root.

### `cli`

One-off scripts that are aliased in `package.json`. This provides a low-overhead, simple convention for adding CLI entrypoints such as `npm run db:gen`, `npm run start`, or `npm run dev`.

### `components`

Contains React-like components used in the application. While plainweb doesn't use React directly, it employs type-safe `.tsx` components that behave like server-side rendered React components.

### `config`

Houses configuration files, such as database connection strings and mailer settings.

### `env.ts`

Manages type-safe environment variables using zod and dotenv.

### `root.tsx`

The root layout used for all pages. It's a simple wrapper around the `<html>` tag where you can add global styles and scripts.

### `routes`

plainweb uses file-based routing with a convention similar to Next.js Pages Router. Routes are defined in `.tsx` files and are converted to express routes at startup.

### `services`

This directory is for your business logic. Often called `features` or `utils` in other frameworks, feel free to rename it as you see fit.

### `styles.css`

The input file for Tailwind CSS.

### `tasks`

Defines background tasks that are stored in the simple SQLite-based task queue.

## `migrations`

Running `npm run db:gen` creates new migration files in this directory. Use `npm run db:apply` to apply all migrations stored here.

## `drizzle.config.ts`

Contains the drizzle-kit configuration for generating and running migrations.

## `public`

Stores static files that are served directly by the server.

## Other Files

- `Dockerfile`: Used for containerizing the application.
- `fly.toml`: Configuration file for deployment on Fly.io.
- `package.json`: Defines project dependencies and scripts.
- `tailwind.config.ts`: Configuration file for Tailwind CSS.
- `tsconfig.json`: TypeScript compiler options and project settings.

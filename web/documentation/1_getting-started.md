---
title: Getting Started
---

# Getting Started

Run the following command to create a new plainweb starter project:

```bash
npx create-plainweb
```

And follow the prompts to set up your project.

```bash
npm run dev
```

This will start the development server at `http://localhost:3000`.

## Commands

These are the most important commands for development:

- `npm run dev` runs the development server in watch mode
- `npm run test` runs tests with the built-in Node test runner (Node 22 is recommended)
- `npm run db:push` pushes the `schema.ts` to the database without going through the migration process, useful for development
- `npm run db:gen` generates the migration files
- `npm run db:apply` applies the migrations
- `npm run db:studio` starts drizzle studio, a GUI for managing the database
- `npm run build` type checks your app and minifies the CSS
- `npm run lint` runs the linter, including cross-site scripting scanning
- `npm run fix` fixes linting errors

## Next steps

Head over to [Directory Structure](/docs/directory-structure) to build or read about the [motivation](/docs/motivation) behind plainweb.

# Getting Started

Run the following command to create a new plainweb starter project:

```bash
npx create-plainweb
```

Make sure you are running Node 20.10.0 or higher and you have [pnpm](https://pnpm.io/) installed.

```bash
node --version
> v20.10.0
```

And follow the prompts to set up your project.

```bash
pnpm run dev
```

This will start the development server at `http://localhost:3000`.

## Commands

These are the most important commands for development:

- `pnpm run dev` runs the development server in watch mode
- `pnpm run test` runs tests with the built-in Node test runner (Node 22 is recommended)
- `pnpm run db:push` pushes the `schema.ts` to the database without going through the migration process, useful for development
- `pnpm run db:gen` generates the migration files
- `pnpm run db:apply` applies the migrations
- `pnpm run db:studio` starts drizzle studio, a GUI for managing the database
- `pnpm run build` type checks your app and minifies the CSS
- `pnpm run routes` prints all express routes to the console
- `pnpm run lint` runs the linter, including cross-site scripting scanning
- `pnpm run fix` fixes linting errors

## VSCode Extensions

Following extensions are recommended when using VSCode:

- [biome](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) (formatter & linter)
- [tailwind](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

## Next steps

Head over to [Directory Structure](/docs/directory-structure) to dig into the starter project.

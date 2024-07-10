# Getting Started

Run the following command to create a new plainweb starter project:

```bash
npx create-plainweb
```

You need Node and [pnpm](https://pnpm.io/) installed. plainweb uses Node 20.10.0 or higher and pnpm 9.5.0 or higher.

```bash
node --version
> v20.10.0
```

```bash
pnpm --version
> 9.5.0
```

Start the development server at `http://localhost:3000`.

```bash
pnpm run dev
```

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
- `pnpm run check` runs the linter, formatter and scans .tsx files for cross-site scripting
- `pnpm run fix` fixes linting and formatting errors best-effort

## VSCode Extensions

Following extensions are recommended when using VSCode:

- [biome](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) (formatter & linter)
- [tailwind](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

## Next steps

Head over to [Directory Structure](/docs/directory-structure) to dig into the starter project.

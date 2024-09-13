# Getting Started

Run the following command to create a new plainstack starter project:

```bash
npm create plainstack
```

You need Node and [pnpm](https://pnpm.io/) installed. plainstack uses Node 20.10.0 or higher and pnpm 9.5.0 or higher.

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
pnpm dev
```

## Commands

Run

```bash
pnpm pls
```

to see a list of supported commands.

```bash
The fastest way to build TypeScript apps  (plainstack)                                                                                                         10:26:20 AM

USAGE plainstack dev|build|test|serve|work|routes|migrate|seed|info|custom

COMMANDS

      dev    Start the local development server
    build    Type-check, lint and bundle assets
     test    Run tests
    serve    Start the production web server
     work    Start background workers
   routes    Print all file routes
  migrate    Apply all pending migrations
     seed    Run the seeds in seed.ts
     info    Print project info
   custom    Run a custom command

Use plainstack <command> --help for more information about a command.
```

## VSCode Extensions

Following extensions are recommended when using VSCode:

- [biome](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) (formatter & linter)
- [tailwind](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

## Next steps

Head over to [Directory Structure](/docs/directory-structure) to dig into the starter project.

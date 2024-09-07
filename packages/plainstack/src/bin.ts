// "scripts": {
//     "dev": "npm-run-all --parallel \"tsx watch app/cli/serve.ts\" \"tailwindcss -i ./app/styles.css -o ./public/output.css --watch\"",
//     "test": "NODE_ENV=test vitest run",
//     "migrate": "kysely migrate && pnpm pls tables",
//     "generate": "kysely migration:make",
//     "seed": "pls seed",
//     "serve": "pls --migrate serve",
//     "work": "pls --migrate work",
//     "pls": "tsx bin.ts",
//     "check": "tsc --noEmit && biome check --fix . && xss-scan",
//     "tw": "tailwindcss -i ./app/styles.css -o ./public/output.css --minify",
//     "tables": "DATABASE_URL=db.sqlite3 kysely-codegen --dialect sqlite --out-file app/config/tables.ts"
//   },
// tables: "tables": "DATABASE_URL=db.sqlite3 kysely-codegen --dialect sqlite --out-file app/config/tables.ts"

// commands to implement
// dev
// test
// routes
// serve
// work
// repl
// db:generate
// db:migrate
// db:types
// assets
// build

// example help screen
// COMMANDS

//               init    Create a sample kysely.config file
//       migrate:down    Undo the last/specified migration that was run
//     migrate:latest    Update the database schema to the latest version
//       migrate:list    List both completed and pending migrations
//       migrate:make    Create a new migration file
//   migrate:rollback    Rollback all the completed migrations
//           seed:run    Run seed files
//          seed:make    Create a new seed file
//         migrate:up    Run the next migration that has not yet been run
//            migrate    Migrate the database schema
//               seed    Populate your database with test or seed data independent of your migration files

// Use kysely <command> --help for more information about a command.

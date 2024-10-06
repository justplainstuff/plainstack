import { join } from "node:path";
import consola from "consola";
import { type Kysely, type Migration, Migrator, sql } from "kysely";
import {
  DEFAULT_NUMERIC_PARSER,
  DialectManager,
  generate,
} from "kysely-codegen";
import { test } from "./env";

export function migrate(
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  db: Kysely<any>,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
): (...fns: ((db: Kysely<any>) => Promise<void>)[]) => Promise<void> {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  return async (...fns: ((db: Kysely<any>) => Promise<void>)[]) => {
    const migrations: Record<string, Migration> = {};
    for (const [idx, fn] of fns.entries()) {
      migrations[idx] = { up: fn };
    }
    const migrator = new Migrator({
      db,
      provider: {
        async getMigrations() {
          return migrations;
        },
      },
      allowUnorderedMigrations: true,
    });
    const result = await migrator.migrateToLatest();
    consola.debug(result);
    consola.info("✓ migrations applied");
    const dialectManager = new DialectManager({
      numericParser: DEFAULT_NUMERIC_PARSER,
    });
    if (!test()) {
      const dialect = dialectManager.getDialect("kysely-bun-sqlite");
      await generate({
        camelCase: true,
        db,
        dialect,
        print: false,
        typeOnlyImports: true,
        runtimeEnums: true,
        outFile: join(
          process.cwd(),
          "node_modules",
          "plainstack",
          "dist",
          "db.d.ts",
        ),
      });
    }
    consola.info("✓ types generated");
    if (process.env.PS_MIGRATE) {
      console.info("PS_MIGRATE=1, exiting process...");
      process.exit(0);
    }
  };
}

/**l
 * Run a function in a database transaction.
 * The transaction is automatically rolled back, even if the function doesn't throw an error.
 * Use during testing, to keep test cases isolated from each other.
 * */
export async function rollback<T>(
  db: Kysely<T>,
  fn: (db: Kysely<T>) => Promise<void>,
) {
  const err: Error | null = null;

  try {
    await sql.raw("BEGIN").execute(db);
    await fn(db);
  } finally {
    await sql.raw("ROLLBACK").execute(db);
  }

  if (err) throw err;
}

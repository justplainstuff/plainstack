import assert from "node:assert/strict";
import BetterSqlite3Database from "better-sqlite3";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { beforeAll, describe, test } from "vitest";
import { isolate } from "../isolate";
import { defineDatabaseTask } from "./database";
import { type Task, _runTasks, composeStartableTask, perform } from "./task";

const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  data: text("data", { mode: "json" }),
  created: int("created").notNull(),
  failedLast: int("failed_last"),
  failedNr: int("failed_nr"),
  failedError: text("failed_error"),
});
const schema = { tasks };
const connection = new BetterSqlite3Database(":memory:");
connection.pragma("journal_mode = WAL");
const database = drizzle<typeof schema>(connection, { schema });
type Database = typeof database;

async function processUntil(
  tasks: Task<unknown>[],
  {
    f,
    until = (db) =>
      db.query.tasks.findMany().then((tasks) => tasks.length === 0),
    debug = false,
  }: {
    f: () => Promise<void>;
    until?: (database: Database) => Promise<boolean>;
    debug?: boolean;
  },
): Promise<void> {
  const runnableTasks = tasks.map((task, idx) =>
    composeStartableTask(task, `task-${idx}`, { debug: true }),
  );
  const timeouts = _runTasks(runnableTasks, { debug: true });
  await f();
  while (!(await until(database))) {
    await new Promise((resolve) => setTimeout(resolve, 1));
    debug && console.log(await database.query.tasks.findMany());
  }
  for (const timeout of Object.values(timeouts)) {
    clearInterval(timeout);
  }
}

process.env.NODE_ENV = "test";

describe("database task", () => {
  beforeAll(() => {
    const migrations = `CREATE TABLE \`tasks\` (
	\`id\` text PRIMARY KEY NOT NULL,
	\`name\` text NOT NULL,
	\`data\` text,
	\`created\` integer NOT NULL,
	\`failed_last\` integer,
	\`failed_nr\` integer,
	\`failed_error\` text
)
    `;
    connection.exec(migrations);
  });

  test.skip("process task", async () => {
    let total = 0;
    await isolate(database, async (tx) => {
      const task = defineDatabaseTask<{ add: number }>(tx, {
        process: async ({ data }) => {
          total = total + data.add;
        },
        pollIntervall: 1,
      });
      await processUntil([task], {
        async f() {
          await perform(task, { add: 3 });
          await perform(task, { add: 5 });
        },
      });
    });
    assert.equal(total, 8);
  });

  test("process task with failure", async () => {
    await isolate(database, async (tx) => {
      const task = defineDatabaseTask(tx, {
        process: async () => {
          throw new Error("test");
        },
        pollIntervall: 1,
        maxRetries: 1,
        retryIntervall: 1,
      });
      await processUntil([task], {
        async until(database) {
          return database.query.tasks
            .findMany({
              where: ({ failedNr }) => eq(failedNr, 2),
            })
            .then((tasks) => tasks.length === 1);
        },
        async f() {
          await perform(task);
        },
      });
      const tasks = await database.query.tasks.findMany();
      assert.equal(tasks.length, 1);
      assert.equal(tasks[0]?.failedNr, 2);
    });
  });
});

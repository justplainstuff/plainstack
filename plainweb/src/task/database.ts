import type BetterSqlite3Database from "better-sqlite3";
import { type ExtractTablesWithRelations, and, lte, or } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { asc } from "drizzle-orm";
import { isNull } from "drizzle-orm";
import {
  type BaseSQLiteDatabase,
  int,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";
import {
  type DefineTaskOpts,
  type PersistedTask,
  type Task,
  type TaskStorage,
  composePersistedTask,
  defineTaskWithAdapter,
} from "./task";

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  data: text("data", { mode: "json" }),
  created: int("created").notNull(),
  failedLast: int("failed_last"),
  failedNr: int("failed_nr"),
  failedError: text("failed_error"),
});

// internal check
const _ = tasks.$inferSelect satisfies PersistedTask<unknown>;

const schema = { tasks };

export type Database = BaseSQLiteDatabase<
  "sync",
  BetterSqlite3Database.RunResult,
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

function composeDatabaseAdapter(database: Database): TaskStorage<unknown> {
  return {
    async enqueue({ data, name }) {
      const persistedTask = composePersistedTask({ data, name });
      await database.insert(tasks).values(persistedTask);
    },
    async fetch({ name: taskName, batchSize, maxRetries, retryIntervall }) {
      const tasks = await database.query.tasks.findMany({
        limit: batchSize,
        orderBy: ({ created }) => asc(created),
        where: ({ failedNr, failedLast, name }) =>
          and(
            or(lte(failedNr, maxRetries), isNull(failedNr)),
            or(
              lte(failedLast, Date.now() - retryIntervall),
              isNull(failedLast),
            ),
            eq(name, taskName),
          ),
      });
      return tasks;
    },
    async success({ task }) {
      await database.delete(tasks).where(eq(tasks.id, task.id));
    },
    async failure({ task, err }) {
      await database
        .update(tasks)
        .set({
          failedLast: Date.now(),
          failedNr: (task.failedNr ?? 0) + 1,
          failedError: JSON.stringify({
            instance: (err as Error).constructor.name,
            message: (err as Error).message,
            stack: (err as Error).stack,
          }),
        })
        .where(eq(tasks.id, task.id));
    },
  };
}

export function defineDatabaseTask<T>(
  database: Database,
  opts: DefineTaskOpts<T>,
): Task<T> {
  return defineTaskWithAdapter(
    composeDatabaseAdapter(database),
    opts as DefineTaskOpts<unknown>,
  );
}

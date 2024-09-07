// import BetterSqlite3Database from "better-sqlite3";
// import {
//   type BetterSQLite3Database,
//   drizzle,
// } from "drizzle-orm/better-sqlite3";
// import { DefaultLogger, type LogWriter } from "drizzle-orm/logger";
// import { getLogger } from "log";
// import type { ExpandedPlainwebConfig } from "./config";

// const log = getLogger("database");

// let database: BetterSQLite3Database<Record<string, unknown>> | undefined;

// class PlainwebLogWriter implements LogWriter {
//   write(message: string) {
//     log.debug(message);
//   }
// }
// const logger = new DefaultLogger({ writer: new PlainwebLogWriter() });

// /** Return the drizzle database instance given a plainweb config. */
// export function getDatabase<T extends Record<string, unknown>>(
//   config: Pick<ExpandedPlainwebConfig<T>, "database" | "nodeEnv">,
// ): BetterSQLite3Database<T> {
//   if (database) return database as BetterSQLite3Database<T>;
//   const dbUrl = config.database.dbUrl;
//   if (!dbUrl || dbUrl === "")
//     throw new Error("no database URL found, make sure DB_URL is set");
//   log.info(`db url ${dbUrl}`);
//   const connection = new BetterSqlite3Database(dbUrl);
//   for (const [key, value] of Object.entries(config.database.pragma)) {
//     connection.pragma(`${key} = ${value}`);
//   }

//   database = drizzle<T>(connection, {
//     schema: config.database.schema,
//     logger: logger,
//   });
//   return database as BetterSQLite3Database<T>;
// }

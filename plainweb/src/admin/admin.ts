import { config } from "admin/config";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import express from "express";
import { fileRouter } from "file-router";
import { databaseRoutes } from "./database/loaded-file-routes";

export async function adminRouter<T extends Record<string, unknown>>(opts: {
  database: BetterSQLite3Database<T>;
  path: string;
  verbose?: number;
}): Promise<express.Router> {
  const { database, path, verbose = 3 } = opts;
  config.adminBasePath = path;
  const router = express.Router();

  // make database available to all routes
  router.use((req, res, next) => {
    res.locals.database = database;
    next();
  });
  router.use(
    "/database",
    await fileRouter({ dir: "", loadedFileRoutes: databaseRoutes, verbose }),
  );
  // redirect / to /database
  router.use("/", (req, res) => {
    console.log(req.path);
    verbose && console.log("[admin] redirecting / to /database");
    res.redirect(`${path}/database`);
  });
  return router;
}

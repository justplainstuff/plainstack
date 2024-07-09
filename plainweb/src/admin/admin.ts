import express from "express";
import { GET as detailGET } from "./database/routes/[table]/index";
import {
  GET as editGet,
  POST as editPost,
} from "./database/routes/[table]/edit";
import { GET as rowGET } from "./database/routes/[table]/row";
import { GET as indexGET } from "./database/routes/index";
import { GET as sqlGET, POST as sqlPOST } from "./database/routes/sql";
import { fileRouter } from "..";
import { LoadedFileRoute } from "../file-router";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

const loadedFileRoutes = [
  { filePath: "/[table]/index.tsx", GET: detailGET },
  { filePath: "/[table]/edit.tsx", GET: editGet, POST: editPost },
  { filePath: "/[table]/row.tsx", GET: rowGET },
  { filePath: "/index.tsx", GET: indexGET },
  { filePath: "/sql.tsx", GET: sqlGET, POST: sqlPOST },
] satisfies LoadedFileRoute[];

export async function admin<T extends Record<string, unknown>>(
  database: BetterSQLite3Database<T>,
  { verbose = 3 } = {}
): Promise<express.Router> {
  const router = express.Router();
  return router.use(
    "/database",
    (req, res, next) => {
      res.locals.database = database;
      next();
    },
    await fileRouter({ dir: "", loadedFileRoutes, verbose })
  );
}

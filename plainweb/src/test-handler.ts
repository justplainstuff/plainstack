import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { Request } from "express";
import { createResponse } from "node-mocks-http";
import { type Handler, handleResponse } from "./handler";

export async function testHandler(
  handler: Handler,
  req: Request,
  {
    database,
  }: {
    database?: BetterSQLite3Database<{}>;
  },
) {
  const res = createResponse();
  res.locals.database = database;
  const userResponse = await handler({ req, res });
  await handleResponse(res, userResponse);
  return res;
}

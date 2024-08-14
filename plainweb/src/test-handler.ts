import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { Request } from "express";
import { createResponse } from "node-mocks-http";
import { type Handler, handleResponse } from "./handler";

/** Run a handler with a mock request, returning the response. Useful for testing. */
export async function testHandler(
  handler: Handler,
  req: Request,
  {
    database,
  }: {
    database?: BetterSQLite3Database<Record<string, unknown>>;
  },
) {
  const res = createResponse();
  res.locals.database = database;
  const userResponse = await handler({ req, res });
  await handleResponse(res, userResponse);
  return res;
}

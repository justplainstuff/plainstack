import { Request } from "express";
import { Handler, handleResponse } from "./handler";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { createResponse } from "node-mocks-http";

export async function testHandler(
  handler: Handler,
  req: Request,
  {
    database,
  }: {
    database?: BetterSQLite3Database<{}>;
  }
) {
  const res = createResponse();
  res.locals.database = database;
  const userResponse = await handler({ req, res });
  await handleResponse(res, userResponse);
  return res;
}

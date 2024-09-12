import type { Request } from "express";
import type { Kysely } from "kysely";
import { createResponse } from "node-mocks-http";
import type { GenericDatabase } from "./database";
import { type Handler, handleResponse } from "./handler";

/** Run a handler with a mock request, returning the response. Useful for testing. */
export async function testHandler(
  handler: Handler,
  req: Request,
  {
    database,
  }: {
    database?: GenericDatabase;
  },
) {
  const res = createResponse();
  res.locals.database = database;
  const userResponse = await handler({ req, res });
  await handleResponse(res, userResponse);
  return res;
}

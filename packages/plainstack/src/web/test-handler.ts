import type { Request } from "express";
import { createResponse } from "node-mocks-http";
import { loadAndGetConfig } from "../bootstrap/config";
import type { GenericDatabase } from "../database/database";
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
  await loadAndGetConfig();
  res.locals.database = database;
  const userResponse = await handler({ req, res });
  await handleResponse(res, userResponse);
  return res;
}

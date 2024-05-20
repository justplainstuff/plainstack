import { RouteHandler, json } from "plainweb";
import { db } from "~/app/database/database";

export const GET: RouteHandler = async ({ req, res }) => {
  await db.query.contacts.findFirst();
  return json(res, { status: "ok" });
};

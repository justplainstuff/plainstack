import { RouteHandler, json } from "plainweb";
import { db } from "~/app/database/database";

export const GET: RouteHandler = async ({ res }) => {
  await db.query.users.findFirst();
  return json(res, { status: "ok" });
};

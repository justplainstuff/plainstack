import { RouteHandler } from "plainweb";
import { db } from "~/app/database/database";

export const GET: RouteHandler = async () => {
  await db.query.contacts.findFirst();
  return { status: "ok" };
};

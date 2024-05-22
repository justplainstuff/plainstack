import { Handler } from "plainweb";
import { db } from "~/app/database/database";

export const GET: Handler = async () => {
  await db.query.contacts.findFirst();
  return { status: "ok" };
};

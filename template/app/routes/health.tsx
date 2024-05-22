import { Handler } from "plainweb";
import { db } from "~/app/database/database";

export const GET: Handler = async () => {
  await db.query.users.findFirst();
  return { status: "ok" };
};

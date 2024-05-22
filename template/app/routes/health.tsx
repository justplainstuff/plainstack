import { Handler, json } from "plainweb";
import { db } from "~/app/database/database";

export const GET: Handler = async () => {
  try {
    await db.query.users.findFirst();
    return { status: "ok" };
  } catch (e) {
    return json({ status: "degraded" }, { status: 500 });
  }
};

import { type Handler, json } from "plainweb";
import { database } from "~/app/config/database";

export const GET: Handler = async () => {
  try {
    await database.query.users.findFirst();
    return { status: "ok" };
  } catch (e) {
    return json({ status: "degraded" }, { status: 500 });
  }
};

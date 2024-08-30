import { database } from "app/config/database";
import { type Handler, json } from "plainstack";

export const GET: Handler = async () => {
  try {
    await database.query.users.findFirst();
    return { status: "ok" };
  } catch (e) {
    return json({ status: "degraded" }, { status: 500 });
  }
};

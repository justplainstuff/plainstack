import { database } from "app/config/database";
import type { Handler } from "plainweb";

export const GET: Handler = async () => {
  await database.query.contacts.findFirst();
  return { status: "ok" };
};

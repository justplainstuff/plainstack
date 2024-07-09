import type { Handler } from "plainweb";
import { database } from "~/app/config/database";

export const GET: Handler = async () => {
  await database.query.contacts.findFirst();
  return { status: "ok" };
};

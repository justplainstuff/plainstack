import database from "app/config/database";
import type { Handler } from "plainstack";

export const GET: Handler = async () => {
  await database.selectFrom("contacts").selectAll().executeTakeFirstOrThrow();
  return { status: "ok" };
};

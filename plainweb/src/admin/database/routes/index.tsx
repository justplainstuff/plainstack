import { config } from "admin/config";
import { sql } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { Handler } from "handler";
import { redirect } from "plain-response";

export const GET: Handler = async ({ req, res }) => {
  const db = res.locals.database as BetterSQLite3Database;

  const tables = await db
    .select({ name: sql<string>`name` })
    .from(sql`sqlite_master`)
    .where(sql`type=${"table"} AND name NOT LIKE ${"sqlite_%"}`);

  if (!tables[0]) {
    return <div>No tables found</div>;
  }

  return redirect(`${config.adminBasePath}/database/${tables[0].name}`);
};

import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { Handler } from "../../../handler";
import Layout from "../../layout";
import { sql } from "drizzle-orm";

export const GET: Handler = async ({ req, res }) => {
  const db = res.locals.database as BetterSQLite3Database;

  const tables = await db
    .select({ name: sql<string>`name` })
    .from(sql`sqlite_master`)
    .where(sql`type=${"table"} AND name NOT LIKE ${"sqlite_%"}`);

  return (
    <Layout>
      <h1>Available Tables</h1>
      <ul>
        {tables.map((table) => (
          <li>
            <a safe href={`/admin/database/${table.name}`}>
              {table.name}
            </a>
          </li>
        ))}
      </ul>
    </Layout>
  );
};

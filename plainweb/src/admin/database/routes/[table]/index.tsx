import { sql } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { Handler } from "../../../../handler";
import type { ColumnInfo } from "../../../column";
import Layout from "../../../layout";
import { TableRow } from "./components/table-row";

export const GET: Handler = async ({ req, res }) => {
  const tableName = req.params.table as string;
  const db = res.locals.database as BetterSQLite3Database<
    Record<string, unknown>
  >;

  const columns = db.all<ColumnInfo>(
    sql`SELECT * from pragma_table_info(${tableName}) LIMIT 100`,
  );

  const rows = db.all<Record<string, unknown>>(
    sql`SELECT * FROM ${sql.identifier(tableName)} LIMIT 100`,
  );

  return (
    <Layout>
      <h1 safe>{tableName}</h1>
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th safe>{column.name}</th>
            ))}
          </tr>
        </thead>
        <tbody hx-target="closest tr" hx-swap="outerHTML">
          {rows.map((row) => (
            <TableRow tableName={tableName} columns={columns} row={row} />
          ))}
        </tbody>
      </table>
    </Layout>
  );
};

import { Handler } from "../../../../handler";
import { ColumnInfo } from "../../../column";
import Layout from "../../../layout";
import { TableRow } from "./components/table-row";
import { sql } from "drizzle-orm";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

export const GET: Handler = async ({ req, res }) => {
  const tableName = req.params.table as string;
  const db = res.locals.database as BetterSQLite3Database<{}>;

  const columns = db.all<ColumnInfo>(
    sql`SELECT * from pragma_table_info(${tableName}) LIMIT 100`
  );

  const rows = db.all<Record<string, any>>(
    sql`SELECT * FROM ${sql.identifier(tableName)} LIMIT 100`
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

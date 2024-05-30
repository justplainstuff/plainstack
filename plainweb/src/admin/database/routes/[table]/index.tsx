import { Handler } from "../../../../handler";
import { ColumnInfo } from "../../../column";
import Layout from "../../../layout";
import { Database } from "better-sqlite3";
import { TableRow } from "./components/table-row";

export const GET: Handler = async ({ req, res }) => {
  const tableName = req.params.table as string;
  const connection = res.locals.connection as Database;

  const columns = connection
    .prepare<[], ColumnInfo>(`PRAGMA table_info('${tableName}')`)
    .all();

  const rows = connection
    .prepare<[], Record<string, any>>(`SELECT * FROM '${tableName}' LIMIT 100`)
    .all();

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

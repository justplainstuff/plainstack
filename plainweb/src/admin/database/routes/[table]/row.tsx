import { Database } from "better-sqlite3";
import { ColumnInfo, columnType, renderValue } from "../../../column";
import { verbose } from "../../../config";
import { Handler } from "../../../../handler";
import { TableRow } from "./components/table-row";

export const GET: Handler = async ({ req, res }) => {
  const tableName = req.params.table as string;
  const connection = res.locals.connection as Database;
  const row = JSON.parse(decodeURIComponent(req.query.row as string));

  const columns = connection
    .prepare<[], ColumnInfo>(`PRAGMA table_info('${tableName}')`)
    .all();

  verbose > 1 && console.log("[admin] [database]", "fetching row", row);

  const whereClause = Object.entries(row)
    .map(([column]) => `${column} = ?`)
    .join(" AND ");

  const found = connection
    .prepare<
      unknown[],
      Record<string, any>
    >(`SELECT * FROM '${tableName}' WHERE ${whereClause} LIMIT 1`)
    .all(...Object.values(row));

  if (found.length === 0) {
    throw new Error(`Row not found for ${whereClause}`);
  }

  return <TableRow tableName={tableName} columns={columns} row={row} />;
};

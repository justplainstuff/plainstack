import { type Column, columnType, renderValue } from "admin/column";
import { config } from "admin/config";
import { TableRow } from "admin/database/routes/[table]/components/table-row";
import { sql } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { Handler } from "handler";

export const POST: Handler = async ({ req, res }) => {
  const tableName = req.params.table as string;
  const db = res.locals.database as BetterSQLite3Database<
    Record<string, unknown>
  >;
  const { __row, ...updatedData } = req.body;

  const columns = db.all<Column>(
    sql`SELECT * FROM pragma_table_info(${tableName})`,
  );

  const newData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(updatedData)) {
    const column = columns.find((column) => column.name === key);
    if (!column) {
      throw new Error(`Column ${key} not found in table ${tableName}`);
    }
    newData[key] = value;
    if (column.type === "INTEGER") {
      newData[key] = Number.parseInt(value as string);
    } else if (column.type === "REAL") {
      newData[key] = Number.parseFloat(value as string);
    }
  }

  config.verbose >= 1 ||
    console.log("[admin] [database]", "saving row", newData);
  const oldRow = JSON.parse(__row as string);

  const setClause = Object.entries(newData)
    .map(([column, value]) => sql`${sql.identifier(column)} = ${value}`)
    .reduce((acc, curr) => sql`${acc}, ${curr}`);

  const whereClause = Object.entries(oldRow)
    .map(([column, value]) => sql`${sql.identifier(column)} = ${value}`)
    .reduce((acc, curr) => sql`${acc} AND ${curr}`);

  db.run(
    sql`UPDATE ${sql.identifier(tableName)} SET ${setClause} WHERE ${whereClause}`,
  );

  config.verbose >= 1 || console.log("[admin] [database]", "row saved");

  return <TableRow tableName={tableName} columns={columns} row={newData} />;
};

function estimateNrOfRows(value: string) {
  return String(Math.max(Math.round(String(value).length / 30), 1));
}

export const GET: Handler = async ({ req, res }) => {
  const tableName = req.params.table as string;
  const rowData = JSON.parse(decodeURIComponent(req.query.row as string));
  const db = res.locals.database as BetterSQLite3Database;

  const columns = db.all<Column>(
    sql`SELECT * FROM pragma_table_info(${tableName})`,
  );

  return (
    <tr>
      <td>
        <button
          class="btn btn-xs btn-primary"
          type="reset"
          hx-post={`${config.adminBasePath}/database/${tableName}/edit`}
          hx-include="closest tr"
        >
          Save
        </button>
        <input type="hidden" name="__row" value={JSON.stringify(rowData)} />
      </td>
      {columns.map((column) => {
        const tsType = columnType(column.type);
        const safeValue = rowData[column.name];
        console.log(safeValue, estimateNrOfRows(safeValue));
        return (
          <td
            data-type={tsType}
            class="border border-neutral px-2 py-1 max-w-32 relative"
          >
            <textarea
              class="top-0 left-0 w-full py-1 pl-2 m-0 bg-base-200 absolute"
              rows={estimateNrOfRows(safeValue)}
              name={column.name}
            >
              {safeValue}
            </textarea>
          </td>
        );
      })}
      <td>
        <button
          class="btn btn-xs mr-1"
          type="submit"
          hx-get={`${config.adminBasePath}/database/${tableName}/row?row=${encodeURIComponent(JSON.stringify(rowData))}`}
        >
          Cancel
        </button>
      </td>
    </tr>
  );
};

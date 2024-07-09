import { sql } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { Handler } from "../../../../handler";
import { type ColumnInfo, columnType, renderValue } from "../../../column";
import { verbose } from "../../../config";

export const POST: Handler = async ({ req, res }) => {
  const tableName = req.params.table as string;
  const db = res.locals.database as BetterSQLite3Database<
    Record<string, unknown>
  >;
  const { __row, ...updatedData } = req.body;

  const columns = db.all<ColumnInfo>(
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

  verbose >= 1 || console.log("[admin] [database]", "saving row", newData);
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

  verbose >= 1 || console.log("[admin] [database]", "row saved");

  return (
    <tr>
      {columns.map((column) => {
        const tsType = columnType(column.type);
        const value = newData?.[column.name];
        const formattedValue = renderValue(value, tsType);
        return (
          <td safe data-type={tsType}>
            {formattedValue}
          </td>
        );
      })}
      <td>
        <button
          type="submit"
          class="btn btn-danger"
          hx-get={`/admin/database/${tableName}/edit?row=${encodeURIComponent(JSON.stringify(oldRow))}`}
        >
          Edit
        </button>
      </td>
    </tr>
  );
};

export const GET: Handler = async ({ req, res }) => {
  const tableName = req.params.table as string;
  const rowData = JSON.parse(decodeURIComponent(req.query.row as string));
  const db = res.locals.database as BetterSQLite3Database;

  const columns = db.all<ColumnInfo>(
    sql`SELECT * FROM pragma_table_info(${tableName})`,
  );

  return (
    <tr>
      {columns.map((column) => {
        const tsType = columnType(column.type);
        const value = rowData[column.name];
        return (
          <td>
            <input name={column.name} value={value} />
          </td>
        );
      })}
      <td>
        <button
          type="submit"
          hx-get={`/admin/database/${tableName}/row?row=${encodeURIComponent(JSON.stringify(rowData))}`}
        >
          Cancel
        </button>
        <button
          type="submit"
          hx-post={`/admin/database/${tableName}/edit`}
          hx-include="closest tr"
        >
          Save
        </button>
        <input type="hidden" name="__row" value={JSON.stringify(rowData)} />
      </td>
    </tr>
  );
};

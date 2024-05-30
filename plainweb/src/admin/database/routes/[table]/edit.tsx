import { Handler } from "../../../../handler";
import { ColumnInfo, columnType, renderValue } from "../../../column";
import { Database } from "better-sqlite3";
import { verbose } from "../../../config";

export const POST: Handler = async ({ req, res }) => {
  const tableName = req.params.table as string;
  const connection = res.locals.connection as Database;
  const { __row, ...updatedData } = req.body;
  const columns = connection
    .prepare<[], ColumnInfo>(`PRAGMA table_info('${tableName}')`)
    .all();

  const newData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(updatedData)) {
    const column = columns.find((column) => column.name === key);
    if (!column) {
      throw new Error(`Column ${key} not found in table ${tableName}`);
    }
    newData[key] = value;
    if (column.type === "INTEGER") {
      newData[key] = parseInt(value as string);
    } else if (column.type === "REAL") {
      newData[key] = parseFloat(value as string);
    }
  }

  verbose >= 1 || console.log("[admin] [database]", "saving row", newData);

  const oldRow = JSON.parse(__row as string);

  const setClause = Object.entries(newData)
    .map(([column]) => `${column} = ?`)
    .join(", ");

  const whereClause = Object.entries(oldRow)
    .map(([column]) => `${column} = ?`)
    .join(" AND ");

  const stmt = connection.prepare(
    `UPDATE '${tableName}' SET ${setClause} WHERE ${whereClause}`
  );

  stmt.run(...Object.values(newData), ...Object.values(oldRow));

  verbose >= 1 || console.log("[admin] [database]", "row saved");

  return (
    <tr>
      {columns.map((column) => {
        const tsType = columnType(column.type);
        const value = newData![column.name];
        const formattedValue = renderValue(value, tsType);
        return (
          <td safe data-type={tsType}>
            {formattedValue}
          </td>
        );
      })}
      <td>
        <button
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
  const connection = res.locals.connection as Database;
  const columns = connection
    .prepare<[], ColumnInfo>(`PRAGMA table_info('${tableName}')`)
    .all();

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
          hx-get={`/admin/database/${tableName}/row?row=${encodeURIComponent(JSON.stringify(rowData))}`}
        >
          Cancel
        </button>
        <button
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

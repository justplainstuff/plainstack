import { type ColumnInfo, columnType, renderValue } from "../../../../column";

interface TableRowProps {
  tableName: string;
  columns: ColumnInfo[];
  row: Record<string, unknown>;
}

export function TableRow({ tableName, columns, row }: TableRowProps) {
  return (
    <tr>
      {columns.map((column) => {
        const tsType = columnType(column.type);
        const value = row[column.name];
        const formattedValue = renderValue(value, tsType);
        return (
          <td safe data-type={tsType}>
            {formattedValue}
          </td>
        );
      })}{" "}
      <td>
        <button
          type="submit"
          hx-target="closest tr"
          hx-swap="outerHTML"
          hx-get={`/admin/database/${tableName}/edit?row=${encodeURIComponent(JSON.stringify(row))}`}
          hx-trigger="click from:closest tr"
        >
          Edit
        </button>
      </td>
    </tr>
  );
}

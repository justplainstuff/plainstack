import { type ColumnInfo, columnType, renderValue } from "../../../../column";

export interface TableRowProps {
  tableName: string;
  columns: ColumnInfo[];
  row: Record<string, any>;
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

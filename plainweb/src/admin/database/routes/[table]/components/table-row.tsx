import { type ColumnInfo, columnType, renderValue } from "admin/column";
import { PencilIcon } from "admin/components";

interface TableRowProps {
  tableName: string;
  columns: ColumnInfo[];
  row: Record<string, unknown>;
}

export function TableRow({ tableName, columns, row }: TableRowProps) {
  return (
    <tr class="w-full">
      {columns.map((column) => {
        const tsType = columnType(column.type);
        const value = row[column.name];
        const formattedValue = renderValue(value, tsType);
        return (
          <td
            safe
            data-type={tsType}
            class="border border-gray-300 px-2 py-1 max-w-20"
          >
            {formattedValue}
          </td>
        );
      })}{" "}
      <td class="px-1 py-0 text-sm">
        <button
          class="btn btn-xs"
          type="submit"
          hx-target="closest tr"
          hx-swap="outerHTML"
          hx-get={`/admin/database/${tableName}/edit?row=${encodeURIComponent(JSON.stringify(row))}`}
          hx-trigger="click from:closest tr"
        >
          <PencilIcon />
        </button>
      </td>
    </tr>
  );
}

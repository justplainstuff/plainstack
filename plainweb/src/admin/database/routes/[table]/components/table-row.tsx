import { type Column, columnType, renderValue } from "admin/column";
import { PencilIcon } from "admin/components";

interface TableRowProps {
  tableName: string;
  columns: Column[];
  row: Record<string, unknown>;
  editing?: boolean;
}

export function TableRow({ editing, tableName, columns, row }: TableRowProps) {
  return (
    <tr>
      <td class="px-1 py-0 text-sm invisible">
        <button
          class="btn btn-xs mr-2"
          type="submit"
          hx-target="closest tr"
          hx-swap="outerHTML"
          hx-get={`/admin/database/${tableName}/edit?row=${encodeURIComponent(JSON.stringify(row))}`}
          hx-trigger="click from:closest tr"
        >
          <PencilIcon />
        </button>
      </td>
      {columns.map((column) => {
        const tsType = columnType(column.type);
        const value = row[column.name];
        const formattedValue = renderValue(value, tsType);
        return (
          <td
            safe
            data-type={tsType}
            class="border border-neutral px-2 py-1 max-w-64 min-w-32 truncate"
          >
            {formattedValue}
          </td>
        );
      })}{" "}
    </tr>
  );
}

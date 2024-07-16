import type { Column } from "admin/column";
import { config } from "admin/config";
import { AdminLayout, type NavigationItem } from "admin/layout";
import { sql } from "drizzle-orm";
import { count } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { Handler } from "handler";
import { TableRow } from "./components/table-row";

export const GET: Handler = async ({ req, res }) => {
  const tableName = req.params.table as string;
  const db = res.locals.database as BetterSQLite3Database<
    Record<string, unknown>
  >;

  const columns = db.all<Column>(
    sql`SELECT * from pragma_table_info(${tableName}) LIMIT 100`,
  );

  const rows = db.all<Record<string, unknown>>(
    sql`SELECT * FROM ${sql.identifier(tableName)} LIMIT 100`,
  );

  const tables = await db
    .select({ name: sql<string>`name` })
    .from(sql`sqlite_master`)
    .where(sql`type=${"table"} AND name NOT LIKE ${"sqlite_%"}`);

  const tableCounts: { tableName: string; count: number }[] = [];
  for (const table of tables) {
    const [rowCount] = db.all<{ count: number }>(
      sql`SELECT COUNT(*) as count FROM ${sql.identifier(table.name)}`,
    );

    tableCounts.push({ tableName: table.name, count: rowCount?.count ?? 0 });
  }

  const subNavigationItems: NavigationItem[] = tableCounts.map(
    ({ tableName, count }) => ({
      href: `${config.adminBasePath}/database/${tableName}`,
      label: (
        <span class="flex justify-between items-center w-full">
          <span safe>{tableName}</span>
          <span class="ml-2 text-xs text-neutral-content">{count}</span>
        </span>
      ),
    }),
  );

  return (
    <AdminLayout
      subNavigation={subNavigationItems}
      active="database"
      path={req.path}
    >
      <div class="overflow-x-auto w-full whitespace-nowrap text-sm max-w-full">
        <table class="font-mono">
          <thead>
            <tr>
              <th />
              {columns.map((column) => (
                <th
                  safe
                  class="border border-neutral px-2 py-1 text-left max-w-64 min-w-32 truncate"
                >
                  {column.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody hx-target="closest tr" hx-swap="outerHTML">
            {rows.map((row) => (
              <TableRow
                tableName={tableName}
                columns={columns}
                row={row}
                editing={false}
              />
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

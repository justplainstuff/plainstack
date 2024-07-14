import type { ColumnInfo } from "admin/column";
import { config } from "admin/config";
import { AdminLayout, type NavigationItem } from "admin/layout";
import { sql } from "drizzle-orm";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { Handler } from "handler";
import { TableRow } from "./components/table-row";

export const GET: Handler = async ({ req, res }) => {
  const tableName = req.params.table as string;
  const db = res.locals.database as BetterSQLite3Database<
    Record<string, unknown>
  >;

  const columns = db.all<ColumnInfo>(
    sql`SELECT * from pragma_table_info(${tableName}) LIMIT 100`,
  );

  const rows = db.all<Record<string, unknown>>(
    sql`SELECT * FROM ${sql.identifier(tableName)} LIMIT 100`,
  );

  const tables = await db
    .select({ name: sql<string>`name` })
    .from(sql`sqlite_master`)
    .where(sql`type=${"table"} AND name NOT LIKE ${"sqlite_%"}`);

  const suNavigatinoItems: NavigationItem[] = tables.map((table) => ({
    href: `${config.adminBasePath}/database/${table.name}`,
    label: table.name,
  }));

  return (
    <AdminLayout
      subNavigation={suNavigatinoItems}
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
              <TableRow tableName={tableName} columns={columns} row={row} />
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

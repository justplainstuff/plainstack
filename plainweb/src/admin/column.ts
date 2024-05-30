export interface ColumnInfo {
  cid: number;
  name: string;
  type: "INTEGER" | "REAL" | "TEXT" | "BLOB" | "TIMESTAMP";
  notnull: number;
  dflt_value: string | null;
  pk: number;
}

export function columnType(sqliteType: ColumnInfo["type"]): string {
  switch (sqliteType) {
    case "INTEGER":
      return "number";
    case "REAL":
      return "number";
    case "TEXT":
      return "string";
    case "BLOB":
      return "Buffer";
    case "TIMESTAMP":
      return "Date";
    default:
      return "any";
  }
}

export function renderValue(value: any, tsType: string): string {
  if (value === null) {
    return "NULL";
  }

  switch (tsType) {
    case "number":
      return value.toString();
    case "string":
      return value;
    case "Buffer":
      return value.toString("hex");
    case "Date":
      return new Date(value).toISOString();
    default:
      return value.toString();
  }
}

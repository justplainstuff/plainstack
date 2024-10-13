import { createId } from "@paralleldrive/cuid2";
import { camelCase, snakeCase } from "change-case";
import {
  type Insertable,
  type Kysely,
  type SelectQueryBuilder,
  type Selectable,
  type TableMetadata,
  sql,
} from "kysely";
// @ts-ignore
import type { ExtractTableAlias } from "kysely/dist/esm/parser/table-parser";
import { z } from "zod";

type PickNullable<T> = {
  [P in keyof T as null extends T[P] ? P : never]: T[P];
};

type PickNotNullable<T> = {
  [P in keyof T as null extends T[P] ? never : P]: T[P];
};

type OptionalNullable<T> = {
  [K in keyof PickNullable<T>]?: T[K];
} & {
  [K in keyof PickNotNullable<T>]: T[K];
};

type InsertableEntity<Entity> = OptionalNullable<
  Omit<Insertable<Entity>, "id" | "createdAt" | "updatedAt">
> & {
  id?: string;
  createdAt?: number;
  updatedAt?: number;
};

function hasTimestamps(
  name: string,
  tables: TableMetadata[],
): [boolean, boolean] {
  const tableName = snakeCase(name);
  const table = tables.find((t) => t.name === tableName);

  if (!table) {
    throw new Error(`Table "${tableName}" not found`);
  }

  const hasCreatedAt = table.columns.some((c) => c.name === "created_at");
  const hasUpdatedAt = table.columns.some((c) => c.name === "updated_at");

  return [hasCreatedAt, hasUpdatedAt];
}

function zodFromDbSchema<DB, EntityName extends keyof DB & string>(
  name: EntityName,
  tables: TableMetadata[],
): z.ZodType<DB[EntityName]> {
  const tableName = snakeCase(name);
  const table = tables.find((t) => t.name === tableName);

  if (!table) {
    throw new Error(`Table "${tableName}" not found`);
  }

  const schema: Record<string, z.ZodTypeAny> = {};

  for (const column of table.columns) {
    const fieldName = camelCase(column.name);
    let zodType: z.ZodTypeAny;

    switch (column.dataType.toLowerCase()) {
      // String types
      case "varchar":
      case "char":
      case "text":
      case "tinytext":
      case "mediumtext":
      case "longtext":
        zodType = z.string();
        break;

      // Number types
      case "int":
      case "integer":
      case "tinyint":
      case "smallint":
      case "mediumint":
      case "bigint":
      case "int2":
      case "int4":
      case "int8":
        zodType = z.number().int();
        break;

      case "decimal":
      case "numeric":
      case "float":
      case "double":
      case "real":
        zodType = z.number();
        break;

      // Boolean types
      case "boolean":
      case "bool":
        zodType = z.boolean();
        break;

      // Date types
      case "date":
      case "time":
      case "timestamp":
      case "datetime":
        zodType = z.date();
        break;

      // JSON types
      case "json":
      case "jsonb":
        zodType = z.unknown();
        break;

      // UUID type
      case "uuid":
        zodType = z.string().uuid();
        break;

      default:
        zodType = z.unknown();
    }

    if (column.isNullable || fieldName === "createdAt" || fieldName === "id") {
      zodType = zodType.optional();
    }

    schema[fieldName] = zodType;
  }

  return z.object(schema) as unknown as z.ZodType<DB[EntityName]>;
}

export class Entity<DB, EntityName extends keyof DB & string> {
  zod!: z.ZodType<DB[EntityName]>;
  createdAt = false;
  updatedAt = false;
  constructor(
    private db: Kysely<DB>,
    private name: EntityName,
    tables: TableMetadata[],
    _zod?: z.ZodType<DB[EntityName]>,
    private id: () => string = () => createId(),
    private timestamp: () => number = () => Date.now(),
  ) {
    if (_zod) this.zod = _zod;
    else {
      this.zod = zodFromDbSchema(this.name, tables);
    }
    [this.createdAt, this.updatedAt] = hasTimestamps(this.name, tables);
  }

  // biome-ignore lint/complexity/noBannedTypes: <explanation>
  query(): SelectQueryBuilder<DB, ExtractTableAlias<DB, EntityName>, {}> {
    return this.db.selectFrom(this.name);
  }

  async createMany(
    data: Array<InsertableEntity<DB[EntityName]>>,
  ): Promise<Selectable<DB[EntityName]>[]> {
    const results: Selectable<DB[EntityName]>[] = [];
    for (const item of data) {
      const inserted = await this.db
        .insertInto(this.name)
        .values({
          id: item.id ?? this.id?.(),
          created_at: this.createdAt
            ? (item.createdAt ?? this.timestamp?.())
            : undefined,
          updated_at: this.updatedAt
            ? (item.updatedAt ?? this.timestamp?.())
            : undefined,
          ...item,
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        } as any)
        .returningAll()
        .executeTakeFirstOrThrow();
      results.push(inserted as unknown as Selectable<DB[EntityName]>);
    }
    return results;
  }

  async create(
    data: InsertableEntity<DB[EntityName]>,
  ): Promise<Selectable<DB[EntityName]>> {
    const inserted = await this.db
      .insertInto(this.name)
      .values({
        id: data.id ?? this.id?.(),
        created_at: this.createdAt
          ? (data.createdAt ?? this.timestamp?.())
          : undefined,
        updated_at: this.updatedAt
          ? (data.updatedAt ?? this.timestamp?.())
          : undefined,
        ...data,
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      } as any)
      .returningAll()
      .executeTakeFirstOrThrow();
    return inserted as unknown as Selectable<DB[EntityName]>;
  }

  async all<K extends keyof DB[EntityName]>(
    filter?: Partial<Pick<DB[EntityName], K>>,
    pagination?: {
      limit?: number;
      offset?: number;
    },
  ): Promise<Selectable<DB[EntityName]>[]> {
    let query = this.db.selectFrom(this.name).selectAll();

    if (filter) {
      for (const [key, value] of Object.entries(filter)) {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        query = query.where(key as any, "=", value);
      }
    }

    if (pagination) {
      if (pagination.limit) {
        query = query.limit(pagination.limit);
      }
      if (pagination.offset) {
        query = query.offset(pagination.offset);
      }
    }

    return (await query.execute()) as unknown as Selectable<DB[EntityName]>[];
  }

  async get<K extends keyof DB[EntityName]>(
    filter?: Partial<Pick<DB[EntityName], K>>,
  ): Promise<Selectable<DB[EntityName]> | undefined> {
    const result = await this.all(filter);
    if (result.length === 0) return undefined;
    return result[0];
  }

  async update(
    data: OptionalNullable<
      Omit<Insertable<DB[EntityName]>, "createdAt" | "updatedAt">
    > & {
      id: string;
      updatedAt?: number;
    },
  ): Promise<DB[EntityName]> {
    const updated = await this.db
      .updateTable(this.name)
      .set({
        updatedAt: this.updatedAt ? this.timestamp?.() : undefined,
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        ...(data as any),
        id: undefined, // don't overwrite id
      })
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      .where("id" as any, "=", data.id)
      .returningAll()
      .executeTakeFirstOrThrow();
    return updated as unknown as DB[EntityName];
  }

  async updateMany(
    data: Array<
      OptionalNullable<
        Omit<Insertable<DB[EntityName]>, "createdAt" | "updatedAt">
      > & {
        id: string;
        updatedAt?: number;
      }
    >,
  ): Promise<DB[EntityName][]> {
    const results: DB[EntityName][] = [];
    for (const item of data) {
      const updated = await this.db
        .updateTable(this.name)
        .set({
          updatedAt: this.updatedAt ? this.timestamp?.() : undefined,
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          ...(item as any),
          id: undefined, // don't overwrite id
        })
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        .where("id" as any, "=", item.id)
        .returningAll()
        .executeTakeFirstOrThrow();
      results.push(updated as unknown as DB[EntityName]);
    }
    return results;
  }

  async delete<K extends keyof DB[EntityName]>(
    filter: Partial<Pick<DB[EntityName], K>>,
  ) {
    let query = this.db.deleteFrom(this.name);

    for (const [key, value] of Object.entries(filter)) {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      query = query.where(key as any, "=", value);
    }
    return await query.execute();
  }
}

type EntityStore<DB> = {
  <T extends keyof DB & string>(key: T): Entity<DB, T>;
  db: Kysely<DB>;
  opts?: EntityStoreOptions<DB>;
};

type EntityStoreOptions<DB> = {
  [K in keyof DB]: {
    id?: () => string;
    timestamp?: () => number;
    zod?: z.ZodType<DB[K]>;
  };
};

export async function store<DB>(
  db: Kysely<DB>,
  opts?: EntityStoreOptions<DB>,
): Promise<EntityStore<DB>> {
  const tables = await db.introspection.getTables();
  const entityStore = <K extends keyof DB & string>(key: K): Entity<DB, K> => {
    const options = opts?.[key];
    return new Entity<DB, K>(
      db,
      key,
      tables,
      options?.zod,
      options?.id,
      options?.timestamp,
    );
  };

  (entityStore as EntityStore<DB>).db = db;
  (entityStore as EntityStore<DB>).opts = opts;

  return entityStore as EntityStore<DB>;
}

export async function rollback<DB, T>(
  entities: EntityStore<DB>,
  fn: (trx: EntityStore<DB>) => Promise<T>,
): Promise<T> {
  const err: Error | null = null;
  let result: T | undefined;

  try {
    await sql.raw("BEGIN").execute(entities.db);
    result = await fn(entities);
  } finally {
    await sql.raw("ROLLBACK").execute(entities.db);
  }

  if (err) throw err;
  return result;
}

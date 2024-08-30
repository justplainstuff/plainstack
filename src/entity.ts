import { createId } from "@paralleldrive/cuid2";
import { camelCase, snakeCase } from "change-case";
import { type Kysely, type TableMetadata, sql } from "kysely";
import { z } from "zod";

class Entity<DB, EntityName extends keyof DB & string> {
  zod!: z.ZodType<DB[EntityName]>;
  constructor(
    private db: Kysely<DB>,
    private name: EntityName,
    tables: TableMetadata[],
    _zod?: z.ZodType<DB[EntityName]>,
    private id: () => string = () => createId(),
    private createdAt: () => number = () => Date.now(),
  ) {
    if (_zod) this.zod = _zod;
    else this.initZodFromTable(tables);
  }

  async create(
    data: Partial<Omit<DB[EntityName], "id" | "createdAt">>,
  ): Promise<DB[EntityName]> {
    const inserted = await this.db
      .insertInto(this.name)
      .values({
        id: this.id?.(),
        created_at: this.createdAt?.(),
        ...data,
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      } as any)
      .returningAll()
      .executeTakeFirstOrThrow();
    return inserted as unknown as DB[EntityName];
  }

  async all<K extends keyof DB[EntityName]>(
    options?: Partial<Pick<DB[EntityName], K>>,
    pagination?: {
      limit?: number;
      offset?: number;
    },
  ): Promise<DB[EntityName][]> {
    let query = this.db.selectFrom(this.name).selectAll();

    if (options) {
      for (const [key, value] of Object.entries(options)) {
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

    return (await query.execute()) as DB[EntityName][];
  }

  async get(id: string): Promise<DB[EntityName] | undefined> {
    return (await this.db
      .selectFrom(this.name)
      .selectAll()
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      .where("id" as any, "=", id)
      .executeTakeFirst()) as DB[EntityName] | undefined;
  }

  async update(
    id: string,
    data: Partial<DB[EntityName]>,
  ): Promise<DB[EntityName]> {
    const updated = await this.db
      .updateTable(this.name)
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      .set(data as any)
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      .where("id" as any, "=", id)
      .returningAll()
      .executeTakeFirstOrThrow();
    return updated as unknown as DB[EntityName];
  }

  async delete(id: string) {
    return await this.db
      .deleteFrom(this.name)
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      .where("id" as any, "=", id)
      .execute();
  }

  private initZodFromTable(tables: TableMetadata[]): void {
    const tableName = snakeCase(this.name);
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

      if (
        column.isNullable ||
        fieldName === "createdAt" ||
        fieldName === "id"
      ) {
        zodType = zodType.optional();
      }

      schema[fieldName] = zodType;
    }

    this.zod = z.object(schema) as unknown as z.ZodType<DB[EntityName]>;
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
    createdAt?: () => number;
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
      options?.createdAt,
    );
  };

  (entityStore as EntityStore<DB>).db = db;
  (entityStore as EntityStore<DB>).opts = opts;

  return entityStore as EntityStore<DB>;
}

export async function rollback<DB extends Record<string, { id: string }>, T>(
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

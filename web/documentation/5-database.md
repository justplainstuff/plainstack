# SQL Database

plainweb uses SQLite as its database engine and leverages [Drizzle](https://orm.drizzle.team/docs/overview) for type-safe queries and migrations. This combination provides a powerful and developer-friendly database solution.

## Setup

### Connection

First, set up the database connection:

```typescript
// app/config/database.ts
import BetterSqlite3Database from "better-sqlite3";
import { env } from "./env";

export const connection: BetterSqlite3Database.Database =
  new BetterSqlite3Database(env.NODE_ENV === "test" ? ":memory:" : env.DB_URL);

// Enable Write-Ahead Logging for better performance
connection.pragma("journal_mode = WAL");
```

### Drizzle Setup

Next, configure drizzle:

```typescript
// app/config/database.ts
import * as schema from "./schema";
import { drizzle } from "drizzle-orm/better-sqlite3";

export const database = drizzle<typeof schema>(connection, { schema });
export type Database = typeof database;
```

## Schema Definition

Define your database schema using Drizzle's type-safe table definitions:

```typescript
// app/config/schema.ts
import { text, integer, sqliteTable, int } from "drizzle-orm/sqlite-core";

export const contacts = sqliteTable("contacts", {
  email: text("email").primaryKey(),
  created: int("created").notNull(),
  doubleOptInSent: integer("double_opt_in_sent"),
  doubleOptInConfirmed: integer("double_opt_in_confirmed"),
  doubleOptInToken: text("double_opt_in_token").notNull(),
});

export type Contact = typeof contacts.$inferSelect;
```

This approach provides type safety for your database operations and makes it easy to maintain your schema.

## Migrations

Drizzle provides a straightforward way to manage database migrations:

1. Generate new migration files:

   ```bash
   pnpm db:gen
   ```

2. Apply pending migrations:
   ```bash
   pnpm db:apply
   ```

Make sure to run these commands whenever you make changes to your schema.

## Queries

Here's an example of how to perform a query using drizzle:

```typescript
import { eq } from "drizzle-orm";
import { database } from "~/app/config/database";
import { contacts } from "~/app/config/schema";

async function getContact(email: string) {
  const contact = await database.query.contacts.findFirst({
    where: eq(contacts.email, email),
  });
  return contact;
}
```

This query is type-safe, and your IDE will provide autocomplete suggestions for table and column names.

## Inserting

Here's how you can insert data into the database:

```typescript
import { database } from "~/app/config/database";
import { contacts } from "~/app/config/schema";

async function createContact(email: string) {
  await database.insert(contacts).values({
    email,
    created: Date.now(),
    doubleOptInToken: generateToken(), // Implement this function
  });
}
```

## Updating

Updating data is similarly straightforward:

```typescript
import { eq } from "drizzle-orm";
import { database } from "~/app/config/database";
import { contacts } from "~/app/config/schema";

async function confirmDoubleOptIn(email: string) {
  await database
    .update(contacts)
    .set({ doubleOptInConfirmed: Date.now() })
    .where(eq(contacts.email, email));
}
```

## Drizzle Studio

Drizzle provides a GUI for managing your database. You can start it with:

```bash
pnpm db:studio
```

This tool is helpful for inspecting your database, running ad-hoc queries, and managing your data during development.

## Docs

For more detailed information about drizzle and its features, refer to the [official Drizzle documentation](https://orm.drizzle.team/docs/overview). It provides comprehensive guides on advanced querying, relationships, migrations, and more.

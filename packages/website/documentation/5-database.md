# SQL Database

plainstack uses SQLite as its database engine and leverages [Kysely](https://kysely.dev/) for type-safe queries and migrations. This combination provides a powerful and developer-friendly database solution.

## Setup

### Connection

First, set up the database connection:

```typescript
// app/config/database.ts
import env from "app/config/env";
import SQLite from "better-sqlite3";
import { CamelCasePlugin, Kysely, SqliteDialect } from "kysely";
import { defineDatabase, getLogger } from "plainstack";
import type { DB } from "./schema";

export type Database = Kysely<DB>;

export default defineDatabase(
  new Kysely<DB>({
    dialect: new SqliteDialect({
      database: new SQLite(env.DB_URL),
    }),
    plugins: [new CamelCasePlugin()],
    log: (event: unknown) => {
      const log = getLogger("database");
      log.debug(event);
    },
  })
);
```

## Schema Definition

The database schema is automatically generated based on your migrations and stored in `app/config/schema.ts`. Here's an example of what it might look like:

```typescript
// app/config/schema.ts
import { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface ContactsTable {
  id: string;
  email: string;
  createdAt: number;
  doubleOptInSent: number | null;
  doubleOptInConfirmed: number | null;
  doubleOptInToken: string;
}

export interface DB {
  contacts: ContactsTable;
}
```

This schema provides type safety for your database operations and makes it easy to maintain your schema.

## Migrations

plainstack provides a straightforward way to manage database migrations:

1. Generate a new migration file:

   ```bash
   plainweb migrate <migration-name>
   ```

2. Apply pending migrations:

   ```bash
   plainweb migrate
   ```

Make sure to run these commands whenever you make changes to your schema. Applying migrations will automatically update the `app/config/schema.ts` file based on the actual database schema.

## Queries

Here's an example of how to perform a query using Kysely:

```typescript
import { eq } from "kysely";
import database from "app/config/database";

async function getContact(email: string) {
  const contact = await database
    .selectFrom("contacts")
    .selectAll()
    .where("email", "=", email)
    .executeTakeFirst();
  return contact;
}
```

This query is type-safe, and your IDE will provide autocomplete suggestions for table and column names.

## Inserting

Here's how you can insert data into the database:

```typescript
import database from "app/config/database";
import { NewContact } from "app/config/schema";

async function createContact(contact: NewContact) {
  await database.insertInto("contacts").values(contact).execute();
}
```

## Updating

Updating data is similarly straightforward:

```typescript
import database from "app/config/database";

async function confirmDoubleOptIn(email: string) {
  await database
    .updateTable("contacts")
    .set({ doubleOptInConfirmed: Math.floor(Date.now() / 1000) })
    .where("email", "=", email)
    .execute();
}
```

## Seeding

plainstack provides a way to seed your database with test data. Create a `database/seed.ts` file:

```typescript
import type { Database } from "app/config/database";
import type { Contacts } from "app/config/schema";
import { defineSeed, randomId } from "plainstack";

export default defineSeed(async (db: Database) => {
  const now = Math.floor(Date.now() / 1000);
  const contactsData = Array.from({ length: 50 }, (_, i) => ({
    id: randomId(),
    email: `user${i + 1}@example.com`,
    createdAt: now - Math.floor(Math.random() * 30 * 24 * 60 * 60),
    doubleOptInSent: Math.random() > 0.5 ? now : null,
    doubleOptInConfirmed: Math.random() > 0.3 ? now : null,
    doubleOptInToken: `token_${Math.random().toString(36).substring(2, 15)}`,
  })) satisfies Contacts[];
  await db.insertInto("contacts").values(contactsData).execute();
  // Add more seed data as needed
});
```

Run the seed script with:

```bash
plainweb seed
```

This is useful for populating your local database with test data.

## Docs

For more detailed information about Kysely and its features, refer to the [official Kysely documentation](https://kysely.dev/docs/intro). It provides comprehensive guides on advanced querying, relationships, migrations, and more.

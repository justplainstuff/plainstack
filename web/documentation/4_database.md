---
title: Database
---

# Database

plainweb uses SQLite as database and [drizzle](https://orm.drizzle.team/docs/overview) for type-safe queries and migrations.

## Setup

```tsx
import BetterSqlite3Database from "better-sqlite3";

export const connection: BetterSqlite3Database.Database =
  new BetterSqlite3Database(env.NODE_ENV === "test" ? ":memory:" : env.DB_URL);
connection.pragma("journal_mode = WAL");
```

```tsx
import * as schema from "./schema";
import { drizzle } from "drizzle-orm/better-sqlite3";

export const database = drizzle<typeof schema>(connection, { schema });
export type Database = typeof database;
```

### Define tables

```tsx
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

### Run migrations

1. `pnpm db:gen`: creates new migration files
2. `pnpm db:apply`: applies all pending migrations

## Queries

```tsx
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { Contact, contacts } from "~/app/config/schema";
import { eq } from "drizzle-orm";

const db = new BetterSQLite3Database(":memory:");

const contact = await db.query.contacts.findFirst({
  where: (contact) => eq(contact.email, "walter@example.org"),
});
```

## Drizzle Studio

`pnpm db:studio` starts drizzle studio, a GUI for managing the database.

## Drizzle

Head over to [drizzle](https://orm.drizzle.team/docs/overview), they have a great documentation.

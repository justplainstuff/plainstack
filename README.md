# plainstack

plainstack is a web framework for TypeScript that allows you to build production-ready apps in a single file.

## Getting Started

`bun create plainstack`

## Example App

```typescript
import { Hono } from "hono";
import { jsxRenderer } from "hono/jsx-renderer";
import { logger } from "hono/logger";
import { form, store } from "plainstack";
import { bunSqlite, secret } from "plainstack/bun";
import { session } from "plainstack/session";

interface Items {
  content: string;
  createdAt: number;
  id: string;
}

interface DB {
  items: Items;
}

const { database, migrate } = bunSqlite<DB>();

await migrate(({ schema }) => {
  return schema
    .createTable("items")
    .addColumn("id", "text", (col) => col.primaryKey().notNull())
    .addColumn("content", "text", (col) => col.notNull())
    .addColumn("created_at", "integer", (col) => col.notNull())
    .execute();
});

const entities = await store(database);

const app = new Hono();

app.use(logger());
app.use(session({ encryptionKey: await secret() }));

app.get(
  "*",
  jsxRenderer(({ children }) => {
    return (
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="color-scheme" content="light dark" />
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css"
          />
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.colors.min.css"
          />
          <title>So many todos</title>
        </head>
        <body>
          <main class="container">
            <h1>{children}</h1>
          </main>
        </body>
      </html>
    );
  })
);

app.get("/", async (c) => {
  const info = c.var.session.get("info");
  const items = await entities("items").all();
  return c.render(
    <div>
      <h1>Todo App</h1>
      {info && <article>{info}</article>}
      <ul class="items-list">
        {items.map((item) => (
          <li key={item.id}>
            <div class="grid">
              {item.content}{" "}
              <form
                style={{ display: "inline" }}
                method="post"
                action={`/delete/${item.id}`}
              >
                <button type="submit">Delete</button>
              </form>
            </div>
          </li>
        ))}
      </ul>
      <form method="post" action="/add">
        <input
          type="text"
          name="content"
          placeholder="Enter todo item"
          required
        />
        <button type="submit">Add</button>
      </form>
    </div>
  );
});

app.post("/add", form(entities("items").zod), async (c) => {
  const submission = c.req.valid("form");
  const data = submission.value;
  await entities("items").create(data);
  c.var.session.flash("info", "Item added");
  return c.redirect("/");
});

app.post("/delete/:id", async (c) => {
  await entities("items").delete(c.req.param("id"));
  c.var.session.flash("info", "Item deleted");
  return c.redirect("/");
});

export default app;
```

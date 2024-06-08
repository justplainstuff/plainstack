---
title: Routing
---

# Routing

The file router as enabled by default. It implements file-based routing similar to Next.js by mapping `.tsx` files to express routes.

Every file may export a `GET` and a `POST` handler that are mapped to the corresponding HTTP method.

```tsx
import { Handler } from "plainweb";

export const GET: Handler = async () => {
  return <div>Hello world</div>;
};
```

## Setup

```typescript
import { fileRouter } from "plainweb";
import express from "express";

const app = express();
app.use(await fileRouter({ dir: "app/routes" }));
```

## Routing rules

The routing rules roughly follow the Next.js Pages Router conventions.

| File path                | Express route     | Example match         | Params                        |
| ------------------------ | ----------------- | --------------------- | ----------------------------- |
| `routes/index.tsx`       | `/`               | `/`                   |                               |
| `routes/about.tsx`       | `/about`          | `/about`              |                               |
| `routes/users/index.tsx` | `/users`          | `/users`              |                               |
| `routes/users.tsx`       | `/users`          | `/users`              |                               |
| `routes/users/[id].tsx`  | `/users/:id`      | `/users/123`          | `{id: 123}`                   |
| `routes/posts/[...slug]` | `/posts/:slug(*)` | `/posts/hotels/italy` | `{slug: ["hotels", "italy"]}` |
| `routes/users.test.ts`   | `-` (ignored)     | `-`                   |                               |
| `routes/find-orders.ts`  | `-` (ignored)     | `-`                   |                               |

## Response

Return a `JSX.Element` or a string to render a HTML response.

```tsx
import { Handler } from "plainweb";

export const GET: Handler = async () => {
  return (
    <html>
      <body>
        <div>Hello world</div>
      </body>
    </html>
  );
};
```

Return an object to render a JSON response.

```tsx
import { Handler } from "plainweb";

export const GET: Handler = async () => {
  return { hello: ["world1", "world2"] };
};
```

In order to redirect, use the `redirect` function.

```tsx
import { Handler, redirect } from "plainweb";

export const GET: Handler = async () => {
  return redirect("/admin");
};
```

As an escape hatch, you can always use the `express.Response API` directly. Make sure to wrap your code in a function:

```tsx
import { Handler, handleResponse } from "plainweb";

export const GET: Handler = async ({ res }) => {
  return () => {
    res.status(200).send("Hello world");
  };
};
```

## Route params

In a route `routes/orgs/[orgId]/users/[userId].tsx`, you can use `req.params` get the parameters in a route.

```tsx
import { Handler } from "plainweb";

export const GET: Handler = async ({ req }) => {
  return (
    <div>
      User id {req.params.userId} in org {req.params.orgId}
    </div>
  );
};
```

Express routed the request already to the matching handler, so you don't have to parse the params using zod.

## Query strings

Let's say a request`/users?sort=id` hits the `GET` handler below:

```tsx
import { Handler } from "plainweb";

export const GET: Handler = async ({ req }) => {
  const { sort } = req.query;
  return { users: await getUsers({ sort }) };
};
```

It's good practice to parse query strings using zod:

```tsx
import { z } from "zod";
import { Handler } from "plainweb";

export const GET: Handler = async ({ req }) => {
  const { sort } = req.query;
  const parsed = z.object({ sort: z.string() }).safeParse(req.query);
  if (!parsed.success) return <div>Invalid sort</div>;
  return <div>Sorted by {parsed.data.sort}</div>;
};
```

## Parsing form data

`zod` can not be used to parse form data directly, but you can use the `zod-form-data` package to do so:

```tsx
import { Handler } from "plainweb";

export const POST: Handler = async ({ req }) => {
  const parsed = zfd.formData({ value: zfd.text() }).safeParse(req.body);
  if (!parsed.success && parsed.success === "ping") return <div>Pong!</div>;
  return <div>Ping?</div>;
};

export const GET: Handler = async () => {
  return (
    <form hx-post="/ping">
      <input type="hidden" name="value" value="ping" />
      <button>Ping</button>
    </form>
  );
};
```

## Layouts

Certain parts of your app might share the same layout. Layouts in plainweb are just JSX components that take the page content as `children` prop. It's up to you to wrap a page in a layouts. This makes things easy to read, understand and change without having to understand a layout nesting system.

```tsx
export default function Layout(props: Html.PropsWithChildren<{}>) {
  return (
    <>
      {"<!doctype html>"}
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
        </head>
        <body>{props.children}</body>
      </html>
    </>
  );
}
```

It's a good idea to have a root layout where you define styles and scripts that are used by all pages, such as the tailwind css or analytics scripts.
Layouts further down the page tree such as app layouts or blog layouts can be wrapped by the root layout.

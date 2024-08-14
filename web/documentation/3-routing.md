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

The routing rules follow the Next.js Pages Router conventions.

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

## Serving HTTP Requests

Following is the main entry point to your app:

```typescript
// app/cli/serve.ts
import { getApp, log } from "plainweb";
import config from "plainweb.config";

async function serve() {
  const app = await getApp(config);
  app.listen(config.http.port);
  log.info(`⚡️ http://localhost:${config.http.port}`);
}

serve();
```

`getApp()` returns an express app, which you can use to serve HTTP requests.

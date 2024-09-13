# Request Handling

In plainstack, a handler is a function that processes an incoming request and returns a response.

## Response Types

plainstack simplifies common use cases by inferring the response type based on the returned value.

### HTML Responses

Return a `JSX.Element` or a string to render an HTML response. In plainstack, `JSX.Element` is essentially `string | Promise<string>`.

```tsx
import { defineHandler } from "plainstack";

export const GET = defineHandler(async () => {
  return (
    <html>
      <body>
        <div>Hello world</div>
      </body>
    </html>
  );
});
```

For more control, use the `html` helper function:

```tsx
import { defineHandler, html } from "plainstack";

export const GET = defineHandler(async () => {
  return html(
    <html>
      <body>
        <div>Hello world</div>
      </body>
    </html>,
    { status: 200 }
  );
});
```

### JSON Responses

Return a plain object to generate a JSON response:

```tsx
import { defineHandler } from "plainstack";

export const GET = defineHandler(async () => {
  return { hello: ["world1", "world2"] };
});
```

For more control, use the `json` helper function:

```tsx
import { defineHandler, json } from "plainstack";

export const GET = defineHandler(async () => {
  return json({ hello: ["world1", "world2"] }, { status: 200 });
});
```

Note: The returned object must be JSON-serializable (no functions or promises).

### Redirects

Use the `redirect` function to perform redirects:

```tsx
import { defineHandler, redirect } from "plainstack";

export const GET = defineHandler(async () => {
  return redirect("/admin");
});
```

### Express Response (Escape Hatch)

For full control, you can access the Express `Response` object directly:

```tsx
import { defineHandler } from "plainstack";

export const GET = defineHandler(async ({ res }) => {
  return () => {
    res.status(200).send("Hello world");
  };
});
```

## Request Parameters

### Route Parameters

For a route like `routes/orgs/[orgId]/users/[userId].tsx`, access parameters using `req.params`:

```tsx
import { defineHandler } from "plainstack";

export const GET = defineHandler(async ({ req }) => {
  return (
    <div>
      User id {req.params.userId} in org {req.params.orgId}
    </div>
  );
});
```

### Query Strings

Access query parameters via `req.query`. It's recommended to parse them using `zod`:

```tsx
import { z } from "zod";
import { defineHandler } from "plainstack";

export const GET = defineHandler(async ({ req }) => {
  const schema = z.object({ sort: z.string() });
  const result = schema.safeParse(req.query);

  if (!result.success) {
    return <div>Invalid sort parameter</div>;
  }

  return <div>Sorted by {result.data.sort}</div>;
});
```

### Form Data

Use [zod-form-data](https://www.npmjs.com/package/zod-form-data) to parse form data:

```tsx
import { zfd } from "zod-form-data";
import { defineHandler } from "plainstack";

export const POST = defineHandler(async ({ req }) => {
  const schema = zfd.formData({ value: zfd.text() });
  const result = schema.safeParse(req.body);

  if (result.success && result.data.value === "ping") {
    return <div>Pong!</div>;
  }

  return <div>Ping?</div>;
});

export const GET = defineHandler(async () => {
  return (
    <form hx-post="/ping">
      <input type="hidden" name="value" value="ping" />
      <button>Ping</button>
    </form>
  );
});
```

## Streaming Responses

plainstack supports streaming responses using `Suspense`, similar to React:

```tsx
import { Suspense } from "@kitajs/html/suspense";
import { defineHandler, stream } from "plainstack";

async function HelloDelayed() {
  await new Promise((resolve) => setTimeout(resolve, 5000));
  return <div>Hello 5 seconds later!</div>;
}

export const GET = defineHandler(async () => {
  return stream((rid) => (
    <Suspense
      rid={rid}
      fallback={<div>Loading...</div>}
      catch={() => <div>Something went wrong</div>}
    >
      <HelloDelayed />
    </Suspense>
  ));
});
```

This allows rendering parts of the page immediately while slower components load asynchronously.

## Layouts

Layouts in plainstack are JSX components that wrap page content. They're simple to implement and use:

```tsx
export default function Layout({ children }: Html.PropsWithChildren<{}>) {
  return (
    <>
      {"<!doctype html>"}
      <html lang="en">
        <head>
          <meta charSet="UTF-8" />
          <title>My App</title>
        </head>
        <body>{children}</body>
      </html>
    </>
  );
}
```

They typically live in `app/layouts`.

You can create a root layout for global styles and scripts, and nest more specific layouts within it:

```tsx
import RootLayout from "app/layouts/root";
import AppLayout from "app/layouts/app";

export const GET = defineHandler(async () => {
  return (
    <RootLayout>
      <AppLayout>
        <h1>Welcome to my app!</h1>
      </AppLayout>
    </RootLayout>
  );
});
```

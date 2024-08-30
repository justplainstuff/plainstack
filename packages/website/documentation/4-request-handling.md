# Request Handling

In plainweb, a handler is a function that processes an incoming request and returns a response.

## Response Types

plainweb simplifies common use cases by inferring the response type based on the returned value.

### HTML Responses

Return a `JSX.Element` or a string to render an HTML response. In plainweb, `JSX.Element` is essentially `string | Promise<string>`.

```tsx
import { Handler } from "plainstack";

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

For more control, use the `html` helper function:

```tsx
import { Handler, html } from "plainstack";

export const GET: Handler = async () => {
  return html(
    <html>
      <body>
        <div>Hello world</div>
      </body>
    </html>,
    { status: 200 }
  );
};
```

### JSON Responses

Return a plain object to generate a JSON response:

```tsx
import { Handler } from "plainstack";

export const GET: Handler = async () => {
  return { hello: ["world1", "world2"] };
};
```

For more control, use the `json` helper function:

```tsx
import { Handler, json } from "plainstack";

export const GET: Handler = async () => {
  return json({ hello: ["world1", "world2"] }, { status: 200 });
};
```

Note: The returned object must be JSON-serializable (no functions or promises).

### Redirects

Use the `redirect` function to perform redirects:

```tsx
import { Handler, redirect } from "plainstack";

export const GET: Handler = async () => {
  return redirect("/admin");
};
```

### Express Response (Escape Hatch)

For full control, you can access the Express `Response` object directly:

```tsx
import { Handler } from "plainstack";

export const GET: Handler = async ({ res }) => {
  return () => {
    res.status(200).send("Hello world");
  };
};
```

## Request Parameters

### Route Parameters

For a route like `routes/orgs/[orgId]/users/[userId].tsx`, access parameters using `req.params`:

```tsx
import { Handler } from "plainstack";

export const GET: Handler = async ({ req }) => {
  return (
    <div>
      User id {req.params.userId} in org {req.params.orgId}
    </div>
  );
};
```

### Query Strings

Access query parameters via `req.query`. It's recommended to parse them using `zod`:

```tsx
import { z } from "zod";
import { Handler } from "plainstack";

export const GET: Handler = async ({ req }) => {
  const schema = z.object({ sort: z.string() });
  const result = schema.safeParse(req.query);

  if (!result.success) {
    return <div>Invalid sort parameter</div>;
  }

  return <div>Sorted by {result.data.sort}</div>;
};
```

### Form Data

Use [zod-form-data](https://www.npmjs.com/package/zod-form-data) to parse form data:

```tsx
import { zfd } from "zod-form-data";
import { Handler } from "plainstack";

export const POST: Handler = async ({ req }) => {
  const schema = zfd.formData({ value: zfd.text() });
  const result = schema.safeParse(req.body);

  if (result.success && result.data.value === "ping") {
    return <div>Pong!</div>;
  }

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

## Streaming Responses

plainweb supports streaming responses using `Suspense`, similar to React:

```tsx
import { Suspense } from "@kitajs/html/suspense";
import { Handler, stream } from "plainstack";

async function HelloDelayed() {
  await new Promise((resolve) => setTimeout(resolve, 5000));
  return <div>Hello 5 seconds later!</div>;
}

export const GET: Handler = async () => {
  return stream((rid) => (
    <Suspense
      rid={rid}
      fallback={<div>Loading...</div>}
      catch={() => <div>Something went wrong</div>}
    >
      <HelloDelayed />
    </Suspense>
  ));
};
```

This allows rendering parts of the page immediately while slower components load asynchronously.

## Layouts

Layouts in plainweb are JSX components that wrap page content. They're simple to implement and use:

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

You can create a root layout for global styles and scripts, and nest more specific layouts within it:

```tsx
import RootLayout from "app/components/root-layout";
import AppLayout from "app/components/app-layout";

export const GET: Handler = async () => {
  return (
    <RootLayout>
      <AppLayout>
        <h1>Welcome to my app!</h1>
      </AppLayout>
    </RootLayout>
  );
};
```

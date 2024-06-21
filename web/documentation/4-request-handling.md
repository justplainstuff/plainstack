# Request Handling

A handler in plainweb is a function that takes a request and returns a response.

## Response

plainweb was designed to make the most common use cases simple. Returning HTML or JSON is inferred be returning either a `JSX.Element` or an object.

### HTML

Return a `JSX.Element` or a string to render a HTML response. (`JSX.Element` is really just `string | Promise<string>`!)

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

Returning HTML directly is a shorthand for `html`:

```tsx
import { Handler, html } from "plainweb";

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

### JSON

Return an object to render a JSON response.

```tsx
import { Handler } from "plainweb";

export const GET: Handler = async () => {
  return { hello: ["world1", "world2"] };
};
```

Returning an object tells plainweb to infer the response type as JSON.
The returned object needs to be JSON serializable, so you can't return functions or promises.

The above is a shorthand for `json`:

```tsx
import { Handler, json } from "plainweb";

export const GET: Handler = async () => {
  return json({ hello: ["world1", "world2"] }, { status: 200 });
};
```

### Redirect

In order to redirect, use the `redirect` function.

```tsx
import { Handler, redirect } from "plainweb";

export const GET: Handler = async () => {
  return redirect("/admin");
};
```

### Express Response

If the convenient helper functions are not enough, you can always use the `express.Response` directly. This escape hatch allows you to use the full power of express.

Make sure to wrap your response creating code in a callback function:

```tsx
import { Handler, handleResponse } from "plainweb";

export const GET: Handler = async ({ res }) => {
  return () => {
    res.status(200).send("Hello world");
  };
};
```

## Params

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

## Query Strings

Let's say a request `/users?sort=id` hits the `GET` handler below:

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

## Form Data

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

## Streaming

Thanks to [kitajs](https://github.com/kitajs/html) you can stream responses using `Suspense`, just like in React.

Let's say you have a slow async component `HelloDelayed` that takes a long time to render.

```tsx
async function HelloDelayed() {
  await new Promise((res) => {
    setTimeout(() => {
      res({});
    }, 5000);
  });
  return <div>Hello 5 seconds later!</div>;
}
```

Use `<Suspense />` to render a fallback component while the slow component is loading.

```tsx
import { Suspense } from "@kitajs/html/suspense";
import { Handler, stream } from "plainweb";

async function HelloDelayed() {
  await new Promise((res) => {
    setTimeout(() => {
      res({});
    }, 5000);
  });
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

Provide a callback to the `stream` function that returns the streamed JSX.Element. Make sure to use `rid` as the streaming id.

This is useful if you don't want to delay rendering the whole page until the slow component is loaded.

All without explicit client-side JavaScript!

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

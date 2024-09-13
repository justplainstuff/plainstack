# About

plainstack is a set of tools, documentation, and design principles for building simpler web apps in TypeScript..

## Motivation

I've built plainstack for myself and other [Grug Brained Developers](https://grugbrain.dev/).

I wanted something that:

1. Is truly fullstack, like Laravel or Django, but for TypeScript
2. Runs as a single long-running process for easy deployment and management
3. Provides full type-safe database queries and type-safe React-like `.tsx` components
4. Addresses 80% of common full-stack concerns like emails, task queues, and routing
5. Allows me to ship fast

plainstack aims to be feature-complete, while at the same time being plain and simple to use.

## The Price of Simplicity

Simplicity is a trade-off. We have to say "no" to certain things.

### SQLite (vs. Postgres, MySQL, MongoDB, Redis)

SQLite eliminates the need for a separate database process. It uses [5 datatypes](https://www.sqlite.org/datatype3.html) and has a small API surface area. You don't need a database administrator or a managed service.

However, SQLite lacks some of the advanced features found in Postgres and other databases.

### Long-running Process (vs. Serverless, Edge)

Deploying and operating a single long-running Node.js process provides a simple mental model. You're less likely to encounter edge cases common in Node-compatible serverless runtimes.

The trade-off is that this traditional model makes it more challenging to deploy to multiple regions or scale horizontally.

### HTMX/Alpine.js (vs. React, Vue, Svelte)

plainstack discourages frontend build processes. Instead, HTMX and Alpine.js are embraced to progressively enhance server-side rendered HTML.

While this approach simplifies development, it makes it harder to leverage existing frontend ecosystems like React.

### Node.js (vs. Deno, Bun)

Node.js is a mature and reliable runtime. It's been around for a while and edge cases have been ironed out.

Bun is generally faster than Node.js and plainstack might switch to Bun once it reaches a stable state. Bun's file router and built-in SQLite support would allow us to remove these bits from plainstack.

### Express (vs. Hono, Fastify)

Express is a mature and well-tested framework with a rich middleware ecosystem. Since plainstack doesn't support multiple deployment targets like Hono, it can fully lean into the Node.js ecosystem.

Express receives less attention from the community, and some middleware packages are not actively maintained. Note that plainstack may switch to Hono in the future.

## When to Use

plainstack is the right tool for you if you:

- ✅ Enjoy the batteries-included approach of Django, Rails, or Laravel
- ✅ Believe that sending HTML fragments over the wire with HTMX is a sensible default for most web apps
- ✅ Recognize SQLite as a powerful and simple database solution
- ✅ Appreciate TypeScript and its ecosystem
- ✅ Enjoy React-style components and JSX
- ✅ Prefer copying a bit of code over adding small dependencies

plainstack is probably not the right tool for you if you:

- ❌ Already have 500k+ monthly active users
- ❌ Have a large development team
- ❌ Want to use the ecosystem of established frontend frameworks

## Inspiration

plainstack draws inspiration from and builds upon the ideas of the [Grug Brained Developer](https://grugbrain.dev/), [SQLite](https://sqlite.org/), [HTMX](https://htmx.org/), [PocketBase](https://pocketbase.io/), [Remix](https://remix.run/), [Litestream](https://litestream.io/), and some of the [Go proverbs](https://www.youtube.com/watch?v=PAAkCSZUG1c&t=568s).

## plainstack API

To get a rough idea of the API surface area of `plainstack`, here is the complete API:

```typescript
// core
export { type Config, defineConfig, getConfig } from "./bootstrap/config";
export { getLogger } from "./log";
export { randomId } from "./id";
export { dev, prod, test, defineEnv } from "./env";

// http & web
export { fileRouter } from "./web/file-router";
export { type Handler, defineHandler } from "./web/handler";
export { html, json, redirect, stream, notFound } from "./web/plain-response";
export { middleware, defineHttp, printRoutes } from "./web/http";
export { testHandler } from "./web/test-handler";
export { asset } from "./asset";

// mail
export { outbox, sendMail, defineMailer } from "./mail";

// database
export { rollback, defineDatabase } from "./database/database";
export { defineSeed } from "./database/seed";

// jobs
export {
  defineQueue,
  defineJob,
  defineSchedule,
  type Job,
  type Schedule,
  work,
  perform,
} from "./job";
```

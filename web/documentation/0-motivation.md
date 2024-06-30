# About

plainweb is a set of tools, documentation and design principles for building simpler web apps.

It has 3 parts:

1. This documentation
2. `create-plainweb`: A CLI tool to create a starter
3. `plainweb`: A small NPM package that glues existing tools/packages together

## Motivation

I've built plainweb for myself and for other [Grug Brained Developers](https://grugbrain.dev/).

I wanted something that:

1. is a single long-running process to deploy and manage
2. has full type-safe database queries and type-safe React-like `.tsx` components
3. addresses 80% of common full-stack concerns like emails, task queues and routing
4. doesn't have a frontend build process

## Minimal lock-in

"Framework" sounds scary, I get it. Why would you run your business critical code on this particular JS framework?

plainweb is not a framework like Rails, Django or Laravel. The `plainweb` NPM package is tiny. The long-term goal is to completely get rid of it! Underneath this thin layer is a set of battle-tested tools, each with a small API surface area.

The docs are the most important part of the plainweb framework. `create-plainweb` (starter) and `plainweb` (library) provide the building blocks. The docs show how to compose them.

In case plainweb doesn't fit your needs at some point, it's easy to eject if you have a solid grasp of the following tools:

- [htmx](https://htmx.org/)
- [drizzle](https://orm.drizzle.team/docs/get-started-sqlite)
- [tailwind](https://tailwindcss.com/docs/utility-first)
- [zod](https://zod.dev/)
- [express](https://expressjs.com/en/guide/routing.html)

## The price of simplicity

Simplicity doesn't come for free. We have to say "no" to things, it's a conscious trade-off.

### SQLite (vs. Postgres, MySQL, MongoDB, Redis)

SQLite removes the need for a separate database process. It knows [5 datatypes](https://www.sqlite.org/datatype3.html) and has a small API surface area. You don't need a database administrator or a managed service.

But SQLite doesn't have the bells and whistles of something like Postgres.

### Long-running process (vs. Serverless, Edge)

Deploying and operating a single long-running Node.js process is a simple mental model. You are less likely to waste time with edge-cases of Node-compatible serverless runtimes.

Using this traditional model makes it harder to deploy to multiple regions or to scale horizontally.

### HTMX/Alpine.js (vs. React, Vue, Svelte)

No frontend build process is allowed. Instead, plainweb uses HTMX and Alpine.js to enhance server-side rendered HTML.

This makes it harder to leverage existing frontend ecosystems like React.

### Node.js (vs. Deno, Bun)

Node.js has been here for a while and it works.

Bun is generally faster than Node.js. plainweb might switch to Bun once it's stable enough.

### Express (vs. Hono, Fastify)

Similarly to Node.js, Express is a mature and well-tested framework with a rich middleware ecosystem. plainweb doesn't support multiple deployment targets like Hono, so it can lean into the Node.js ecosystem.

Express receives little love from the community and some of the middleware packages are not actively maintained. Note that plainweb might switch to Hono in the future.

## When to use

plainweb is the right tool for you if you:

- ✅ enjoy the batteries included approach of Django, Rails or Laravel
- ✅ are convinced that sending HTML fragments over the wire with HTMX is a sane default for most web apps
- ✅ know that SQLite is a powerful and simple database
- ✅ enjoy TypeScript and its ecosystem
- ✅ enjoy React-style components and JSX
- ✅ prefer copying a bit of code over having a little dependency

plainweb is probably not the right tool for you if you:

- ❌ already have 500k monthly active users
- ❌ have a large team
- ❌ want to use the ecosystem of established frontend frameworks

## Inspiration

plainweb learned from and is heavily inspired by the [Grug Brained Developer](https://grugbrain.dev/), [SQLite](https://sqlite.org/), [HTMX](https://htmx.org/), [PocketBase](https://pocketbase.io/), [Remix](https://remix.run/), [Litestream](https://litestream.io/) and some of the [Go proverbs](https://www.youtube.com/watch?v=PAAkCSZUG1c&t=568s).

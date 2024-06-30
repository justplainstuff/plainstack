# About

plainweb is a set of tools, documentation, and design principles for building simpler web apps.

It consists of three parts:

1. This documentation
2. `create-plainweb`: A CLI tool to create a starter project
3. `plainweb`: A small NPM package that integrates existing tools and packages

## Motivation

I've built plainweb for myself and other [Grug Brained Developers](https://grugbrain.dev/).

I wanted something that:

1. Runs as a single long-running process for easy deployment and management
2. Provides full type-safe database queries and type-safe React-like `.tsx` components
3. Addresses 80% of common full-stack concerns like emails, task queues, and routing
4. Doesn't require a frontend build process

## Minimal Lock-in

The term "framework" can be intimidating. Why would you run your business-critical code on yet another JS framework?

plainweb isn't a framework like Rails, Django, or Laravel. The `plainweb` NPM package is tiny, and our long-term goal is to eliminate it entirely! Underneath this thin layer is a set of battle-tested tools, each with a small API surface area.

The documentation is the most crucial part of the plainweb framework. `create-plainweb` (starter) and `plainweb` (library) provide the building blocks, while the docs show how to compose them.

If plainweb doesn't meet your needs at some point, it's easy to transition away if you have a solid understanding of the following tools:

- [htmx](https://htmx.org/)
- [drizzle](https://orm.drizzle.team/docs/get-started-sqlite)
- [tailwind](https://tailwindcss.com/docs/utility-first)
- [zod](https://zod.dev/)
- [express](https://expressjs.com/en/guide/routing.html)

## The Price of Simplicity

Simplicity comes with trade-offs. We have to say "no" to certain features and technologies.

### SQLite (vs. Postgres, MySQL, MongoDB, Redis)

SQLite eliminates the need for a separate database process. It uses [5 datatypes](https://www.sqlite.org/datatype3.html) and has a small API surface area. You don't need a database administrator or a managed service.

However, SQLite lacks some of the advanced features found in Postgres and other databases.

### Long-running Process (vs. Serverless, Edge)

Deploying and operating a single long-running Node.js process provides a simple mental model. You're less likely to encounter edge cases common in Node-compatible serverless runtimes.

The trade-off is that this traditional model makes it more challenging to deploy to multiple regions or scale horizontally.

### HTMX/Alpine.js (vs. React, Vue, Svelte)

plainweb prohibits frontend build processes. Instead, it uses HTMX and Alpine.js to enhance server-side rendered HTML.

While this approach simplifies development, it makes it harder to leverage existing frontend ecosystems like React.

### Node.js (vs. Deno, Bun)

Node.js is a mature and reliable runtime.

Although Bun is generally faster than Node.js, plainweb might switch to Bun once it reaches a stable state.

### Express (vs. Hono, Fastify)

Similar to Node.js, Express is a mature and well-tested framework with a rich middleware ecosystem. Since plainweb doesn't support multiple deployment targets like Hono, it can fully utilize the Node.js ecosystem.

Express receives less attention from the community, and some middleware packages are not actively maintained. Note that plainweb may switch to Hono in the future.

## When to Use

plainweb is the right tool for you if you:

- ✅ Enjoy the batteries-included approach of Django, Rails, or Laravel
- ✅ Believe that sending HTML fragments over the wire with HTMX is a sensible default for most web apps
- ✅ Recognize SQLite as a powerful and simple database solution
- ✅ Appreciate TypeScript and its ecosystem
- ✅ Enjoy React-style components and JSX
- ✅ Prefer copying a bit of code over adding small dependencies

plainweb is probably not the right tool for you if you:

- ❌ Already have 500k monthly active users
- ❌ Have a large development team
- ❌ Want to use the ecosystem of established frontend frameworks

## Inspiration

plainweb draws inspiration from and builds upon the ideas of the [Grug Brained Developer](https://grugbrain.dev/), [SQLite](https://sqlite.org/), [HTMX](https://htmx.org/), [PocketBase](https://pocketbase.io/), [Remix](https://remix.run/), [Litestream](https://litestream.io/), and some of the [Go proverbs](https://www.youtube.com/watch?v=PAAkCSZUG1c&t=568s).

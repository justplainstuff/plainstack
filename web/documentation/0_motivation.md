---
title: What is plainweb?
---

# What is plainweb?

plainweb is a set of tools, documentation and design principles for building simpler web apps on top of HTMX, SQLite and TypeScript.

It has 3 parts:

1. This documentation
2. `create-plainweb`: A CLI tool to create a starter project with HTMX, SQLite and TypeScript
3. `plainweb`: A small library glueing existing tools together

## Is it a framework?

Unlike frameworks like Rails or Django, plainweb doesn't abstract away its dependencies to hide them from you. Instead, it carefully selects a set of tools with small API surface areas and provides documentation on how to use them together. The docs are the most important part of the plainweb framework.

`create-plainweb` (starter) and `plainweb` (library) provide the building blocks. The docs show how to compose them.

This also means that the lock-in is minimal. In case `plainweb` stops fitting your needs or gets abandoned, it's easy to eject. You should have a solid grasp of following tools:

- [htmx](https://htmx.org/)
- [drizzle](https://orm.drizzle.team/docs/get-started-sqlite)
- [tailwindcss](https://tailwindcss.com/docs/utility-first)
- [zod](https://zod.dev/)
- [express](https://expressjs.com/en/guide/routing.html)

## Motivation

I've built plainweb for myself and for other [Grug Brained Developers](https://grugbrain.dev/).

I wanted something that:

1. is a single long-running process to deploy and manage
2. has full type-safe database queries and type-safe React-like `.tsx` components
3. addresses 80% of common full-stack concerns like emails, task queues and routing
4. doesn't have a frontend build process

## Is it for you?

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

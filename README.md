# plainstack

Plainstack is a web framework where you start with a single-file. It extends [Hono](https://github.com/honojs/hono) with full-stack concerns like database migrations, background jobs, scheduled jobs, and more.

## Features

- Small API in the spirit of [Hono](https://github.com/honojs/hono)
- Database migrations
- Automatic CRUD operations and zod schema for entities
- Fully typed SQL queries
- Zod-based form validation
- Authentication helpers that go well with Hono's OAuth providers
- Cookie-based session management
- `<Toast />` component for flash messages
- Background jobs with parallel workers
- Scheduled jobs to run code at a specific time or interval (cron syntax)
- JSX client components

## Getting Started

Clone the [starter](https://github.com/justplainstuff/starter) repo to get a plainstack app with Tailwind, OAuth and more:

```bash
git clone git@github.com:justplainstuff/starter.git
```

```bash
bun dev
```

or install `plainstack` manually:

```bash
bun install plainstack
```

## Documentation [WIP]

- Database migrations
- Create entity
- Update entity
- Query entity
- SQL queries
- Form validation
- Sessions
- Authentication
- Background jobs
- Scheduled jobs
- `<Toast />`
- Client Components

## Examples

Check out the [full list of examples](https://github.com/justplainstuff/plainstack/tree/main/example).

import { googleAuth } from "@hono/oauth-providers/google";
import { Hono } from "hono";
import { jsxRenderer } from "hono/jsx-renderer";
import { logger } from "hono/logger";
import { protect, signin, store } from "plainstack";
import { secret, sqlite } from "plainstack/bun";
import { session } from "plainstack/session";
import { z } from "zod";

interface Users {
  id: string;
  email: string | null;
  emailVerified: boolean | null;
}

interface DB {
  users: Users;
}

const env = z
  .object({
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
  })
  .parse(process.env);

const { database, migrate } = sqlite<DB>();

await migrate(({ schema }) =>
  schema
    .createTable("users")
    .addColumn("id", "text", (col) => col.primaryKey().notNull())
    .addColumn("email", "text")
    .addColumn("email_verified", "boolean")
    .execute(),
);

const entities = await store(database);

const app = new Hono();

app.use(logger());
app.use(session({ encryptionKey: await secret() }));

app.get(
  "/google",
  googleAuth({
    client_id: env.GOOGLE_CLIENT_ID,
    client_secret: env.GOOGLE_CLIENT_SECRET,
    scope: ["openid", "email", "profile"],
  }),
  async (c) => {
    const googleUser = c.get("user-google");
    if (googleUser) {
      const found =
        (await entities("users").get({ id: googleUser.id })) ??
        (await entities("users").create({
          id: googleUser.id,
          email: googleUser.email,
          emailVerified: googleUser.verified_email,
        }));
      c.get("session").set("user-id", found.id);
      return c.redirect("/protected");
    }
    return c.redirect("/signin");
  },
);

app.get(
  "*",
  jsxRenderer(({ children }) => {
    return (
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body>{children}</body>
      </html>
    );
  }),
);

app.get("/", async (c) => {
  return c.render(
    <div>
      <h1>Landing page</h1>
      <a href="/signin">Sign in</a>
    </div>,
  );
});

app.get(
  "/signin",
  signin({
    protectedPath: "/protected",
    getUser: (id) => entities("users").get({ id }),
  }),
  async (c) => {
    return c.render(
      <div>
        <h1>Sign in</h1>
        <a href="/google">Sign in with Google</a>
      </div>,
    );
  },
);

app.get("/signout", async (c) => {
  c.get("session").deleteSession();
  return c.redirect("/");
});

app.get(
  "/protected",
  protect({
    signinPath: "/signin",
    getUser: (id) => entities("users").get({ id }),
  }),
  async (c) => {
    return c.render(
      <div>
        <h1>Protected page</h1>
        <span>Hi {c.get("user").email}</span>
        <a href="/signout">Sign out</a>
      </div>,
    );
  },
);

export default app;

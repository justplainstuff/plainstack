import { Hono } from "hono";
import { Toast } from "plainstack";
import { secret } from "plainstack/bun";
import { session } from "plainstack/session";

const app = new Hono();

app.use(session({ encryptionKey: await secret() }));

app.get("/", async (c) => {
  const toast = c.var.session.get("toast");
  return c.html(
    <html lang="en">
      <body>
        <Toast toast={toast} />
        <a href="/toast">Show Toast</a>
      </body>
    </html>,
  );
});

app.get("/toast", async (c) => {
  c.var.session.flash("toast", "Hello World!");
  return c.redirect("/");
});

export default app;

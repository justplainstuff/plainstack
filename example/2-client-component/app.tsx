import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { build } from "plainstack/bun";
import { render } from "plainstack/client";
import { Counter } from "./client/counter";

const app = new Hono();

app.use("/static/*", serveStatic({ root: "./example/2-client-component" }));

await build({
  entrypoints: "example/2-client-component/client",
  outdir: "example/2-client-component/static",
});

app.get("/", async (c) => {
  return c.html(
    <html lang="en">
      <body>
        <div id="counter" />
        {render(Counter, { path: "/static" })}
      </body>
    </html>,
  );
});

export default app;

import { Hono } from "hono";

const app = new Hono();

app.get("/", async (c) => {
  return c.redirect("https://github.com/justplainstuff/plainstack");
});

export default app;

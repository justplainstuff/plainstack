import { Hono } from "hono";
import { error } from "plainstack";

process.env.NODE_ENV = "development";
const app = new Hono();
app.onError(error());

app.get("/", async (c) => {
  throw new Error("database connection error");
});

export default app;

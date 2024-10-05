import { Hono } from "hono";
import { jsxRenderer } from "hono/jsx-renderer";
import { logger } from "hono/logger";
import { JobStatus } from "plainjob";
import { job, perform, work } from "plainstack";
import { bunSqlite } from "plainstack/bun";

const { queue } = bunSqlite();

const randomJob = job<string>({
  name: "random",
  run: async ({ data }) => {
    if (Math.random() > 0.5) throw new Error("Random error");
    console.log("Processing job", data);
  },
});

void work(queue, { job: randomJob }, {});

const app = new Hono();

app.use(logger());

app.get(
  "*",
  jsxRenderer(({ children }) => {
    return (
      <html lang="en">
        <body>{children}</body>
      </html>
    );
  }),
);

app.get("/", async (c) => {
  return c.render(
    <div>
      <h1>Job Queue</h1>
      <form method="post" action="/queue">
        <button type="submit">Enqueue</button>
      </form>
      <div>Pending: {queue.countJobs({ status: JobStatus.Pending })}</div>
      <div>Done: {queue.countJobs({ status: JobStatus.Done })}</div>
      <div>Failed: {queue.countJobs({ status: JobStatus.Failed })}</div>
    </div>,
  );
});

app.post("/queue", async (c) => {
  await perform(queue, randomJob, Math.random().toString());
  return c.redirect("/");
});

export default app;

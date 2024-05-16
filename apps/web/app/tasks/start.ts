import { initFileRouter } from "node-file-router";
import express from "express";
import { env } from "~/app/env";

const app = express();

initFileRouter({ baseDir: "app/routes", ignoreFilesRegex: "root.tsx" }).then(
  (fileRouter) => {
    app.use(fileRouter);
    app.listen(env.PORT);
  }
);

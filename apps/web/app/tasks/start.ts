import express from "express";
import { env } from "~/app/env";
import { fileRouter } from "plainweb";

const app = express();

fileRouter({ dir: "app/routes" }).then((fileRouter) => {
  app.use(fileRouter);
  app.listen(env.PORT);
});

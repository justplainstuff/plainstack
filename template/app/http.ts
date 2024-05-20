import express, { type Express } from "express";
import { fileRouter } from "plainweb";
import compression from "compression";
import errorHandler from "errorhandler";
import { env } from "~/app/env";
import morgan from "morgan";

export async function http(): Promise<Express> {
  const app = express();
  if (env.NODE_ENV === "development") app.use(morgan("dev"));
  else app.use(morgan("combined"));
  if (env.NODE_ENV === "development") app.use(errorHandler());
  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static("public"));
  app.use(await fileRouter({ dir: "app/routes" }));
  return app;
}

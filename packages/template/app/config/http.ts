import { database } from "app/config/database";
import errorHandler from "errorhandler";
import express from "express";
import { type Config, dev, middleware, prod } from "plainstack";

export async function http(config: Config) {
  const app = express();
  app.use(middleware.id());
  app.use(errorHandler());
  app.use(middleware.logging());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(middleware.database({ database }));
  if (dev()) express.static(config.paths.public);
  if (prod()) app.use(middleware.forceWWW());
  if (prod()) app.use(middleware.rateLimit());
  app.use(await middleware.fileRouter({ dir: config.paths.routes }));
  return app;
}

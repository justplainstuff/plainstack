import { database } from "app/config/database";
import { env } from "app/config/env";
import compression from "compression";
import errorHandler from "errorhandler";
import express from "express";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { fileRouter, flyHeaders, redirectWWW } from "plainweb";

const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  message: "Too many requests, please try again in a few seconds",
});

export async function app(): Promise<express.Express> {
  const app = express();
  if (env.NODE_ENV !== "production") app.use(morgan("dev"));
  if (env.NODE_ENV === "production") app.use(morgan("combined"));
  if (env.NODE_ENV === "development") app.use(errorHandler());
  if (env.NODE_ENV === "production") app.use(redirectWWW);
  if (env.NODE_ENV === "development")
    app.use("/public", express.static("public"));
  if (env.NODE_ENV === "development") app.use(limiter);

  app.use(flyHeaders);
  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use((req, res, next) => {
    res.locals.database = database;
    next();
  });
  app.use(await fileRouter({ dir: "app/routes", verbose: 3 }));
  return app;
}

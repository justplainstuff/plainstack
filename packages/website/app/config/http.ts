import httpServer from "node:http";
import database from "app/config/database";
import { listenWebsocket } from "app/services/confetti";
import errorHandler from "errorhandler";
import type { NextFunction, Request, Response } from "express";
import express from "express";
import { defineHttp, dev, middleware, prod } from "plainstack";
import WebSocket from "ws";

const redirects: Record<string, string> = {
  "/docs/environmet-variables": "/docs/environment-variables",
  "/docs": "/docs/getting-started",
  "/docs/task-queue": "/docs/background-jobs",
};

function redirect(req: Request, res: Response, next: NextFunction) {
  const target = redirects[req.path];
  if (target) {
    res.redirect(target);
  } else {
    next();
  }
}

export default defineHttp(async ({ http, paths }) => {
  const app = express();
  app.use(middleware.id());
  app.use(errorHandler());
  app.use(middleware.logging());
  app.use(redirect);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(middleware.database({ database }));
  app.use(middleware.loadConfig());
  if (dev()) app.use(http.staticPath, express.static(paths.out));
  if (dev()) app.use(middleware.pendingMigrations());
  if (prod()) app.use(middleware.forceWWW());
  if (prod()) app.use(middleware.rateLimit());
  app.use(await middleware.fileRouter());
  const server = httpServer.createServer(app);
  const wss = new WebSocket.Server({ server });
  await listenWebsocket(wss);
  server.listen(http.port);
  return app;
});

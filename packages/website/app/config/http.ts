import http from "node:http";
import database from "app/config/database";
import { listenWebsocket } from "app/services/confetti";
import errorHandler from "errorhandler";
import express from "express";
import { defineHttp, dev, middleware, prod } from "plainstack";
import WebSocket from "ws";

export default defineHttp(async ({ paths, port }) => {
  const app = express();
  app.use(middleware.id());
  app.use(errorHandler());
  app.use(middleware.logging());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(middleware.database({ database }));
  if (dev()) app.use("/public", express.static(paths.public));
  if (prod()) app.use(middleware.forceWWW());
  if (prod()) app.use(middleware.rateLimit());
  app.use(await middleware.fileRouter({ dir: paths.routes }));
  const server = http.createServer(app);
  const wss = new WebSocket.Server({ server });
  await listenWebsocket(wss);
  server.listen(port);
  return app;
});

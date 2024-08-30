import { env } from "app/config/env";
import express from "express";
import {
  defineMiddleware,
  getDatabase,
  middleware,
  unstable_admin,
} from "plainstack";

import basicAuth from "express-basic-auth";

export default defineMiddleware(async ({ app, config }) => {
  const { nodeEnv } = config;
  const database = getDatabase({ nodeEnv, database: config.database });
  app.use(middleware.forceWWW({ nodeEnv }));
  app.use(middleware.logging({ nodeEnv }));
  app.use(middleware.error({ nodeEnv }));
  // TODO use built-in middleware
  app.use(config.http.staticPath, express.static(config.paths.public));
  app.use(
    middleware.redirect({
      redirects: config.http.redirects,
    }),
  );
  app.use(middleware.rateLimit({ nodeEnv }));
  app.use(middleware.json());
  app.use(middleware.urlencoded());
  app.use(middleware.database({ database }));
  app.use(middleware.migrations(config));
  app.use(await middleware.fileRouter({ dir: config.paths.routes }));
  app.use(
    "/_",
    basicAuth({
      users: { admin: env.ADMIN_PASSWORD },
      challenge: true,
      unauthorizedResponse: () => {
        console.error("Unauthorized access to admin!");
      },
    }),
    await unstable_admin({ database, path: "/_" }),
  );
});

import { defineMiddleware, getDatabase, middleware } from "plainweb";

export default defineMiddleware(async ({ app, config }) => {
  const { nodeEnv } = config;
  const database = getDatabase({ nodeEnv, database: config.database });

  app.use(middleware.flyHeaders());
  app.use(middleware.forceWWW({ nodeEnv }));
  app.use(middleware.logging({ nodeEnv }));
  app.use(middleware.error({ nodeEnv }));
  app.use(
    middleware.redirect({
      redirects: config.http.redirects,
    }),
  );
  app.use(
    config.http.staticPath,
    middleware.staticFiles({
      nodeEnv,
      dir: config.paths.public,
    }),
  );
  app.use(middleware.rateLimit({ nodeEnv }));
  //app.use(middleware.security({ nodeEnv }));
  app.use(middleware.json());
  app.use(middleware.urlencoded());
  app.use(middleware.database({ database }));
  app.use(middleware.migrations(config));
  app.use(await middleware.fileRouter({ dir: config.paths.routes }));
});

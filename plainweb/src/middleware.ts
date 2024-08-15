import type { ExpandedPlainwebConfig, MiddlewareStackArgs } from "config";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import errorHandler from "errorhandler";
import express from "express";
import expressRateLimit from "express-rate-limit";
import helmet from "helmet";
import { randomId } from "id";
import { getLogger } from "log";
import morgan from "morgan";
import { fileRouter as plainFileRouter } from "./file-router";
import { hasPendingMigrations, migrate } from "./migrate";

const log = getLogger("middleware");

function preferHeader(
  request: express.Request,
  from: string,
  to: string,
): void {
  const preferredValue = request.get(from.toLowerCase());
  if (preferredValue == null) return;

  delete request.headers[to];
  request.headers[to.toLowerCase()] = preferredValue;
}

type Config = ExpandedPlainwebConfig<Record<string, unknown>>;

function flyHeaders(): express.RequestHandler {
  return function flyHeaders(req, res, next) {
    if (process.env.FLY_APP_NAME == null) return next();
    log.debug("setting fly headers");
    req.app.set("trust proxy", true);
    preferHeader(req, "Fly-Client-IP", "X-Forwarded-For");
    preferHeader(req, "Fly-Forwarded-Port", "X-Forwarded-Port");
    preferHeader(req, "Fly-Forwarded-Proto", "X-Forwarded-Protocol");
    preferHeader(req, "Fly-Forwarded-Ssl", "X-Forwarded-Ssl");
    return next();
  };
}

function migrations(
  config: Pick<Config, "database" | "paths" | "nodeEnv">,
): express.RequestHandler {
  return async (req, res, next) => {
    if (config.nodeEnv === "production") return next();
    log.info("checking for pending migrations");
    const pendingMigrations = await hasPendingMigrations(config);
    if (!pendingMigrations) return next();
    log.info("pending migrations found");
    await migrate(config);
    next();
  };
}

export function forceWWW(
  config: Pick<Config, "nodeEnv">,
): express.RequestHandler {
  return function forceWWW(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) {
    if (config.nodeEnv === "development") return next();
    const host = req.header("host");

    if (host) {
      const wwwRegex = /^www\./i;
      const isWww = wwwRegex.test(host);
      const isSubdomain = host.split(".").length > 2;

      if (!isWww && !isSubdomain) {
        const lowercaseHost = host.toLowerCase(); // Convert host to lowercase
        const newUrl = `https://www.${lowercaseHost}${req.url}`;
        log.info("redirecting to", newUrl);
        res.redirect(301, newUrl);
      } else {
        next();
      }
    } else {
      next();
    }
  };
}

function logging(config: Pick<Config, "nodeEnv">): express.RequestHandler {
  const logger = getLogger();
  return morgan(
    ":method :url :status :res[content-length] - :response-time ms",
    {
      stream: {
        write: (message) => logger.http(message.trim()),
      },
    },
  );
}

function error(config: Pick<Config, "nodeEnv">): express.ErrorRequestHandler {
  if (config.nodeEnv === "development") return errorHandler();
  return (err, req, res, next) => {
    log.error(err);
    next(err);
  };
}

function security(config: Pick<Config, "nodeEnv">): express.RequestHandler {
  return (req, res, next) => {
    if (config.nodeEnv === "development") return next();
    return helmet();
  };
}

function staticFiles({
  nodeEnv,
  dir,
}: {
  nodeEnv: "development" | "production" | "test";
  dir: string;
}): express.RequestHandler {
  if (nodeEnv === "development") return express.static(dir);
  return (req, res, next) => next();
}

function rateLimit({
  nodeEnv,
  rateLimit,
}: {
  nodeEnv: "development" | "production" | "test";
  rateLimit?: { windowMs?: number; limit?: number; message?: string };
}): express.RequestHandler {
  if (nodeEnv !== "development") return (req, res, next) => next();
  return expressRateLimit({
    windowMs: rateLimit?.windowMs ?? 60 * 1000,
    limit: rateLimit?.limit ?? 60,
    message:
      rateLimit?.message ??
      "Too many requests, please try again in a few seconds",
  });
}

function redirect({
  redirects,
}: {
  redirects: Record<string, string>;
}): express.RequestHandler {
  return (req, res, next) => {
    const target = redirects[req.path];
    if (target) {
      log.info("redirecting to", target);
      res.redirect(target);
    } else {
      next();
    }
  };
}

function json(): express.RequestHandler {
  return express.json();
}

function urlencoded(): express.RequestHandler {
  return express.urlencoded({ extended: true });
}

function database<T extends Record<string, unknown>>({
  database,
}: {
  database: BetterSQLite3Database<T>;
}): express.RequestHandler {
  return (req, res, next) => {
    log.debug("attach database to request");
    res.locals.database = database;
    next();
  };
}

async function fileRouter({
  dir,
}: {
  dir: string;
}): Promise<express.RequestHandler> {
  return plainFileRouter({ dir });
}

// TODO use async local storage
function id(): express.RequestHandler {
  return (req, res, next) => {
    res.locals.id = randomId("req");
    next();
  };
}

/** A collection of built-in express middleware. */
export const middleware = {
  flyHeaders,
  forceWWW,
  logging,
  error,
  redirect,
  staticFiles,
  rateLimit,
  security,
  json,
  urlencoded,
  database,
  fileRouter,
  migrations,
  id,
};

/**
 * Define a middleware stack.
 * The order of middleware matters, the first middleware in the stack will be executed first.
 * */
export function defineMiddleware(
  stack: (opts: MiddlewareStackArgs) => Promise<void> | void,
) {
  return stack;
}

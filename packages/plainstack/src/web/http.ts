import type express from "express";
import type { Application } from "express";
import expressListEndpoints from "express-list-endpoints";
import expressRateLimit from "express-rate-limit";
import morgan from "morgan";
import { type Config, loadAndGetConfig } from "../bootstrap/config";
import { registerAppLoader } from "../bootstrap/load";
import {
  type GenericDatabase,
  hasPendingMigrations,
} from "../database/database";
import { randomId } from "../id";
import { getLogger } from "../log";
import { fileRouter as plainFileRouter } from "./file-router";

export function forceWWW(): express.RequestHandler {
  return function forceWWW(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) {
    const log = getLogger("www");
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

function logging(): express.RequestHandler {
  const logger = getLogger();
  return morgan(
    ":method :url :status :res[content-length] - :response-time ms",
    {
      stream: {
        write: (message) => logger.log(message.trim()),
      },
    },
  );
}

function rateLimit(opts?: {
  rateLimit?: { windowMs?: number; limit?: number; message?: string };
}): express.RequestHandler {
  const rateLimit = opts?.rateLimit;
  return expressRateLimit({
    windowMs: rateLimit?.windowMs ?? 60 * 1000,
    limit: rateLimit?.limit ?? 60,
    message:
      rateLimit?.message ??
      "Too many requests, please try again in a few seconds",
  });
}

function database({
  database,
}: {
  database: GenericDatabase;
}): express.RequestHandler {
  return (req, res, next) => {
    const log = getLogger("middleware");
    log.debug("attach database to request");
    res.locals.database = database;
    next();
  };
}

function pendingMigrations(): express.RequestHandler {
  return async (req, res, next) => {
    const log = getLogger("middleware");
    log.debug("checking for pending migrations");
    const pendingMigrations = await hasPendingMigrations();
    if (!pendingMigrations) return next();
    log.warn(
      "there are pending migrations, run `plainstack migrate` to apply them",
    );
    next();
  };
}

async function fileRouter(): Promise<express.RequestHandler> {
  registerAppLoader(); // why is this needed?
  const { router } = await plainFileRouter();
  return router;
}

function loadConfig(): express.RequestHandler {
  return (req, res, next) => {
    if (!res.locals.config) {
      loadAndGetConfig().then((config) => {
        next();
      });
    }
  };
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
  forceWWW,
  logging,
  rateLimit,
  database,
  fileRouter,
  id,
  pendingMigrations,
  loadConfig,
};

/** Print all express routes to the console. Useful for debugging. */
export async function printRoutes(app: Express.Application) {
  const endpoints = expressListEndpoints(app);
  const sorted = endpoints.sort((a, b) => {
    if (a.path < b.path) return -1;
    if (a.path > b.path) return 1;
    return 0;
  });
  console.log("Routes:");
  for (const endpoint of sorted) {
    for (const method of endpoint.methods) {
      console.log(method, endpoint.path);
    }
  }
}

export function isHttp(
  m: unknown,
): m is (config: Config) => Promise<express.Application> {
  return typeof m === "function";
}

export function defineHttp(
  handler: (config: Config) => Promise<express.Application>,
) {
  return handler;
}

export type HttpServer = {
  start: () => Promise<Application>;
};

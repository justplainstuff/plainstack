import type express from "express";
import expressRateLimit from "express-rate-limit";
import type { Kysely } from "kysely";
import morgan from "morgan";
import type { InputConfig } from "./config";
import { fileRouter as plainFileRouter } from "./file-router";
import { randomId } from "./id";
import { getLogger } from "./log";

const log = getLogger("middleware");

export function forceWWW(): express.RequestHandler {
  return function forceWWW(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) {
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
        write: (message) => logger.http(message.trim()),
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
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  database: Kysely<any>;
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
  forceWWW,
  logging,
  rateLimit,
  database,
  fileRouter,
  id,
};

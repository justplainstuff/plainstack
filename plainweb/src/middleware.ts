import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type express from "express";
import { NextFunction } from "express";
import { hasPendingMigrations } from "./migrate";

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

export const flyHeaders: express.RequestHandler = function flyHeaders(
  req,
  res,
  next,
) {
  if (process.env.FLY_APP_NAME == null) return next();

  req.app.set("trust proxy", true);

  preferHeader(req, "Fly-Client-IP", "X-Forwarded-For");
  preferHeader(req, "Fly-Forwarded-Port", "X-Forwarded-Port");
  preferHeader(req, "Fly-Forwarded-Proto", "X-Forwarded-Protocol");
  preferHeader(req, "Fly-Forwarded-Ssl", "X-Forwarded-Ssl");

  return next();
};

// TODO implement
function pendingMigrations<T extends Record<string, unknown>>({
  database,
}: {
  database: BetterSQLite3Database<T>;
}): express.RequestHandler {
  return async (req, res, next) => {
    const pending = await hasPendingMigrations(database);
    if (pending) {
      res
        .status(500)
        .send("There are pending migrations. Run `pnpm update` to apply them.");
    } else {
      next();
    }
  };
}

export function redirectWWW(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
): void {
  const host = req.header("host");

  if (host) {
    const wwwRegex = /^www\./i;
    const isWww = wwwRegex.test(host);
    const isSubdomain = host.split(".").length > 2;

    if (!isWww && !isSubdomain) {
      const lowercaseHost = host.toLowerCase(); // Convert host to lowercase
      const newUrl = `https://www.${lowercaseHost}${req.url}`;
      res.redirect(301, newUrl);
    } else {
      next();
    }
  } else {
    next();
  }
}

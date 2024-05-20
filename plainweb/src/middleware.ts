import express from "express";

function preferHeader(
  request: express.Request,
  from: string,
  to: string
): void {
  const preferredValue = request.get(from.toLowerCase());
  if (preferredValue == null) return;

  delete request.headers[to];
  request.headers[to.toLowerCase()] = preferredValue;
}

export const flyHeaders: express.RequestHandler = function flyHeaders(
  req,
  res,
  next
) {
  if (process.env.FLY_APP_NAME == null) return next();

  req.app.set("trust proxy", true);

  preferHeader(req, "Fly-Client-IP", "X-Forwarded-For");
  preferHeader(req, "Fly-Forwarded-Port", "X-Forwarded-Port");
  preferHeader(req, "Fly-Forwarded-Proto", "X-Forwarded-Protocol");
  preferHeader(req, "Fly-Forwarded-Ssl", "X-Forwarded-Ssl");

  return next();
};

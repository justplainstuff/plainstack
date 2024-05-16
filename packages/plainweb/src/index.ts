export type PlainWebConfig = {
  port: string;
};

export { fileRouter } from "./file-router";
export { type HandlerArgs, type RouteHandler } from "./file-router";
export { html } from "./plain-response";

import { IncomingMessage, ServerResponse } from "node:http";

export type PlainWebConfig = {
  port: string;
};

export type GetHandler = (opts: {
  req: IncomingMessage;
  res: ServerResponse;
  params: Record<string, string>;
}) => void;
export type PostHandler = (opts: {
  req: IncomingMessage;
  res: ServerResponse;
  params: Record<string, string>;
}) => void;

export type RouteOpts =
  | {
      GET: GetHandler;
    }
  | { POST: PostHandler }
  | {
      GET: GetHandler;
      POST: PostHandler;
    };

export function route(opts: RouteOpts) {}

export type Component = Promise<string> | string;

export function render(
  res: ServerResponse,
  html: Component,
  opts?: { layout: Component }
) {}

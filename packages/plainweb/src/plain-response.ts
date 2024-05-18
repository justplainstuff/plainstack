import "@kitajs/html";
import express from "express";
import { FlashMessage } from "./flash-message";
import { renderToStream } from "@kitajs/html/suspense";

export interface PlainResponse {
  headers?: Record<string, string>;
  status?: number;
  body?: string | Promise<string>;
  htmlStream?: (rid: number | string) => JSX.Element;
}

export async function sendPlainResponse(
  res: express.Response,
  plainResponse: PlainResponse
) {
  if (res.headersSent) {
    console.warn("Headers already sent, cannot send response");
    return;
  }

  if (plainResponse.headers) {
    for (const [key, value] of Object.entries(plainResponse.headers)) {
      res.setHeader(key, value);
    }
  }

  if (plainResponse.status) {
    res.status(plainResponse.status);
  }

  // body

  if (plainResponse.body) {
    res.send(await plainResponse.body);
  } else if (plainResponse.htmlStream) {
    const htmlStream = renderToStream(plainResponse.htmlStream);
    htmlStream.pipe(res);
  }
}

export function html(
  res: express.Response,
  html: Promise<string> | string
): PlainResponse {
  return {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
    body: html,
  };
}

export function stream(
  res: express.Response,
  htmlStream: (rid: number | string) => JSX.Element
): PlainResponse {
  return {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
    htmlStream,
  };
}

export function redirect(
  res: express.Response,
  path: string,
  opts: { message?: FlashMessage }
): PlainResponse {
  // TODO store flash message
  return {
    status: 302,
    headers: {
      Location: path,
    },
  };
}

export function json(res: express.Response, json: unknown): PlainResponse {
  return {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(json),
  };
}

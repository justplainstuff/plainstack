import express from "express";
import { FlashMessage } from "./flash-message";

export interface PlainResponse {
  headers?: Record<string, string>;
  status?: number;
  body?: string | Promise<string>;
}

export async function sendPlainResponse(
  res: express.Response,
  plainResponse: PlainResponse
) {
  if (res.headersSent) {
    console.warn("headers already sent, cannot send response");
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

  if (plainResponse.body) {
    res.send(await plainResponse.body);
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

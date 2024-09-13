import "@kitajs/html";
import { renderToStream } from "@kitajs/html/suspense";
import type express from "express";
import type { JSONSerializable } from "./handler";

export interface PlainResponse {
  _tag: "PlainResponse";
  headers?: Record<string, string>;
  status?: number;
  body?: string | Promise<string>;
  htmlStream?: (rid: number | string) => JSX.Element;
}

export function isPlainResponse(r: unknown): r is PlainResponse {
  return (r as PlainResponse)._tag === "PlainResponse";
}

export async function sendPlainResponse(
  res: express.Response,
  plainResponse: PlainResponse,
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
    htmlStream.on("end", () => {
      res.end();
    });
    htmlStream.on("error", (err) => {
      console.error("Error streaming response", err);
    });
  } else {
    console.error("No body or htmlStream provided");
    res.end();
  }
}

/** Return a HTML response with Content-Type set to text/html. */
export function html(
  html: Promise<string> | string,
  opts?: { status?: number },
): PlainResponse {
  return {
    _tag: "PlainResponse",
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
    body: html,
    status: opts?.status,
  };
}

/**
 * Stream a HTML response with Content-Type set to text/html.
 * Cache-Control is set to no-transform to prevent caching.
 */
export function stream(
  htmlStream: (rid: number | string) => JSX.Element,
): PlainResponse {
  return {
    _tag: "PlainResponse",
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-transform",
    },
    htmlStream,
  };
}

/**
 * Redirect to a new path.
 * The status code defaults to 302.
 */
export function redirect(
  path: string,
  opts?: { status?: number },
): PlainResponse {
  return {
    _tag: "PlainResponse",
    status: opts?.status ?? 302,
    headers: {
      Location: path,
    },
  };
}

/** Return a JSON response with Content-Type set to application/json. */
export function json(
  json: JSONSerializable,
  opts?: { status?: number },
): PlainResponse {
  return {
    _tag: "PlainResponse",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(json),
    status: opts?.status,
  };
}

/** Return a 404 response. */
export function notFound(): PlainResponse {
  return {
    _tag: "PlainResponse",
    status: 404,
    body: "Not Found",
  };
}

import "@kitajs/html";
import express from "express";
import { FlashMessage } from "./flash-message";
import { renderToStream } from "@kitajs/html/suspense";

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
    htmlStream.on("end", () => {
      res.end();
    });
    htmlStream.on("error", (err) => {
      console.error("Error streaming response", err);
    });
  } else {
    res.end();
  }
}

export function html(html: Promise<string> | string): PlainResponse {
  return {
    _tag: "PlainResponse",
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
    body: html,
  };
}

export function stream(
  htmlStream: (rid: number | string) => JSX.Element
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

export function redirect(
  path: string,
  opts: { message?: FlashMessage }
): PlainResponse {
  // TODO store flash message
  return {
    _tag: "PlainResponse",
    status: 302,
    headers: {
      Location: path,
    },
  };
}

// TODO add JSONSerislizable as type
export function json(json: unknown): PlainResponse {
  return {
    _tag: "PlainResponse",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(json),
  };
}

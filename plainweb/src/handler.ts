import express from "express";
import {
  PlainResponse,
  html,
  isPlainResponse,
  sendPlainResponse,
} from "./plain-response";

export interface HandlerArgs {
  req: express.Request;
  res: express.Response;
}

export type JSONSerializable =
  | string
  | number
  | boolean
  | null
  | JSONSerializable[]
  | { [key: string]: JSONSerializable };

export type Handler = (
  args: HandlerArgs
) => Promise<PlainResponse | JSX.Element | JSONSerializable>;

// escape hatch so users can use the express.Response API directly
export type ExpressResponse = () => void;

export async function handleResponse(
  res: express.Response,
  userResponse: PlainResponse | JSX.Element | JSONSerializable | ExpressResponse
) {
  if (isPlainResponse(userResponse)) {
    await sendPlainResponse(res, userResponse);
  } else if (
    typeof userResponse === "string" ||
    (typeof userResponse === "object" && userResponse instanceof Promise)
  ) {
    // assume it's a JSX.Element
    res.set("Content-Type", "text/html");
    res.send(await userResponse);
    await sendPlainResponse(res, html(userResponse));
  } else if (typeof userResponse === "object") {
    // assume it's a JSON
    res.json(userResponse);
  } else if (typeof userResponse === "function") {
    // assume it's an express response
    userResponse();
  } else {
    throw new Error("Unexpected response type");
  }
}

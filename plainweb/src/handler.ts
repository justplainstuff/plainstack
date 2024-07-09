import type express from "express";
import {
  type PlainResponse,
  html,
  isPlainResponse,
  json,
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
  args: HandlerArgs,
) => Promise<ExpressResponse | PlainResponse | JSX.Element | JSONSerializable>;

// escape hatch so users can use the express.Response API directly
export type ExpressResponse = () => void;

export async function handleResponse(
  res: express.Response,
  userResponse:
    | PlainResponse
    | JSX.Element
    | JSONSerializable
    | ExpressResponse,
) {
  if (isPlainResponse(userResponse)) {
    await sendPlainResponse(res, userResponse);
  } else if (
    typeof userResponse === "string" ||
    (typeof userResponse === "object" && userResponse instanceof Promise)
  ) {
    // assume it's a JSX.Element
    await sendPlainResponse(res, html(userResponse));
    return;
  } else if (typeof userResponse === "object") {
    // assume it's a JSON
    await sendPlainResponse(res, json(userResponse));
    return;
  } else if (typeof userResponse === "function") {
    // assume it's an express response
    userResponse();
    return;
  } else {
    throw new Error("Unexpected response type");
  }
}

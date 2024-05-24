export type PlainWebConfig = {
  port: string;
};

export { fileRouter } from "./file-router";
export {
  type HandlerArgs,
  type Handler,
  type JSONSerializable,
  type ExpressResponse,
} from "./handler";
export { html, json, redirect, stream } from "./plain-response";
export { flyHeaders } from "./middleware";
export { isolate } from "./isolate";
export { migrate } from "./migrate";

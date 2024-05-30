export type PlainWebConfig = {
  port: string;
};

export { type FileRoute, fileRouter } from "./file-router";
export {
  type HandlerArgs,
  type Handler,
  type JSONSerializable,
  type ExpressResponse,
} from "./handler";
export { html, json, redirect, stream, notFound } from "./plain-response";
export { flyHeaders, redirectWWW } from "./middleware";
export { isolate } from "./isolate";
export { testHandler } from "./test-handler";
export { type Task, runTasks, perform, type DefineTaskOpts } from "./task/task";
export { type Database, defineDatabaseTask } from "./task/database";
export { defineInmemoryTask } from "./task/inmemory";
export { outbox, sendMail, useTransporter } from "./mail";
export { migrate } from "./migrate";
export { admin } from "./admin/admin";

// http & web
export { type FileRoute, fileRouter } from "./file-router";
export {
  type HandlerArgs,
  type Handler,
  type JSONSerializable,
  type ExpressResponse,
} from "./handler";
export { html, json, redirect, stream, notFound } from "./plain-response";
export { flyHeaders, redirectWWW } from "./middleware";
export { printRoutes } from "./print-routes";

// mail
export { outbox, sendMail, useTransporter } from "./mail";

// testing
export { isolate } from "./isolate";
export { migrate } from "./migrate";
export { testHandler } from "./test-handler";

// tasks
export { type Task, runTasks, perform, type DefineTaskOpts } from "./task/task";
export { type Database, defineDatabaseTask } from "./task/database";
export { defineInmemoryTask } from "./task/inmemory";

// unstable
import { adminRouter } from "./admin/admin";
export const unstable_admin = adminRouter;

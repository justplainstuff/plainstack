// import express from "express";
// import type { ExpandedPlainwebConfig, MailConfig } from "./config";

// /** Return the express app instance given a plainweb config. */
// export async function getApp<T extends Record<string, unknown>>(
//   config: ExpandedPlainwebConfig<T, MailConfig | undefined>,
// ): Promise<express.Express> {
//   const app = express();
//   await config.http.middleware({ app, config });
//   return app;
// }

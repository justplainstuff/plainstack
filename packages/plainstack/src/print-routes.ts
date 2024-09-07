import type { ExpandedPlainwebConfig } from "config";
import type { Express } from "express";
import expressListEndpoints from "express-list-endpoints";

/** Print all express routes to the console. Useful for debugging. */
export async function printRoutes<T extends Record<string, unknown>>(
  app: Express.Application,
) {
  const endpoints = expressListEndpoints(app);
  const sorted = endpoints.sort((a, b) => {
    if (a.path < b.path) return -1;
    if (a.path > b.path) return 1;
    return 0;
  });
  console.log("Routes:");
  for (const endpoint of sorted) {
    for (const method of endpoint.methods) {
      console.log(method, endpoint.path);
    }
  }
}

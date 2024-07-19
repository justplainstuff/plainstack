import type { ExpandedPlainwebConfig, MailConfig } from "config";
import expressListEndpoints from "express-list-endpoints";
import { getApp } from "get-app";

/** Print all express routes to the console. Useful for debugging. */
export async function printRoutes<T extends Record<string, unknown>>(
  config: ExpandedPlainwebConfig<T, MailConfig | undefined>,
) {
  const app = await getApp(config);
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

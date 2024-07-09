import type express from "express";
import expressListEndpoints from "express-list-endpoints";

export async function printRoutes(app: express.Express) {
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

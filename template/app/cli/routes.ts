import expressListEndpoints from "express-list-endpoints";
import { http } from "~/app/config/http";

/**
 * Print all express routes to the console.
 */
async function routes() {
  const endpoints = expressListEndpoints(await http());
  for (const endpoint of endpoints) {
    console.log(endpoint.methods.join(" "), endpoint.path);
  }
}

void routes();

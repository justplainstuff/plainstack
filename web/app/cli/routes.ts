import { app } from "app/config/http";
import { printRoutes } from "plainweb";

/**
 * Print all express routes to the console.
 */
async function routes() {
  printRoutes(await app());
}

void routes();

import { printRoutes } from "plainweb";
import { app } from "~/app/config/http";

/**
 * Print all express routes to the console.
 */
async function routes() {
  printRoutes(await app());
}

void routes();

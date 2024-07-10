import { debug, env } from "app/config/env";
import { app } from "app/config/http";

/**
 * Start the HTTP server.
 */
async function serve() {
  (await app()).listen(env.PORT);
  debug && console.log(`⚡️ http://localhost:${env.PORT}`);
}

serve();

import { debug, env } from "~/app/config/env";
import { http } from "~/app/config/http";

/**
 * Start the HTTP server.
 */
async function serve() {
  (await http()).listen(env.PORT);
  debug && console.log(`⚡️ http://localhost:${env.PORT}`);
}

serve();

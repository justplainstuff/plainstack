import { debug, env } from "~/app/config/env";
import { http } from "~/app/config/http";

async function serve() {
  await http();
  debug && console.log(`⚡️ http://localhost:${env.PORT}`);
}

serve();

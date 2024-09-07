import { env } from "app/config/env";
import { http } from "app/config/http";
import { defineCommand, log } from "plainstack";

export default defineCommand(
  async (config) => {
    const app = await http(config);
    app.listen(env.PORT);
    log.info(`⚡️ http://localhost:${env.PORT}`);
  },
  {
    help: "Start the HTTP server",
  },
);

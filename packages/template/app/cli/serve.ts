import { env } from "app/config/env";
import { defineCommand, log } from "plainstack";

export default defineCommand(
  async ({ app }) => {
    app.listen(env.PORT);
    log.info(`⚡️ http://localhost:${env.PORT}`);
  },
  {
    help: "Start the HTTP server",
  },
);

import { defineCommand, printRoutes } from "plainstack";

export default defineCommand(
  async ({ app }) => {
    await printRoutes(app);
  },
  {
    help: "Print all express routes to the console",
  },
);

import { http } from "app/config/http";
import { defineCommand, printRoutes } from "plainstack";

export default defineCommand(
  async (config) => {
    const app = await http(config);
    await printRoutes(app);
  },
  {
    help: "Print all express routes to the console",
  },
);

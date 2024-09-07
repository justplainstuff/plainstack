import { defineCommand, printRoutes } from "plainstack";

export default defineCommand(printRoutes, {
  help: "Print all express routes to the console",
});

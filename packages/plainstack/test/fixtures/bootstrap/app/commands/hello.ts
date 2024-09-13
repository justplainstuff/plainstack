import { defineCommand } from "citty";

export default defineCommand({
  run: async () => {
    console.log("Hello from a command!");
  },
});

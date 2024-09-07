import { defineCommand, log, work } from "plainstack";

export default defineCommand(
  async () => {
    await work();
  },
  {
    help: "Start the background task worker",
  },
);

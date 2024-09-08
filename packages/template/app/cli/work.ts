import { defineCommand, log, work } from "plainstack";

export default defineCommand(
  async () => {
    await work();
    log.info("⚡️ Started background worker");
  },
  {
    help: "Start the background task worker",
  },
);

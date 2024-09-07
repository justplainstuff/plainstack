import type { Config } from "./config";

export function defineCommand(
  handler: (args: Config) => Promise<void>,
  opts: {
    help?: string;
  },
) {
  return {
    help: opts.help,
    handler,
  };
}

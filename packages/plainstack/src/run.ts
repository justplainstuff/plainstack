import { defineCommand, loadCommands, runCommand } from "./command";
import { type PlainWebConfig, expandConfig } from "./config";

const dev = defineCommand(
  async ({ app }) => {
    // dev": "npm-run-all --parallel \"tsx watch app/cli/serve.ts\" \"tailwindcss -i ./app/styles.css -o ./public/output.css --watch\"",
  },
  {
    help: "Start the HTTP server",
  },
);

export async function run(config: PlainWebConfig) {
  const expandedConfig = await expandConfig(config);
  const commands = await loadCommands(expandedConfig);
  await runCommand(expandedConfig, commands);
}

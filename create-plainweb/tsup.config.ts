import { defineConfig } from "tsup";

export default defineConfig({
  target: "node18",
  format: ["cjs"],
  entry: ["src/cli.ts"],
  outDir: "dist",
  splitting: false,
  sourcemap: true,
  clean: true,
});

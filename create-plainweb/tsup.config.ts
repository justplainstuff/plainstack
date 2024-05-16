import { defineConfig } from "tsup";

export default defineConfig({
  target: "node18",
  noExternal: ["ora"],
  format: ["cjs"],
  entry: ["src/cli.ts"],
  outDir: "dist",
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
});

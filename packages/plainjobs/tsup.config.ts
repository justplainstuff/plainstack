import { defineConfig } from "tsup";

export default defineConfig({
  target: "node20",
  format: ["cjs"],
  entry: ["src/plainjobs.ts"],
  external: [],
  dts: true,
  outDir: "dist",
  splitting: false,
  sourcemap: true,
  clean: true,
});

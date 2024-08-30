import { defineConfig } from "tsup";

export default defineConfig({
  target: "node20",
  format: ["cjs"],
  entry: ["src/plainstudio.ts"],
  external: [],
  dts: true,
  outDir: "dist",
  splitting: false,
  sourcemap: true,
  clean: true,
});

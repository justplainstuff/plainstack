import { defineConfig } from "tsup";

export default defineConfig({
  target: "node20",
  format: ["cjs"],
  entry: ["src/index.ts"],
  dts: true,
  outDir: "dist",
  splitting: false,
  sourcemap: true,
  clean: true,
});

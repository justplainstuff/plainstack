import { defineConfig } from "tsup";

export default defineConfig({
  target: "node18",
  format: ["cjs"],
  entry: ["src/create-plainstack.ts"],
  outDir: "dist",
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
});

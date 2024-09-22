import { defineConfig } from "tsup";

export default defineConfig({
  target: "node22",
  format: ["esm"],
  entry: [
    "src/plainstack.ts",
    "src/bin/bin.ts",
    "src/bin/bin-dev.ts",
    "src/bin/bin-work.ts",
  ],
  dts: true,
  outDir: "dist",
  splitting: false,
  sourcemap: true,
  clean: true,
});

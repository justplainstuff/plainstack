import { defineConfig } from "tsup";

export default defineConfig({
  target: "node22",
  format: ["esm"],
  entry: [
    "src/plainstack.ts",
    "src/bun.ts",
    "src/middleware/session.ts",
    "src/db.ts",
  ],
  external: ["bun:sqlite"],
  dts: true,
  outDir: "dist",
  splitting: false,
  sourcemap: true,
  clean: true,
});

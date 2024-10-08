import { defineConfig } from "tsup";

export default defineConfig({
  target: "esnext",
  format: ["esm"],
  entry: [
    "src/plainstack.ts",
    "src/bun.ts",
    "src/middleware/session.ts",
    "src/db.ts",
    "src/client.tsx",
  ],
  external: ["bun:sqlite"],
  dts: true,
  outDir: "dist",
  splitting: false,
  sourcemap: true,
  clean: true,
});

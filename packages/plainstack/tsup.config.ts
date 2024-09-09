import { defineConfig } from "tsup";

export default defineConfig({
  target: "node20",
  format: ["cjs"],
  entry: ["src/plainstack.ts", "src/bin.ts"],
  external: ["esbuild", "zod", "tsx", "@kitajs/html"],
  dts: true,
  outDir: "dist",
  splitting: false,
  sourcemap: true,
  clean: true,
});

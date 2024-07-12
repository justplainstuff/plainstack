import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "tsup";

// load ./output.css with syncn node api
// and return content as string
function loadStyles() {
  const filePath = path.join(__dirname, "output.css");
  const content = fs.readFileSync(filePath, "utf-8");
  return content;
}

export default defineConfig({
  target: "node20",
  format: ["cjs"],
  entry: ["src/index.ts"],
  env: {
    ADMIN_STYLES: loadStyles(),
  },
  dts: true,
  outDir: "dist",
  splitting: false,
  sourcemap: true,
  clean: true,
});

import { getConfig } from "./bootstrap/config";

/**
 * Return the HTTP static path for a given asset path.
 * Refer to the raw assets, not the transpiled assets.
 *
 * Example:
 * asset("scripts.ts") // returns "/public/scripts.js"
 */
export function asset(path: string): string {
  const config = getConfig();
  const transpiledPath = path.replace(/\.ts$/, ".js");
  return `${config.http.staticPath}/${transpiledPath}`;
}

import { LogLevels, createConsola } from "consola";
import { config } from "./config";

export function getLogger(name?: string) {
  const consola = createConsola({
    level: config?.logger?.level ?? LogLevels.info,
    reporters: [],
  });
  return name ? consola.withTag(name) : consola;
}

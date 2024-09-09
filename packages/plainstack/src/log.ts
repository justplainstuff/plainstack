import consola from "consola";
import { type Config, getConfig } from "./config";

export function getLogger(name?: string) {
  let config: Config | undefined;
  try {
    config = getConfig();
  } catch (e) {}
  for (const reporter of config?.logger?.reporters ?? []) {
    consola.addReporter(reporter);
  }
  return name ? consola.withTag(name) : consola;
}

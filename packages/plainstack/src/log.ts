import consola, { type ConsolaReporter, LogLevels } from "consola";
import { type Config, defaultConfig, getConfig } from "./bootstrap/config";

export type LogLevel = "error" | "warn" | "normal" | "info" | "debug" | "trace";

export function isLogger(m: unknown): m is ConsolaReporter {
  return typeof m === "object" && m !== null && "log" in m;
}

function getConsolaLevel(level: LogLevel): number {
  switch (level) {
    case "error":
      return 0;
    case "warn":
      return 1;
    case "normal":
      return 2;
    case "info":
      return 3;
    case "debug":
      return 4;
    case "trace":
      return 5;
    default:
      // normal
      return 3;
  }
}

export function getLogger(name?: string) {
  let config: Config | undefined;
  try {
    config = getConfig();
  } catch (e) {}
  consola.level = getConsolaLevel(
    config?.logger?.level ?? defaultConfig.logger.level,
  );
  if (process.env.DEBUG) {
    consola.level = LogLevels.debug;
  }
  return name ? consola.withTag(name) : consola;
}

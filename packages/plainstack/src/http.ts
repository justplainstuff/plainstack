import type express from "express";
import type { HttpConfig } from "./config";

export function defineHttp(
  handler: (config: HttpConfig) => Promise<express.Application>,
) {
  return handler;
}

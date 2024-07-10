import fs from "node:fs";
import os from "node:os";
// Adapted from https://github.com/remix-run/remix/blob/main/packages/create-remix/copy-template.ts
// MIT License Copyright (c) Remix Software Inc. 2020-2021 Copyright (c) Shopify Inc. 2022-2024
import path from "node:path";
import process from "node:process";
import type { Key as ActionKey } from "node:readline";
import chalk from "chalk";
import recursiveReaddir from "recursive-readdir";
import { cursor, erase } from "sisteransi";

// https://no-color.org/
const SUPPORTS_COLOR = chalk.supportsColor && !process.env.NO_COLOR;

export const color = {
  supportsColor: SUPPORTS_COLOR,
  heading: safeColor(chalk.bold),
  arg: safeColor(chalk.yellowBright),
  error: safeColor(chalk.red),
  warning: safeColor(chalk.yellow),
  hint: safeColor(chalk.blue),
  bold: safeColor(chalk.bold),
  black: safeColor(chalk.black),
  white: safeColor(chalk.white),
  blue: safeColor(chalk.blue),
  cyan: safeColor(chalk.cyan),
  red: safeColor(chalk.red),
  yellow: safeColor(chalk.yellow),
  green: safeColor(chalk.green),
  blackBright: safeColor(chalk.blackBright),
  whiteBright: safeColor(chalk.whiteBright),
  blueBright: safeColor(chalk.blueBright),
  cyanBright: safeColor(chalk.cyanBright),
  redBright: safeColor(chalk.redBright),
  yellowBright: safeColor(chalk.yellowBright),
  greenBright: safeColor(chalk.greenBright),
  bgBlack: safeColor(chalk.bgBlack),
  bgWhite: safeColor(chalk.bgWhite),
  bgBlue: safeColor(chalk.bgBlue),
  bgCyan: safeColor(chalk.bgCyan),
  bgRed: safeColor(chalk.bgRed),
  bgYellow: safeColor(chalk.bgYellow),
  bgGreen: safeColor(chalk.bgGreen),
  bgBlackBright: safeColor(chalk.bgBlackBright),
  bgWhiteBright: safeColor(chalk.bgWhiteBright),
  bgBlueBright: safeColor(chalk.bgBlueBright),
  bgCyanBright: safeColor(chalk.bgCyanBright),
  bgRedBright: safeColor(chalk.bgRedBright),
  bgYellowBright: safeColor(chalk.bgYellowBright),
  bgGreenBright: safeColor(chalk.bgGreenBright),
  gray: safeColor(chalk.gray),
  dim: safeColor(chalk.dim),
  reset: safeColor(chalk.reset),
  inverse: safeColor(chalk.inverse),
  hex: (color: string) => safeColor(chalk.hex(color)),
  underline: chalk.underline,
};

function safeColor(style: chalk.Chalk) {
  return SUPPORTS_COLOR ? style : identity;
}

export function isInteractive() {
  // Support explicit override for testing purposes
  if ("CREATE_REMIX_FORCE_INTERACTIVE" in process.env) {
    return true;
  }

  // Adapted from https://github.com/sindresorhus/is-interactive
  return Boolean(
    process.stdout.isTTY &&
      process.env.TERM !== "dumb" &&
      !("CI" in process.env),
  );
}

export function log(message: string) {
  return process.stdout.write(`${message}\n`);
}

const stderr = process.stderr;

function logError(message: string) {
  return stderr.write(`${message}\n`);
}

function logBullet(
  logger: typeof log | typeof logError,
  colorizePrefix: <V>(v: V) => V,
  colorizeText: <V>(v: V) => V,
  symbol: string,
  prefix: string,
  text?: string | string[],
) {
  const textParts = Array.isArray(text) ? text : [text || ""].filter(Boolean);
  const formattedText = textParts
    .map((textPart) => colorizeText(textPart))
    .join("");

  if (process.stdout.columns < 80) {
    logger(
      `${" ".repeat(5)} ${colorizePrefix(symbol)}  ${colorizePrefix(prefix)}`,
    );
    logger(`${" ".repeat(9)}${formattedText}`);
  } else {
    logger(
      `${" ".repeat(5)} ${colorizePrefix(symbol)}  ${colorizePrefix(
        prefix,
      )} ${formattedText}`,
    );
  }
}

export function debug(prefix: string, text?: string | string[]) {
  logBullet(log, color.yellow, color.dim, "●", prefix, text);
}

export function info(prefix: string, text?: string | string[]) {
  logBullet(log, color.cyan, color.dim, "◼", prefix, text);
}

export function error(prefix: string, text?: string | string[]) {
  log("");
  logBullet(logError, color.red, color.error, "▲", prefix, text);
}

export function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function toValidProjectName(projectName: string) {
  if (isValidProjectName(projectName)) {
    return projectName;
  }
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/^[._]/, "")
    .replace(/[^a-z\d\-~]+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

function isValidProjectName(projectName: string) {
  return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(
    projectName,
  );
}

function identity<V>(v: V) {
  return v;
}

export function strip(str: string) {
  const pattern = [
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PRZcf-ntqry=><~]))",
  ].join("|");
  const RGX = new RegExp(pattern, "g");
  return typeof str === "string" ? str.replace(RGX, "") : str;
}

export function isValidJsonObject(
  obj: unknown,
): obj is Record<string, unknown> {
  return !!(obj && typeof obj === "object" && !Array.isArray(obj));
}

async function directoryExists(p: string) {
  try {
    const stat = await fs.promises.stat(p);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

async function fileExists(p: string) {
  try {
    const stat = await fs.promises.stat(p);
    return stat.isFile();
  } catch {
    return false;
  }
}

export async function ensureDirectory(dir: string) {
  if (!(await directoryExists(dir))) {
    await fs.promises.mkdir(dir, { recursive: true });
  }
}

export function isUrl(value: string | URL) {
  try {
    new URL(value);
    return true;
  } catch (_) {
    return false;
  }
}

export function stripDirectoryFromPath(dir: string, filePath: string) {
  // Can't just do a regexp replace here since the windows paths mess it up :/
  let stripped = filePath;
  if (
    (dir.endsWith(path.sep) && filePath.startsWith(dir)) ||
    (!dir.endsWith(path.sep) && filePath.startsWith(dir + path.sep))
  ) {
    stripped = filePath.slice(dir.length);
    if (stripped.startsWith(path.sep)) {
      stripped = stripped.slice(1);
    }
  }
  return stripped;
}

// We do not copy these folders from templates so we can ignore them for comparisons
export const IGNORED_TEMPLATE_DIRECTORIES = [".git", "node_modules"];

export async function getDirectoryFilesRecursive(dir: string) {
  const files = await recursiveReaddir(dir, [
    (file) => {
      const strippedFile = stripDirectoryFromPath(dir, file);
      const parts = strippedFile.split(path.sep);
      return (
        parts.length > 1 && IGNORED_TEMPLATE_DIRECTORIES.includes(parts[0])
      );
    },
  ]);
  return files.map((f) => stripDirectoryFromPath(dir, f));
}

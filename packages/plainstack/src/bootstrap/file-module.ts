import fs from "node:fs/promises";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { platform } from "node:process";
import { pathToFileURL } from "node:url";
import { getLogger } from "../log";
import { directoryExists, fileExists } from "../plainstack-fs";

export type FileModule<T> = {
  defaultExport?: T;
  namedExports: Record<string, T>;
  filename: string;
  extension: string;
  absolutePath: string;
  relativePath: string;
};

export async function loadModule<T>(
  filePath: string,
  load: (module: unknown) => Promise<T>,
): Promise<Pick<FileModule<T>, "defaultExport" | "namedExports"> | undefined> {
  const log = getLogger("load-module");
  if (!(await fileExists(filePath))) {
    log.debug(`tried loading module, ${filePath} does not exist`);
    return undefined;
  }
  const fileURL = pathToFileURL(filePath, { windows: platform === "win32" });
  log.debug(`loading module from path - ${filePath}, fileURL: ${fileURL}`);
  const module = await import(fileURL.toString());
  const result: { defaultExport?: T; namedExports: Record<string, T> } = {
    namedExports: {},
  };

  // handle default export
  if ("default" in module) {
    const defaultExport = module.default;
    if (
      defaultExport &&
      typeof defaultExport === "object" &&
      "default" in defaultExport
    ) {
      result.defaultExport = await load(defaultExport.default);
    } else {
      result.defaultExport = await load(defaultExport);
    }
  }

  // handle named exports
  for (const [key, value] of Object.entries(module)) {
    if (key !== "default") {
      result.namedExports[key] = await load(value);
    }
  }
  if (result.defaultExport)
    log.debug(`successfully loaded default export in module ${filePath}`);
  if (Object.keys(result.namedExports).length)
    log.debug(`successfully loaded named exports in module ${filePath}`);

  return result;
}

export async function loadModulesFromDir<T>(
  baseDir: string,
  load: (module: unknown) => Promise<T>,
  extensions: string[] = [".ts", ".tsx"],
  currentDir: string = baseDir,
): Promise<FileModule<T>[]> {
  const modules: FileModule<T>[] = [];
  const log = getLogger("manifest");
  if (!(await directoryExists(currentDir))) {
    log.debug(`tried loading modules, directory ${currentDir} does not exist`);
    return [];
  }
  const files = await readdir(currentDir);
  log.debug(`found ${files.length} files in ${currentDir}`);

  for (const file of files) {
    const absolutePath = path.join(currentDir, file);
    const stat = await fs.stat(absolutePath);

    if (stat.isDirectory()) {
      log.debug(`found directory: ${absolutePath}`);
      const subModules = await loadModulesFromDir(
        baseDir,
        load,
        extensions,
        absolutePath,
      );
      modules.push(...subModules);
    } else if (stat.isFile()) {
      log.debug(`found file: ${absolutePath}`);
      if (!extensions.includes(path.extname(file))) {
        log.debug(`skipping file ${absolutePath} with unsupported extension`);
        continue;
      }
      const relativePath = path.relative(baseDir, absolutePath);
      const result = await loadModule(absolutePath, load);
      if (!result) continue;
      modules.push({
        defaultExport: result.defaultExport,
        namedExports: result.namedExports,
        filename: path.parse(file).name,
        extension: path.extname(file),
        absolutePath,
        relativePath,
      });
    }
  }
  return modules;
}

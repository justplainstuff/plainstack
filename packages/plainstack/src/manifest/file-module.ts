import fs from "node:fs/promises";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { getLogger } from "../log";
import { directoryExists, fileExists } from "../plainstack-fs";

type FileModule<T> = {
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
  if (!(await fileExists(filePath))) return undefined;
  const module = await import(filePath);
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

  return result;
}

export async function loadModulesfromDir<T>(
  baseDir: string,
  load: (module: unknown) => Promise<T>,
  extensions: string[] = [".ts", ".tsx"],
  currentDir: string = baseDir,
): Promise<FileModule<T>[]> {
  const modules: FileModule<T>[] = [];
  const log = getLogger("manifest");
  if (!(await directoryExists(currentDir))) {
    log.debug(`directory ${currentDir} does not exist`);
    return [];
  }
  const files = await readdir(currentDir);
  log.debug(`found ${files.length} files in ${currentDir}`);

  for (const file of files) {
    const absolutePath = path.join(currentDir, file);
    const stat = await fs.stat(absolutePath);

    if (stat.isDirectory()) {
      log.debug(`found directory: ${absolutePath}`);
      const subModules = await loadModulesfromDir(
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

import fs from "node:fs/promises";
import path from "node:path";
import express, { type Router } from "express";
import { type Handler, handleResponse } from "./handler";
import { getLogger } from "./log";

const log = getLogger("router");

interface FileRouteHandler {
  GET?: Handler;
  POST?: Handler;
}

type FileRoute = { filePath: string; routePath: string };

export type LoadedFileRoute = {
  filePath: string;
  GET?: Handler;
  POST?: Handler;
};

async function readRoutesFromFs(opts: {
  baseDir: string;
  ignorePatterns?: string[];
  currentDir?: string;
}): Promise<FileRoute[]> {
  const { baseDir, currentDir } = opts;
  const routes: FileRoute[] = [];

  let files: string[] = [];
  try {
    files = await fs.readdir(currentDir || baseDir);
  } catch (e) {
    log.error(`error reading directory: ${currentDir || baseDir}`);
    log.error("see the error below");
    throw e;
  }

  for (const file of files) {
    const fullFilePath = path.join(currentDir || baseDir, file);
    const stat = await fs.stat(fullFilePath);

    if (stat.isDirectory()) {
      log.debug(`found directory: ${fullFilePath}`);
      const subRoutes = await readRoutesFromFs({
        baseDir,
        currentDir: fullFilePath,
      });
      routes.push(...subRoutes);
    } else if (stat.isFile() && file.endsWith(".tsx")) {
      const relativePath = path.relative(baseDir, fullFilePath);
      log.debug(`discovered file route: ${relativePath}`);
      routes.push({ filePath: fullFilePath, routePath: relativePath });
    }
  }

  return routes;
}

async function loadFileRoutes(routes: FileRoute[]): Promise<LoadedFileRoute[]> {
  const loadedRoutes: LoadedFileRoute[] = [];

  for (const { filePath } of routes) {
    let loadedFileRoute: LoadedFileRoute | undefined;
    try {
      const module = (await import(filePath)) as
        | FileRouteHandler
        | { default: FileRouteHandler };
      const handler = (module as { default: FileRouteHandler })?.default
        ? (module as { default: FileRouteHandler }).default
        : (module as FileRouteHandler);
      if (handler?.GET) {
        if (typeof handler.GET !== "function") {
          throw new Error(`GET export in route ${filePath} is not a function`);
        }
        loadedFileRoute = { filePath, GET: handler.GET };
      }

      if (handler?.POST) {
        if (typeof handler.POST !== "function") {
          throw new Error(`POST export in route ${filePath} is not a function`);
        }
        if (loadedFileRoute) {
          loadedFileRoute.POST = handler.POST;
        } else {
          loadedFileRoute = { filePath, POST: handler.POST };
        }
      }

      if (!loadedFileRoute) {
        log.error(`no exported GET or POST functions found in ${filePath}`);
      } else {
        loadedRoutes.push(loadedFileRoute);
      }
    } catch (e) {
      log.error(e);
      throw new Error(
        `double check the route at ${filePath}. Make sure to export a GET or POST function.`,
      );
    }
  }

  return loadedRoutes;
}

export function getExpressRoutePath({
  dir,
  filePath,
}: {
  dir: string;
  filePath: string;
}): string {
  if (filePath === `${dir}/index.tsx`) return "/";
  let relativeFilePath = filePath.replace(dir, "");
  if (!dir.startsWith("/")) {
    relativeFilePath = filePath.replace(`/${dir}`, "");
  }
  const expressPath = relativeFilePath
    .replace(/\/index.tsx$/, "")
    .replace(/index.tsx$/, "")
    .replace(/\.tsx$/, "")
    .split("/")
    .map((part) => {
      if (part.startsWith("[...") && part.endsWith("]")) {
        return `:${part.slice(4, -1)}(*)`;
      }
      if (part.startsWith("[") && part.endsWith("]")) {
        return `:${part.slice(1, -1)}`;
      }
      return part;
    })
    .join("/");
  log.debug(`"${dir}": ${relativeFilePath} -> ${expressPath}`);
  return expressPath;
}

export function expressRouter({
  loadedFileRoutes,
  dir,
}: {
  loadedFileRoutes: LoadedFileRoute[];
  dir: string;
}): Router {
  const router = express.Router();

  for (const route of loadedFileRoutes) {
    const routePath = getExpressRoutePath({
      dir,
      filePath: route.filePath,
    });
    if (route.GET) {
      router.get(routePath, async (req, res, next) => {
        try {
          const userResponse = await (route as { GET: Handler }).GET({
            req,
            res,
          });
          await handleResponse(res, userResponse);
        } catch (e) {
          next(e);
        }
      });
    }
    if (route.POST) {
      router.post(routePath, async (req, res, next) => {
        try {
          const userResponse = await (route as { POST: Handler }).POST({
            req,
            res,
          });
          await handleResponse(res, userResponse);
        } catch (e) {
          next(e);
        }
      });
    }
  }
  return router;
}

type FileRouterOpts = {
  dir: string;
  ignorePatterns?: string[];
  fileRoutes?: FileRoute[];
  loadedFileRoutes?: LoadedFileRoute[];
};

/** Return an express router that serves files as routes form the given directory. */
export async function fileRouter(
  opts: FileRouterOpts,
): Promise<express.RequestHandler> {
  const dir = opts.dir;
  if (opts.loadedFileRoutes?.length) {
    return expressRouter({
      loadedFileRoutes: opts.loadedFileRoutes,
      dir,
    });
  }
  if (opts.fileRoutes?.length) {
    const loadedFileRoutes = await loadFileRoutes(opts.fileRoutes);
    return expressRouter({
      loadedFileRoutes: loadedFileRoutes,
      dir,
    });
  }
  const fileRoutes = await readRoutesFromFs({
    baseDir: dir,
    ignorePatterns: opts.ignorePatterns,
  });
  const loadedFileRoutes = await loadFileRoutes(fileRoutes);
  return expressRouter({ loadedFileRoutes, dir });
}

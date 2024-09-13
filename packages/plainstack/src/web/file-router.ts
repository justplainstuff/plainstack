import express, { type Router } from "express";
import type { Config } from "../bootstrap/config";
import type { FileModule } from "../bootstrap/file-module";
import { getOrThrow } from "../bootstrap/get";
import { getLogger } from "../log";
import { type Handler, handleResponse } from "./handler";

export type FileRoute = {
  filePath: string;
  GET?: Handler;
  POST?: Handler;
};

export function getExpressRoutePath(relativePath: string): string {
  const log = getLogger("express-router");
  if (relativePath === "index.tsx") return "/";
  const expressPath = relativePath
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
  log.debug(`${relativePath} -> ${expressPath}`);
  return `/${expressPath}`;
}

export function getExpressRouter(fileRoutes: FileRoute[]): {
  paths: string[];
  router: Router;
} {
  const router = express.Router();

  const paths: string[] = [];

  for (const route of fileRoutes) {
    const routePath = getExpressRoutePath(route.filePath);
    paths.push(routePath);
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
  return { paths, router };
}

export function getFileRoutesFromFileModules(
  modules: FileModule<Handler>[],
): FileRoute[] {
  const log = getLogger("file-router");
  const fileRoutes: FileRoute[] = [];
  for (const module of modules) {
    const fileRoute: FileRoute = {
      filePath: module.relativePath,
      GET: undefined,
      POST: undefined,
    };
    if (
      !module.namedExports?.GET &&
      !module.namedExports?.POST &&
      !module.defaultExport
    ) {
      throw new Error(
        `invalid file route module at ${module.absolutePath}, no GET or POST export found`,
      );
    }
    if (module.namedExports?.GET) {
      log.debug(`found GET export in ${module.absolutePath}`);
      fileRoute.GET = module.namedExports.GET;
    }
    if (module.namedExports?.POST) {
      log.debug(`found POST export in ${module.absolutePath}`);
      fileRoute.POST = module.namedExports.POST;
    }
    if (module.defaultExport && !fileRoute.GET) {
      log.debug(
        `found default export in ${module.absolutePath}, assuming GET export`,
      );
      fileRoute.GET = module.defaultExport;
    }
    fileRoutes.push(fileRoute);
  }
  return fileRoutes;
}

/** Return an express router that serves files as routes form the given directory. */
export async function fileRouter(opts?: {
  cwd?: string;
  config?: Config;
}): Promise<{
  paths: string[];
  router: express.RequestHandler;
  routes: FileRoute[];
}> {
  const log = getLogger("file-router");
  const cwd = opts?.cwd ?? process.cwd();
  const { routes } = await getOrThrow(["routes"]);
  const { paths, router } = getExpressRouter(routes);
  log.debug("loaded file routes", { routes, paths });
  return { paths, router, routes };
}

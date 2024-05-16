import fs from "node:fs/promises";
import path from "node:path";
import express, { type Router } from "express";
import { PlainResponse, sendPlainResponse } from "./plain-response";

export interface HandlerArgs {
  req: express.Request;
  res: express.Response;
}

export type RouteHandler = (args: HandlerArgs) => Promise<PlainResponse>;

interface FileRouteHandler {
  GET?: RouteHandler;
  POST?: RouteHandler;
}

export async function fileRouter(opts: { dir: string }): Promise<Router> {
  const dir = path.resolve(process.cwd(), opts.dir);
  const router = express.Router();

  async function getRoutes(dir: string): Promise<[string, string][]> {
    const routes: [string, string][] = [];

    const files = await fs.readdir(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = await fs.stat(fullPath);

      if (stat.isDirectory()) {
        const subRoutes = await getRoutes(fullPath);
        routes.push(...subRoutes);
      } else if (stat.isFile() && file.endsWith(".tsx")) {
        const relativePath = path.relative(dir, fullPath);
        const routePath =
          "/" +
          relativePath
            .replace(/\\/g, "/")
            .replace(/\[([^[\]]+)\]/g, ":$1")
            .replace(/\.tsx$/, "");

        routes.push([fullPath, routePath]);
      }
    }

    return routes;
  }

  const routes = await getRoutes(dir);

  routes.forEach(([filePath, routePath]) => {
    const module = require(filePath) as FileRouteHandler;

    if (module.GET) {
      router.get(routePath, async (req, res, next) => {
        try {
          const plainResponse = await module.GET!({ req, res });
          await sendPlainResponse(res, plainResponse);
        } catch (e) {
          next(e);
        }
      });
    }

    if (module.POST) {
      router.post(routePath, async (req, res, next) => {
        try {
          const plainResponse = await module.POST!({ req, res });
          await sendPlainResponse(res, plainResponse);
        } catch (e) {
          next(e);
        }
      });
    }

    if (!module.GET && !module.POST) {
      console.error(`No exported GET or POST functions found in ${filePath}`);
    }
  });

  return router;
}

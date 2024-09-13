import path from "node:path";
import express from "express";
import supertest from "supertest";
import { describe, expect, test } from "vitest";
import { withDefaultConfig } from "../bootstrap/config";
import { registerAppLoader } from "../bootstrap/load";
import {
  type FileRoute,
  fileRouter,
  getExpressRoutePath,
  getExpressRouter,
} from "./file-router";

describe("get express route path", () => {
  test("index route", () => {
    const filePath = "index.tsx";
    const expectedRoute = "/";
    const convertedRoute = getExpressRoutePath(filePath);
    expect(convertedRoute).toBe(expectedRoute);
  });

  test("converts file paths to Express.js routes", () => {
    const filePaths = [
      "pages/index.tsx",
      "pages/about-us.tsx",
      "pages/users/[id].tsx",
      "pages/posts/[...slug].tsx",
    ];
    const expectedRoutes = [
      "/pages",
      "/pages/about-us",
      "/pages/users/:id",
      "/pages/posts/:slug(*)",
    ];
    filePaths.forEach((filePath, index) => {
      const convertedRoute = getExpressRoutePath(filePath);
      expect(convertedRoute).toBe(expectedRoutes[index]);
    });
  });

  test("handles multiple dynamic params in the same segment", () => {
    const filePath = "pages/users/[id]/posts/[postId].tsx";
    const expectedRoute = "/pages/users/:id/posts/:postId";
    const convertedRoute = getExpressRoutePath(filePath);
    expect(convertedRoute).toBe(expectedRoute);
  });

  test("handles index routes in subdirectories", () => {
    const filePath = "pages/blog/index.tsx";
    const expectedRoute = "/pages/blog";
    const convertedRoute = getExpressRoutePath(filePath);
    expect(convertedRoute).toBe(expectedRoute);
  });
});

describe("express router", () => {
  test("creates Express.js router with GET and POST routes", async () => {
    const routes: FileRoute[] = [
      {
        filePath: "pages/index.tsx",
        GET: async ({ req, res }) => {
          return { message: "GET /pages" };
        },
        POST: async ({ req, res }) => {
          return { message: "POST /pages" };
        },
      },
      {
        filePath: "pages/about.tsx",
        GET: async ({ req, res }) => {
          return { message: "GET /pages/about" };
        },
      },
    ];

    const { router } = getExpressRouter(routes);

    const app = express();
    app.use(router);

    const getResponse = await supertest(app).get("/pages");
    expect(JSON.parse(getResponse.text)).toEqual({ message: "GET /pages" });

    const postResponse = await supertest(app).post("/pages");
    expect(JSON.parse(postResponse.text)).toEqual({ message: "POST /pages" });

    const aboutResponse = await supertest(app).get("/pages/about");
    expect(JSON.parse(aboutResponse.text)).toEqual({
      message: "GET /pages/about",
    });
  });
});

describe("file router", () => {
  test("creates Express.js router with GET and POST routes", async () => {
    const cwd = path.join(__dirname, "..", "..", "test", "fixtures");
    const config = withDefaultConfig({ paths: { routes: "file-router" } });
    registerAppLoader({ cwd, config });
    const { routes, router } = await fileRouter({
      cwd,
      config,
    });
    const sorted = routes.sort((a, b) => a.filePath.localeCompare(b.filePath));

    const app = express();
    app.use(router);

    expect(sorted).toHaveLength(7);

    expect(sorted[0]?.filePath).toEqual("index.tsx");
    expect(sorted[0]?.GET).toBeDefined();
    expect(sorted[0]?.POST).toBeDefined();
    const getResponse1 = await supertest(app).get("/");
    expect(getResponse1.status).toBe(200);
    expect(getResponse1.text).toContain("GET /");
    const postResponse1 = await supertest(app).post("/");
    expect(postResponse1.status).toBe(200);
    expect(JSON.parse(postResponse1.text)).toEqual({ message: "POST /" });

    expect(sorted[1]?.filePath).toBe("level-1.tsx");
    expect(sorted[1]?.GET).toBeDefined();
    expect(sorted[1]?.POST).toBeUndefined();
    const getResponse2 = await supertest(app).get("/level-1");
    expect(getResponse2.status).toBe(200);
    expect(getResponse2.text).toContain("GET /level-1");

    expect(sorted[2]?.filePath).toBe("path/[id]/index.tsx");
    expect(sorted[2]?.GET).toBeDefined();
    expect(sorted[2]?.POST).toBeUndefined();
    const getResponse3 = await supertest(app).get("/path/123");
    expect(getResponse3.status).toBe(200);
    expect(getResponse3.text).toContain("GET /path/123");

    expect(sorted[3]?.filePath).toBe("path/[id]/level-3.tsx");
    expect(sorted[3]?.GET).toBeDefined();
    expect(sorted[3]?.POST).toBeUndefined();
    const getResponse4 = await supertest(app).get("/path/123/level-3");
    expect(getResponse4.status).toBe(200);
    expect(getResponse4.text).toContain("GET /path/123/level-3");

    expect(sorted[4]?.filePath).toBe("path/index.tsx");
    expect(sorted[4]?.GET).toBeDefined();
    expect(sorted[4]?.POST).toBeDefined();
    const getResponse5 = await supertest(app).get("/path");
    expect(getResponse5.status).toBe(200);

    expect(sorted[5]?.filePath).toBe("path/level-2.tsx");
    expect(sorted[5]?.GET).toBeDefined();
    expect(sorted[5]?.POST).toBeUndefined();
    const getResponse6 = await supertest(app).get("/path/level-2");
    expect(getResponse6.status).toBe(200);

    expect(sorted[6]?.filePath).toBe("rest/[...rest].tsx");
    expect(sorted[6]?.GET).toBeDefined();
    expect(sorted[6]?.POST).toBeUndefined();
    const getResponse7 = await supertest(app).get("/rest/one/two/three");
    expect(getResponse7.status).toBe(200);
    expect(JSON.parse(getResponse7.text)).toEqual({ rest: "one/two/three" });

    expect(routes).toHaveLength(7);
  });
});

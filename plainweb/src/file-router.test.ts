import { expect, test, describe } from "vitest";
import {
  LoadedFileRoute,
  expressRouter,
  getExpressRoutePath,
} from "./file-router";
import express from "express";
import supertest from "supertest";

describe("getExpressRoutePath", () => {
  const dir = "/path/to/routes";

  test("index route", () => {
    const filePath = `${dir}/index.tsx`;
    const expectedRoute = "/";
    const convertedRoute = getExpressRoutePath({ dir, filePath });
    expect(convertedRoute).toBe(expectedRoute);
  });

  test("index route no root dir", () => {
    const filePath = `${dir}/index.tsx`;
    const expectedRoute = "/";
    const convertedRoute = getExpressRoutePath({
      dir: "/path/to/routes",
      filePath,
    });
    expect(convertedRoute).toBe(expectedRoute);
  });

  test("converts file paths to Express.js routes", () => {
    const filePaths = [
      `${dir}/pages/index.tsx`,
      `${dir}/pages/about-us.tsx`,
      `${dir}/pages/users/[id].tsx`,
      `${dir}/pages/posts/[...slug].tsx`,
    ];
    const expectedRoutes = [
      "/pages",
      "/pages/about-us",
      "/pages/users/:id",
      "/pages/posts/:slug(*)",
    ];
    filePaths.forEach((filePath, index) => {
      const convertedRoute = getExpressRoutePath({ dir, filePath });
      expect(convertedRoute).toBe(expectedRoutes[index]);
    });
  });

  test("handles multiple dynamic params in the same segment", () => {
    const filePath = `${dir}/pages/users/[id]/posts/[postId].tsx`;
    const expectedRoute = "/pages/users/:id/posts/:postId";
    const convertedRoute = getExpressRoutePath({ dir, filePath });
    expect(convertedRoute).toBe(expectedRoute);
  });

  test("handles index routes in subdirectories", () => {
    const filePath = `${dir}/pages/blog/index.tsx`;
    const expectedRoute = "/pages/blog";
    const convertedRoute = getExpressRoutePath({ dir, filePath });
    expect(convertedRoute).toBe(expectedRoute);
  });
});

describe("expressRouter", () => {
  test("creates Express.js router with GET and POST routes", async () => {
    const routes: LoadedFileRoute[] = [
      {
        filePath: "/routes/pages/index.tsx",
        GET: async ({ req, res }) => {
          return { message: "GET /pages" };
        },
        POST: async ({ req, res }) => {
          return { message: "POST /pages" };
        },
      },
      {
        filePath: "/routes/pages/about.tsx",
        GET: async ({ req, res }) => {
          return { message: "GET /pages/about" };
        },
      },
    ];

    const router = expressRouter({
      loadedFileRoutes: routes,
      dir: "routes",
      verbose: 3,
    });

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

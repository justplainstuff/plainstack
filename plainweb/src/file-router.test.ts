import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { expressifyFileRoutes } from "./file-router";

describe("expressifyFileRoutes", () => {
  test("index route", () => {
    const fileRoutes = [{ filePath: "index.tsx", routePath: "index.tsx" }];
    const expectedRoutes = [{ filePath: "index.tsx", routePath: "/" }];
    const convertedRoutes = expressifyFileRoutes(fileRoutes);
    assert.deepEqual(convertedRoutes, expectedRoutes);
  });
  test("converts file routes to Express.js routes", () => {
    const fileRoutes = [
      { filePath: "pages/index.tsx", routePath: "pages/index.tsx" },
      { filePath: "pages/about-us.tsx", routePath: "pages/about-us.tsx" },
      { filePath: "pages/users/[id].tsx", routePath: "pages/users/[id].tsx" },
      {
        filePath: "pages/posts/[...slug].tsx",
        routePath: "pages/posts/[...slug].tsx",
      },
    ];

    const expectedRoutes = [
      { filePath: "pages/index.tsx", routePath: "/pages" },
      { filePath: "pages/about-us.tsx", routePath: "/pages/about-us" },
      { filePath: "pages/users/[id].tsx", routePath: "/pages/users/:id" },
      {
        filePath: "pages/posts/[...slug].tsx",
        routePath: "/pages/posts/:slug(*)",
      },
    ];

    const convertedRoutes = expressifyFileRoutes(fileRoutes);
    assert.deepEqual(convertedRoutes, expectedRoutes);
  });

  test("handles multiple dynamic params in the same segment", () => {
    const fileRoutes = [
      {
        filePath: "pages/users/[id]/posts/[postId].tsx",
        routePath: "pages/users/[id]/posts/[postId].tsx",
      },
    ];

    const expectedRoutes = [
      {
        filePath: "pages/users/[id]/posts/[postId].tsx",
        routePath: "/pages/users/:id/posts/:postId",
      },
    ];

    const convertedRoutes = expressifyFileRoutes(fileRoutes);
    assert.deepEqual(convertedRoutes, expectedRoutes);
  });
});

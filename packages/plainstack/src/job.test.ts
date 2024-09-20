import { describe } from "node:test";
import { expect, test } from "vitest";
import { defineJob } from "./job";

describe("job", () => {
  test("define job with file path", () => {
    const job = defineJob({
      name: "file:///test/foobar-hello.ts",
      run: async () => {},
    });
    expect(job.name).toBe("foobar-hello");
  });
});

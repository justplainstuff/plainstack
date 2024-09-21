import { describe } from "node:test";
import { expect, test } from "vitest";
import { defineJob, validateName } from "./job";

describe("job", () => {
  test("validate name", () => {
    expect(validateName("foobar")).toBe("foobar");
    expect(validateName("something/foobar")).toBe("foobar");
    expect(validateName("something.foobar")).toBe("something");
    expect(validateName("file:///test/foobar")).toBe("foobar");
    expect(validateName("file:///test/foobar.ts")).toBe("foobar");
    expect(validateName("/test/foobar.ts")).toBe("foobar");
    expect(validateName("test/foobar.ts")).toBe("foobar");
    expect(validateName("file:///test/foobar")).toBe("foobar");
    expect(validateName("file:///test/foobar.ts.js")).toBe("foobar");
    expect(
      validateName("file:///D:/a/template/template/app/jobs/hello.ts"),
    ).toBe("hello");
  });
  test("define job with file path", () => {
    const job = defineJob({
      name: "file:///test/foobar.ts",
      run: async () => {},
    });
    expect(job.name).toBe("foobar");
  });
});

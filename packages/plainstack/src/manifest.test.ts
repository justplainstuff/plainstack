import path from "node:path";
import { describe, expect, it } from "vitest";
import { importModulesFromDir } from "./manifest";

describe("import modules from dir", () => {
  const testDir = path.join(__dirname, "../test", "manifest");

  it("should import modules from directory and subdirectories", async () => {
    const modules = await importModulesFromDir(testDir);

    expect(modules).toHaveLength(3);

    const moduleA = modules.find((m) => m.filename === "module-a");
    const moduleB = modules.find((m) => m.filename === "module-b");
    const moduleC = modules.find((m) => m.filename === "module-c");

    expect(moduleA).toBeDefined();
    expect(moduleB).toBeDefined();
    expect(moduleC).toBeDefined();

    expect(moduleA?.module).toEqual({ a: 1 });
    expect(moduleB?.module).toEqual({ b: 2 });
    expect(moduleC?.module).toEqual({ c: 3 });

    expect(moduleA?.extension).toBe(".ts");
    expect(moduleB?.extension).toBe(".tsx");
    expect(moduleC?.extension).toBe(".tsx");

    expect(moduleA?.relativePath).toBe("module-a.ts");
    expect(moduleB?.relativePath).toBe("module-b.tsx");
    expect(moduleC?.relativePath).toBe(path.join("subdir", "module-c.tsx"));
  });

  it("should not import files with unsupported extensions", async () => {
    const modules = await importModulesFromDir(testDir, [".ts"]);

    expect(modules).toHaveLength(1);
    expect(modules[0].filename).toBe("module-a");
  });
});

import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadModule, loadModulesfromDir } from "./file-module";

describe("import modules", () => {
  const testDir = path.join(
    __dirname,
    "../../test/fixtures",
    "manifest/load-module",
  );
  const load = async (m: unknown): Promise<{ foobar: string }> => {
    if (!("foobar" in (m as Record<string, unknown>)))
      throw new Error(
        "module has no foobar property, unexpected module received",
      );
    return m as { foobar: string };
  };

  it("should load default export and named exports", async () => {
    const testModulePath = path.join(testDir, "test-module.ts");

    const result = await loadModule(testModulePath, load);

    expect(result?.defaultExport).toBeDefined();
    expect(result?.defaultExport).toEqual({
      foobar: "I am the default export",
    });

    expect(result?.namedExports).toBeDefined();
    expect(result?.namedExports.namedExport1).toEqual({
      foobar: "I am a named export",
    });
    expect(result?.namedExports.namedExport2).toEqual({ foobar: "42" });
  });

  it("should import modules from directory and subdirectories", async () => {
    const modules = await loadModulesfromDir(testDir, load);

    expect(modules).toHaveLength(4);

    const moduleA = modules.find((m) => m.filename === "module-a");
    const moduleB = modules.find((m) => m.filename === "module-b");
    const moduleC = modules.find((m) => m.filename === "module-c");

    expect(moduleA).toBeDefined();
    expect(moduleB).toBeDefined();
    expect(moduleC).toBeDefined();

    expect(moduleA?.defaultExport).toEqual({ foobar: "a-default" });
    expect(moduleB?.defaultExport).toEqual({ foobar: "b-default" });
    expect(moduleC?.defaultExport).toEqual({ foobar: "c-default" });

    expect(moduleA?.namedExports).toEqual({
      namedExport1: { foobar: "a-named" },
    });
    expect(moduleB?.namedExports).toEqual({
      namedExport1: { foobar: "b-named" },
      namedExport2: { foobar: "b-named-2" },
    });
    expect(moduleB?.extension).toBe(".tsx");
    expect(moduleC?.extension).toBe(".tsx");

    expect(moduleA?.relativePath).toBe("module-a.ts");
    expect(moduleB?.relativePath).toBe("module-b.tsx");
    expect(moduleC?.relativePath).toBe(path.join("subdir", "module-c.tsx"));
  });

  it("should not import files with unsupported extensions", async () => {
    const modules = await loadModulesfromDir(testDir, load, [".ts"]);

    expect(modules).toHaveLength(2);
    expect(modules[0]?.filename).toBe("module-a");
  });
});

import path from "node:path";
import { describe, expect, it } from "vitest";
import { withDefaultConfig } from "./config";
import { get, getOrThrow } from "./get";
import { registerAppLoader } from "./load";

describe("bootstrap", () => {
  const testDir = path.join(
    __dirname,
    "..",
    "..",
    "test",
    "fixtures",
    "bootstrap",
  );
  const config = withDefaultConfig({});
  registerAppLoader({ cwd: testDir, config });

  it("get manifest single module not existing file", async () => {
    const { queue } = await get(["queue"]);
    expect(queue).toBeUndefined();
  });

  it("get manifest single module", async () => {
    const { database } = await get(["database"]);
    expect(database).toBeDefined();
  });

  it("get manifest multiple modules, some not existing", async () => {
    const { database, queue } = await get(["database", "queue"]);
    expect(database).toBeDefined();
    expect(queue).toBeUndefined();
  });

  it("get manifest list of modules", async () => {
    const { jobs } = await get(["jobs"]);
    if (!jobs) throw new Error("job not found");
    expect(jobs).toBeDefined();
    expect(Object.keys(jobs)).toHaveLength(2);
    expect(jobs.hello).toBeDefined();
    expect(jobs["another-job"]).toBeDefined();
  });

  it("get multiple manifest items", async () => {
    const { database, jobs, commands } = await get([
      "database",
      "jobs",
      "commands",
    ]);
    expect(database).toBeDefined();
    if (!jobs) throw new Error("job not found");
    expect(Object.keys(jobs)).toHaveLength(2);
    expect(commands).toBeDefined();
  });

  it("get manifest routes", async () => {
    const { routes } = await get(["routes"]);
    if (!routes) throw new Error("routes not found");
    expect(routes.length).toBe(2);
    expect(routes[0]?.filePath).toBe("index.tsx");
    expect(routes[0]?.GET).toBeDefined();
    expect(routes[0]?.POST).toBeUndefined();
    expect(routes[1]?.filePath).toBe("path/foobar.tsx");
    expect(routes[1]?.GET).toBeDefined();
    expect(routes[1]?.POST).toBeDefined();
  });

  it("getManifestOrThrow should return manifests when all exist", async () => {
    const result = await getOrThrow(["database", "jobs"]);
    expect(result.database).toBeDefined();
    expect(result.jobs).toBeDefined();
    expect(Object.keys(result.jobs)).toHaveLength(2);
  });

  it("getManifestOrThrow should throw when a single manifest doesn't exist", async () => {
    await expect(getOrThrow(["queue"])).rejects.toThrow(
      /missing app components: queue/,
    );
  });

  it("getManifestOrThrow should throw with correct paths for missing manifests", async () => {
    await expect(getOrThrow(["queue"])).rejects.toThrow(
      /missing app components: queue/,
    );
  });

  it("getManifestOrThrow should throw for existing manifests when some don't exist", async () => {
    await expect(getOrThrow(["queue", "database"])).rejects.toThrow(
      /missing app components: queue/,
    );
  });
});

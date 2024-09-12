import path from "node:path";
import { describe, expect, it, test } from "vitest";
import type { Config } from "../config";
import { getManifest } from "./manifest";

describe("manifest", () => {
  const testDir = path.join(__dirname, "../../test/fixtures", "manifest");
  const config: Config = {
    nodeEnv: "test",
    dbUrl: ":memory:",
    logger: {
      level: 1,
      reporters: [],
    },
    port: 3000,
    paths: {
      routes: "app/routes",
      commands: "app/commands",
      jobs: "app/jobs",
      databaseConfig: "app/config/database.ts",
      httpConfig: "app/config/http.ts",
      queueConfig: "app/config/queue.ts",
      assets: "-",
      migrations: "-",
      schema: "-",
      public: "-",
      out: "-",
      forms: "-",
      styles: "-",
      seed: "-",
    },
  };

  it("get manifest single module", async () => {
    const database = await getManifest("database", {
      cwd: testDir,
      config,
    });
    expect(database).toBeDefined();
  });
  it("get manifest list of modules", async () => {
    const jobs = await getManifest("jobs", {
      cwd: testDir,
      config,
    });
    expect(jobs).toBeDefined();
    expect(Object.keys(jobs)).toHaveLength(2);
    expect(jobs.hello).toBeDefined();
    expect(jobs["another-job"]).toBeDefined();
  });
});

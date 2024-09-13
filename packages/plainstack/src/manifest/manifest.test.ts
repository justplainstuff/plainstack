import path from "node:path";
import { describe, expect, it, test } from "vitest";
import type { Config } from "../config";
import { getManifest, getManifestOrThrow } from "./manifest";

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
      mailerConfig: "app/config/mailer.ts",
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

  it("get manifest single module not existing file", async () => {
    const { queue } = await getManifest(["queue"], {
      cwd: testDir,
      config,
    });
    expect(queue).toBeUndefined();
  });

  it("get manifest single module", async () => {
    const { database } = await getManifest(["database"], {
      cwd: testDir,
      config,
    });
    expect(database).toBeDefined();
  });

  it("get manifest multiple modules, some not existing", async () => {
    const { database, queue } = await getManifest(["database", "queue"], {
      cwd: testDir,
      config,
    });
    expect(database).toBeDefined();
    expect(queue).toBeUndefined();
  });

  it("get manifest list of modules", async () => {
    const { jobs } = await getManifest(["jobs"], {
      cwd: testDir,
      config,
    });
    if (!jobs) throw new Error("job not found");
    expect(jobs).toBeDefined();
    expect(Object.keys(jobs)).toHaveLength(2);
    expect(jobs.hello).toBeDefined();
    expect(jobs["another-job"]).toBeDefined();
  });

  it("get multiple manifest items", async () => {
    const { database, jobs, commands } = await getManifest(
      ["database", "jobs", "commands"],
      {
        cwd: testDir,
        config,
      },
    );
    expect(database).toBeDefined();
    if (!jobs) throw new Error("job not found");
    expect(Object.keys(jobs)).toHaveLength(2);
    expect(commands).toBeDefined();
  });

  it("getManifestOrThrow should return manifests when all exist", async () => {
    const result = await getManifestOrThrow(["database", "jobs"], {
      cwd: testDir,
      config,
    });
    expect(result.database).toBeDefined();
    expect(result.jobs).toBeDefined();
    expect(Object.keys(result.jobs)).toHaveLength(2);
  });

  it("getManifestOrThrow should throw when a single manifest doesn't exist", async () => {
    await expect(
      getManifestOrThrow(["queue"], {
        cwd: testDir,
        config,
      }),
    ).rejects.toThrow(/queue not found at/);
  });

  it("getManifestOrThrow should throw with correct paths for missing manifests", async () => {
    const expectedQueuePath = path.join(testDir, config.paths.queueConfig);
    await expect(
      getManifestOrThrow(["queue"], {
        cwd: testDir,
        config,
      }),
    ).rejects.toThrow(new RegExp(`queue not found at ${expectedQueuePath}`));
  });

  it("getManifestOrThrow should throw for existing manifests when some don't exist", async () => {
    const expectedQueuePath = path.join(testDir, config.paths.queueConfig);
    await expect(
      getManifestOrThrow(["queue", "database"], {
        cwd: testDir,
        config,
      }),
    ).rejects.toThrow(new RegExp(`queue not found at ${expectedQueuePath}`));
  });
});

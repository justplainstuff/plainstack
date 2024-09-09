import * as path from "node:path";
import { loadAndGetAppConfig } from "./app-config";
import { loadAndGetConfig } from "./config";
import { fileExists } from "./plainstack-fs";

export async function runSeed() {
  const config = await loadAndGetConfig();
  const appConfig = await loadAndGetAppConfig({ config });

  const seedPath = path.join(process.cwd(), config.paths.seed);

  if (!(await fileExists(seedPath))) {
    console.log("Seed file not found. Skipping seeding.");
    return;
  }

  try {
    const seedModule = await import(seedPath);

    if (typeof seedModule.seed !== "function") {
      throw new Error("Seed file does not export a seed function");
    }

    await seedModule.seed(appConfig.database);
    console.log("Seeding completed successfully.");
  } catch (error) {
    console.error("Error during seeding:", error);
    throw error;
  }
}

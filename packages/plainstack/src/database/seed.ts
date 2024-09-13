import { getOrThrow } from "../bootstrap/get";
import { getLogger } from "../log";
import type { GenericDatabase } from "./database";

export function defineSeed(f: (db: GenericDatabase) => Promise<void>) {
  return {
    run: f,
  };
}

export type Seeder = {
  run: (database: GenericDatabase) => Promise<void>;
};

export function isSeeder(m: unknown): m is Seeder {
  return typeof m === "object" && m !== null && "run" in m;
}

export async function runSeed() {
  const now = Date.now();
  const log = getLogger("seed");
  const { database, seeder } = await getOrThrow(["database", "seeder"]);
  await seeder.run(database);
  log.log(`seeds ran in ${Date.now() - now}ms`);
}

import { Database } from "bun:sqlite";
import { randomBytes } from "node:crypto";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import type { BuildConfig as BunBuildConfig } from "bun";
import consola from "consola";
import { CamelCasePlugin, Kysely } from "kysely";
import { BunSqliteDialect } from "kysely-bun-sqlite";
import { bun } from "plainjob";
import { migrate as migrate_ } from "./database";
import { prod, test } from "./env";
import { queue } from "./job";

export function sqlite<DB = unknown>() {
  const sqlite_ = new Database(test() ? ":memory:" : "data.db", {
    strict: true,
  });
  const q = queue({
    connection: bun(sqlite_),
  });
  const database = new Kysely<DB>({
    dialect: new BunSqliteDialect({
      database: sqlite_,
    }),
    plugins: [new CamelCasePlugin()],
  });
  const migrate = migrate_(database);
  return { sqlite: sqlite_, database, migrate, queue: q };
}

export async function secret(): Promise<string> {
  if (process.env.SECRET_KEY) return process.env.SECRET_KEY;
  const newSecret = randomBytes(16).toString("hex");
  const envFile = Bun.file(".env");
  if (!(await envFile.exists())) {
    await Bun.write(".env", `SECRET_KEY="${newSecret}"`);
  } else {
    const envContent = await envFile.text();
    Bun.write(".env", `${envContent}\nSECRET_KEY="${newSecret}"`);
  }
  return newSecret;
}

type BuildConfig = Omit<BunBuildConfig, "entrypoints"> & {
  entrypoints: string | string[];
};

export async function build(options: BuildConfig) {
  const entrypointfiles =
    typeof options.entrypoints === "string"
      ? await readdir(options.entrypoints).then((files) =>
          files.map((file) => join(options.entrypoints as string, file)),
        )
      : options.entrypoints;
  const result = await Bun.build({
    outdir: "static",
    sourcemap: "linked",
    minify: false, // TODO this breaks the naming atm
    ...options,
    entrypoints: entrypointfiles,
  });
  consola.info("✓ build finished");
  if (process.env.PS_BUILD) {
    consola.info("PS_BUILD=1, exiting process...");
    process.exit(0);
  }
  return result;
}

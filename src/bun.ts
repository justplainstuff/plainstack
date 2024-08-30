import { Database } from "bun:sqlite";
import { randomBytes } from "node:crypto";
import { CamelCasePlugin, Kysely } from "kysely";
import { BunSqliteDialect } from "kysely-bun-sqlite";
import { bun } from "plainjob";
import { migrate as migrate_ } from "./database";
import { test } from "./env";
import { queue } from "./job";

export function bunSqlite<DB = unknown>() {
  const sqlite = new Database(test() ? ":memory:" : "data.db", {
    strict: true,
  });
  const q = queue({
    connection: bun(sqlite),
  });
  const database = new Kysely<DB>({
    dialect: new BunSqliteDialect({
      database: sqlite,
    }),
    plugins: [new CamelCasePlugin()],
  });
  const migrate = migrate_(database);
  return { sqlite, database, migrate, queue: q };
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

import { beforeAll, describe, expect, test } from "vitest";

import { config } from "admin/config";
import BetterSqlite3Database from "better-sqlite3";
import {
  type BetterSQLite3Database,
  drizzle,
} from "drizzle-orm/better-sqlite3";
import express from "express";
import { handleResponse } from "handler";
import { isolate } from "isolate";
import supertest from "supertest";
import { GET } from "./index";

const connection = new BetterSqlite3Database(":memory:");
const database = drizzle(connection);

function app(database: BetterSQLite3Database) {
  const app = express();
  app.use((req, res, next) => {
    res.locals.database = database;
    next();
  });

  app.route("/").get(async (req, res) => {
    const userResponse = await GET({ req, res });
    await handleResponse(res, userResponse);
  });
  return app;
}

function runMigrations(connection: BetterSqlite3Database.Database) {
  const migrations = `
CREATE TABLE users (
    email text PRIMARY KEY NOT NULL
);

CREATE TABLE orders (
    id text PRIMARY KEY NOT NULL
);
    `;
  connection.exec(migrations);
}

process.env.NODE_ENV = "test";

describe("admin database index.ts", () => {
  beforeAll(() => runMigrations(connection));

  test("get with tables", async () => {
    await isolate(database, async (tx) => {
      const response = await supertest(app(tx)).get("/");

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe(
        `${config.adminBasePath}/database/users`,
      );
    });
  });
});

import { beforeAll, describe, expect, test } from "vitest";

import BetterSqlite3Database from "better-sqlite3";
import {
  type BetterSQLite3Database,
  drizzle,
} from "drizzle-orm/better-sqlite3";
import express from "express";
import supertest from "supertest";
import { GET } from ".";
import { isolate } from "../../..";
import { handleResponse } from "../../../handler";

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

process.env.NODE_ENV = "test";
describe("admin database index.ts", () => {
  beforeAll(() => {
    const migrations = `
CREATE TABLE users (
    email text PRIMARY KEY NOT NULL
);

CREATE TABLE orders (
    id text PRIMARY KEY NOT NULL
);
    `;
    connection.exec(migrations);
  });

  test("get with tables", async () => {
    await isolate(database, async (tx) => {
      const response = await supertest(app(tx)).get("/");

      expect(response.status).toBe(200);
      expect(response.text.includes("users")).toBe(true);
      expect(response.text.includes("orders")).toBe(true);
    });
  });
});

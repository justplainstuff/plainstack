import { before, test, describe } from "node:test";

import BetterSqlite3Database from "better-sqlite3";
import express from "express";
import supertest from "supertest";
import assert from "node:assert/strict";
import { GET } from ".";
import { handleResponse } from "../../../handler";
import { isolate } from "../../..";
import { BetterSQLite3Database, drizzle } from "drizzle-orm/better-sqlite3";

const connection = new BetterSqlite3Database(":memory:");
export const database = drizzle(connection);

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
  before(() => {
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

      assert.equal(response.status, 200);
      assert.equal(response.text.includes("users"), true);
      assert.equal(response.text.includes("orders"), true);
    });
  });
});

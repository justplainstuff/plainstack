import { test, describe } from "node:test";
import express from "express";
import supertest from "supertest";
import assert from "node:assert/strict";
import { redirectWWW } from "./middleware";

function app() {
  const app = express();
  app.use(redirectWWW);
  return app;
}

describe("middleware", () => {
  test("redirects to www when host is not www and not a subdomain", async () => {
    const response = await supertest(app()).get("/").set("Host", "example.com");

    assert.equal(response.status, 301);
    assert.equal(response.headers.location, "https://www.example.com/");
  });

  test("does not redirect when host is already www", async () => {
    const response = await supertest(app())
      .get("/")
      .set("Host", "www.example.com");

    assert.equal(response.status, 404); // Assuming no further routes are defined
  });

  test("does not redirect when host is a subdomain", async () => {
    const response = await supertest(app())
      .get("/")
      .set("Host", "subdomain.example.com");

    assert.equal(response.status, 404); // Assuming no further routes are defined
  });

  test("handles missing host header", async () => {
    const response = await supertest(app()).get("/");

    assert.equal(response.status, 404); // Assuming no further routes are defined
  });

  test("preserves the original URL path and query parameters", async () => {
    const response = await supertest(app())
      .get("/path?query=value")
      .set("Host", "example.com");

    assert.equal(response.status, 301);
    assert.equal(
      response.headers.location,
      "https://www.example.com/path?query=value"
    );
  });

  test("handles case-insensitive host", async () => {
    const response = await supertest(app()).get("/").set("Host", "EXAMPLE.COM");

    assert.equal(response.status, 301);
    assert.equal(response.headers.location, "https://www.example.com/");
  });

  test("handles host with port number", async () => {
    const response = await supertest(app())
      .get("/")
      .set("Host", "example.com:3000");

    assert.equal(response.status, 301);
    assert.equal(response.headers.location, "https://www.example.com:3000/");
  });

  test("handles IPv4 host", async () => {
    const response = await supertest(app()).get("/").set("Host", "192.168.0.1");

    assert.equal(response.status, 404); // Assuming no further routes are defined
  });
});

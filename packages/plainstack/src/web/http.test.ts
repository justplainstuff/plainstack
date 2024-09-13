import express from "express";
import supertest from "supertest";
import { describe, test } from "vitest";
import { expect } from "vitest";
import { forceWWW } from "./http";

function app() {
  const app = express();
  app.use(forceWWW());
  return app;
}

describe("middleware", () => {
  test("redirects to www when host is not www and not a subdomain", async () => {
    const response = await supertest(app()).get("/").set("Host", "example.com");

    expect(response.status).toBe(301);
    expect(response.headers.location).toBe("https://www.example.com/");
  });

  test("does not redirect when host is already www", async () => {
    const response = await supertest(app())
      .get("/")
      .set("Host", "www.example.com");

    expect(response.status).toBe(404); // Assuming no further routes are defined
  });

  test("does not redirect when host is a subdomain", async () => {
    const response = await supertest(app())
      .get("/")
      .set("Host", "subdomain.example.com");

    expect(response.status).toBe(404); // Assuming no further routes are defined
  });

  test("handles missing host header", async () => {
    const response = await supertest(app()).get("/");

    expect(response.status).toBe(404); // Assuming no further routes are defined
  });

  test("preserves the original URL path and query parameters", async () => {
    const response = await supertest(app())
      .get("/path?query=value")
      .set("Host", "example.com");

    expect(response.status).toBe(301);
    expect(response.headers.location).toBe(
      "https://www.example.com/path?query=value",
    );
  });

  test("handles case-insensitive host", async () => {
    const response = await supertest(app()).get("/").set("Host", "EXAMPLE.COM");

    expect(response.status).toBe(301);
    expect(response.headers.location).toBe("https://www.example.com/");
  });

  test("handles host with port number", async () => {
    const response = await supertest(app())
      .get("/")
      .set("Host", "example.com:3000");

    expect(response.status).toBe(301);
    expect(response.headers.location).toBe("https://www.example.com:3000/");
  });

  test("handles IPv4 host", async () => {
    const response = await supertest(app()).get("/").set("Host", "192.168.0.1");

    expect(response.status).toBe(404); // Assuming no further routes are defined
  });
});

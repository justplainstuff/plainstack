import { database } from "app/config/database";
import { GET } from "app/routes/double-opt-in";
import { contacts } from "app/schema";
import { eq } from "drizzle-orm";
import { createRequest } from "node-mocks-http";
import { isolate, migrate, outbox, randomId, testHandler } from "plainstack";
import config from "plainweb.config";
import { beforeAll, describe, expect, test } from "vitest";

describe("double opt in", () => {
  beforeAll(async () => await migrate(config));

  test("send email with correct token and email", async () => {
    await isolate(database, async (tx) => {
      await tx.insert(contacts).values({
        id: randomId("con"),
        email: "walter@example.org",
        created: Date.now(),
        doubleOptInSent: Date.now(),
        doubleOptInToken: "123",
      });

      const req = createRequest({
        url: "/double-opt-in?token=123&email=walter@example.org",
      });
      const res = await testHandler(GET, req, { database });
      const contact = await database.query.contacts.findFirst({
        where: eq(contacts.email, "walter@example.org"),
      });
      expect((contact?.doubleOptInConfirmed as number) > 0).toBe(true);
      expect(res._getStatusCode()).toBe(200);
      expect(res._getData().includes("Thanks for signing up")).toBe(true);
      expect(outbox[0]?.message.includes("successfully")).toBe(true);
    });
  });

  test("send email with incorrect token", async () => {
    await isolate(database, async (tx) => {
      await tx.insert(contacts).values({
        id: randomId("con"),
        email: "walter@example.org",
        created: Date.now(),
        doubleOptInToken: "123",
      });
      const req = createRequest({
        url: "/double-opt-in?token=abc&email=walter@example.org",
      });
      const res = await testHandler(GET, req, { database });
      const contact = await database.query.contacts.findFirst({
        where: eq(contacts.email, "walter@example.org"),
      });
      expect(contact?.doubleOptInConfirmed).toBe(null);
      expect(res._getStatusCode()).toBe(200);
      expect(res._getData().includes("Invalid")).toBe(true);
    });
  });
});

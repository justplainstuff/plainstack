import database from "app/config/database";
import { GET } from "app/routes/double-opt-in";
import { createRequest } from "node-mocks-http";
import { outbox, randomId, rollback, testHandler } from "plainstack";
import { describe, expect, test } from "vitest";

describe("double opt in", () => {
  test("send email with correct token and email", async () => {
    await rollback(database, async (tx) => {
      await tx
        .insertInto("contacts")
        .values({
          id: randomId("con"),
          email: "walter@example.org",
          createdAt: Date.now(),
          doubleOptInSent: Date.now(),
          doubleOptInToken: "123",
        })
        .execute();

      const req = createRequest({
        url: "/double-opt-in?token=123&email=walter@example.org",
      });
      const res = await testHandler(GET, req, { database: tx });
      const contact = await tx
        .selectFrom("contacts")
        .selectAll()
        .where("email", "=", "walter@example.org")
        .executeTakeFirstOrThrow();
      expect((contact?.doubleOptInConfirmed as number) > 0).toBe(true);
      expect(res._getStatusCode()).toBe(200);
      expect(res._getData().includes("Thanks for signing up")).toBe(true);
      expect(outbox[0]?.message.includes("successfully")).toBe(true);
    });
  });

  test("send email with incorrect token", async () => {
    await rollback(database, async (tx) => {
      await tx
        .insertInto("contacts")
        .values({
          id: randomId("con"),
          email: "walter@example.org",
          createdAt: Date.now(),
          doubleOptInToken: "123",
        })
        .execute();
      const req = createRequest({
        url: "/double-opt-in?token=abc&email=walter@example.org",
      });
      const res = await testHandler(GET, req, { database });
      const contact = await tx
        .selectFrom("contacts")
        .selectAll()
        .executeTakeFirstOrThrow();
      expect(contact?.doubleOptInConfirmed).toBe(null);
      expect(res._getStatusCode()).toBe(200);
      expect(res._getData().includes("Invalid")).toBe(true);
    });
  });
});

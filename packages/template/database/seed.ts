import type { DB } from "app/schema";
import type { Kysely } from "kysely";
import { randomId } from "plainstack";

export async function seed(db: Kysely<DB>): Promise<void> {
  db.insertInto("users").values({
    id: randomId(),
    email: "user@example.com",
    createdAt: Date.now(),
  });
}

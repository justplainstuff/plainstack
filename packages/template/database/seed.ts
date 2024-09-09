import type { DB } from "app/schema";
import type { Kysely } from "kysely";

export async function seed(db: Kysely<DB>): Promise<void> {
  await db
    .insertInto("users")
    .values({
      id: "usr_123",
      email: "user@example.com",
      createdAt: Date.now(),
    })
    .execute();
}

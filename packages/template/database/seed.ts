import type { Database } from "app/config/database";

export async function seed(db: Database): Promise<void> {
  await db
    .insertInto("users")
    .values({
      id: "usr_123",
      email: "user@example.com",
      createdAt: Date.now(),
    })
    .execute();
}

import type { Database } from "app/config/database";
import { randomId } from "plainstack";

export async function createUser(db: Database, email: string) {
  if (
    await db
      .selectFrom("users")
      .selectAll()
      .where("email", "=", email)
      .executeTakeFirst()
  )
    throw new Error("User already exists");
  const created = { id: randomId("usr"), email: email, createdAt: Date.now() };
  await db.insertInto("users").values(created).execute();
  return created;
}

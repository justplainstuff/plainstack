import type { Database } from "app/config/database";
import { users } from "app/config/schema";
import { eq } from "drizzle-orm";

export async function createUser(db: Database, email: string) {
  if (
    await db.query.users.findFirst({
      where: (user) => eq(user.email, email),
    })
  )
    throw new Error("User already exists");
  const created = { email: email, created: Date.now() };
  await db.insert(users).values(created);
  return created;
}

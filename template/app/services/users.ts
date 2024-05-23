import { eq } from "drizzle-orm";
import { db } from "~/app/database/database";
import { users } from "~/app/database/schema";

export async function createUser(email: string) {
  if (
    await db.query.users.findFirst({
      where: (user) => eq(user.email, email),
    })
  )
    return "User already exists";
  const created = { email: email, created: Date.now() };
  await db.insert(users).values(created);
  return created;
}

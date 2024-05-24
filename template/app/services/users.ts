import { eq } from "drizzle-orm";
import { Db } from "~/app/database/database";
import { users } from "~/app/database/schema";

export async function createUser(db: Db, email: string) {
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

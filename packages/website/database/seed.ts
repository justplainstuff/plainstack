import type { Database } from "app/config/database";
import type { Contacts } from "app/config/schema";
import { defineSeed, randomId } from "plainstack";

export default defineSeed(async (db: Database) => {
  const now = Math.floor(Date.now() / 1000);
  const contactsData = Array.from({ length: 50 }, (_, i) => ({
    id: randomId(),
    email: `user${i + 1}@example.com`,
    createdAt: now - Math.floor(Math.random() * 30 * 24 * 60 * 60), // Random creation date within the last 30 days
    doubleOptInSent: Math.random() > 0.5 ? now : null,
    doubleOptInConfirmed: Math.random() > 0.3 ? now : null,
    doubleOptInToken: `token_${Math.random().toString(36).substring(2, 15)}`,
  })) satisfies Contacts[];
  await db.insertInto("contacts").values(contactsData).execute();
  await db
    .insertInto("sparks")
    .values({
      nr: 1,
      last: now,
    })
    .execute();
});

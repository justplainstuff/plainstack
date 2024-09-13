import type { Database } from "app/config/database";

export async function seed(db: Database): Promise<void> {
  // const now = Math.floor(Date.now() / 1000);
  // const contactsData = Array.from({ length: 50 }, (_, i) => ({
  //   id: randomId(),
  //   email: `user${i + 1}@example.com`,
  //   created: now - Math.floor(Math.random() * 30 * 24 * 60 * 60), // Random creation date within the last 30 days
  //   doubleOptInSent: Math.random() > 0.5 ? now : undefined,
  //   doubleOptInConfirmed: Math.random() > 0.3 ? now : undefined,
  //   doubleOptInToken: `token_${Math.random().toString(36).substring(2, 15)}`,
  // }));
  // await db.insert(contacts).values(contactsData).onConflictDoNothing();
  // await db
  //   .insert(sparks)
  //   .values({
  //     nr: 1,
  //     last: now,
  //   })
  //   .onConflictDoNothing();
  // log.info("seeding completed successfully");
}

import { eq } from "drizzle-orm";
import { Database, database } from "~/app/config/database";
import { Contact, contacts } from "~/app/config/schema";
import { perform, sendMail } from "plainweb";
import doubleOptIn from "~/app/tasks/double-opt-in";

export async function sendDoubleOptInEmail(
  database: Database,
  contact: Contact
) {
  console.log("Sending double opt-in email to", contact.email);
  await sendMail({
    from: "josef@plainweb.dev",
    to: contact.email,
    subject: "plainweb.dev",
    text: "Thanks for signing up!", // TODO
  });
  await database
    .update(contacts)
    .set({ doubleOptInSent: Date.now() })
    .where(eq(contacts.email, contact.email));
}

export async function createContact(email: string) {
  const inserted = await database
    .insert(contacts)
    .values({ email, created: Date.now() })
    .returning();
  await perform(doubleOptIn, inserted[0]);
}

import { eq } from "drizzle-orm";
import { Database } from "~/app/config/database";
import { Contact, contacts } from "~/app/config/schema";
import { perform, sendMail } from "plainweb";
import doubleOptIn from "~/app/tasks/double-opt-in";
import { env } from "~/app/config/env";

function getBaseUrl() {
  return env.NODE_ENV === "production"
    ? "https://plainweb.dev"
    : "http://localhost:3000";
}

export async function sendDoubleOptInEmail(
  database: Database,
  contact: Contact
) {
  console.log(
    `Sending double opt-in email to ${contact.email} using base url ${getBaseUrl()}`
  );
  await sendMail({
    from: "josef@plainweb.dev",
    to: contact.email,
    subject: "plainweb.dev",
    text: `Please verify using the link below that you signed up to plainweb.dev:

${getBaseUrl()}/double-opt-in?email=${encodeURIComponent(contact.email)}&token=${encodeURIComponent(contact.doubleOptInToken)}

Regards,
Josef
    `,
  });
  await database
    .update(contacts)
    .set({ doubleOptInSent: Date.now() })
    .where(eq(contacts.email, contact.email));
}

export async function createContact(database: Database, email: string) {
  const token = Math.random().toString(36).substring(2, 15);
  const found = await database.query.contacts.findFirst({
    where: eq(contacts.email, email),
  });
  if (!found) {
    const inserted = await database
      .insert(contacts)
      .values({ email, created: Date.now(), doubleOptInToken: token })
      .returning();
    await perform(doubleOptIn, inserted[0]);
  } else {
    console.log("Contact already exists, sending new email", found.email);
    await perform(doubleOptIn, found);
  }
}

export async function verifyDoubleOptIn(
  database: Database,
  {
    email,
    token,
  }: {
    email: string;
    token: string;
  }
) {
  const contact = await database.query.contacts.findFirst({
    where: eq(contacts.email, email),
  });
  if (contact?.doubleOptInConfirmed) return contact;
  if (!contact || contact.doubleOptInToken !== token) return null;
  await database
    .update(contacts)
    .set({ doubleOptInConfirmed: Date.now() })
    .where(eq(contacts.email, email));
  await sendMail({
    from: "josef@plainweb.dev",
    to: email,
    subject: "plainweb.dev",
    text: `You have successfully signed up to plainweb.dev!\n\nRegards,\nJosef`,
  });
  return contact;
}

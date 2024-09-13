import type { Database } from "app/config/database";
import env from "app/config/env";
import mailer from "app/config/mailer";
import type { Contacts } from "app/config/schema";
import doubleOptIn from "app/jobs/double-opt-in";
import { getLogger, perform, randomId, sendMail } from "plainstack";

function getBaseUrl() {
  return env.NODE_ENV === "production"
    ? "https://plainweb.dev"
    : "http://localhost:3000";
}

export async function sendDoubleOptInEmail(
  database: Database,
  contact: Contacts,
) {
  const log = getLogger("contacts");
  log.info(
    `Sending double opt-in email to ${contact.email} using base url ${getBaseUrl()}`,
  );
  await sendMail(mailer, {
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
    .updateTable("contacts")
    .set({ doubleOptInSent: Date.now() })
    .where("email", "=", contact.email)
    .execute();
}

export async function createContact(database: Database, email: string) {
  const log = getLogger("contacts");
  const token = Math.random().toString(36).substring(2, 15);
  const found = await database
    .selectFrom("contacts")
    .selectAll()
    .where("email", "=", email)
    .executeTakeFirst();
  if (!found) {
    const inserted = await database
      .insertInto("contacts")
      .values({
        id: randomId("con"),
        email,
        createdAt: Date.now(),
        doubleOptInToken: token,
      })
      .returningAll()
      .execute();
    await perform(doubleOptIn, inserted[0]);
  } else {
    log.info("Contact already exists, sending new email", found.email);
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
  },
) {
  const contact = await database
    .selectFrom("contacts")
    .selectAll()
    .where("email", "=", email)
    .executeTakeFirst();
  if (contact?.doubleOptInConfirmed) return contact;
  if (!contact || contact.doubleOptInToken !== token) return null;
  await database
    .updateTable("contacts")
    .set({ doubleOptInConfirmed: Date.now() })
    .where("email", "=", email)
    .execute();
  await sendMail(mailer, {
    from: "josef@plainweb.dev",
    to: email,
    subject: "plainweb.dev",
    text: "You have successfully signed up to plainweb.dev!\n\nRegards,\nJosef",
  });
  return contact;
}

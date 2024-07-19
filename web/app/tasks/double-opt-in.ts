import { database } from "app/config/database";
import { type Contact, contacts } from "app/schema";
import { sendDoubleOptInEmail } from "app/services/contacts";
import { eq } from "drizzle-orm";
import { defineTask } from "plainweb";

export default defineTask<Contact>(database, {
  name: __filename,
  batchSize: 5,
  async process({ data }) {
    await sendDoubleOptInEmail(database, data);
  },
  async success({ data }) {
    await database
      .update(contacts)
      .set({ doubleOptInSent: Date.now() })
      .where(eq(contacts.email, data.email));
  },
});

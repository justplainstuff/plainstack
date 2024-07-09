import { eq } from "drizzle-orm";
import { defineDatabaseTask } from "plainweb";
import { database } from "~/app/config/database";
import { type Contact, contacts } from "~/app/config/schema";
import { sendDoubleOptInEmail } from "~/app/services/contacts";

export default defineDatabaseTask<Contact>(database, {
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

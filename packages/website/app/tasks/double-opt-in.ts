import { database } from "app/config/database";
import type { Contact } from "app/schema";
import { sendDoubleOptInEmail } from "app/services/contacts";
import { defineJob } from "plainstack";

export default defineJob<Contact>(database, {
  name: __filename,
  async process({ data }) {
    await sendDoubleOptInEmail(database, data);
  },
});

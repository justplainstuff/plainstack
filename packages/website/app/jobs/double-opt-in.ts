import database from "app/config/database";
import type { Contacts } from "app/config/schema";
import { sendDoubleOptInEmail } from "app/services/contacts";
import { defineJob } from "plainstack";

export default defineJob<Contacts>({
  name: import.meta.filename,
  async run({ data }) {
    await sendDoubleOptInEmail(database, data);
  },
});

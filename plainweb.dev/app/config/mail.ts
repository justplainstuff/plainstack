import { createTransport } from "nodemailer";
import { env } from "~/app/config/env";

export const mail = createTransport({
  host: env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

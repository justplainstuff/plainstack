import { env } from "app/config/env";
import { createTransport } from "nodemailer";

export const mail = createTransport({
  host: env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

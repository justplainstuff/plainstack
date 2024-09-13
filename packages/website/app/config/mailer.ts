import { defineMailer } from "plainstack";
import env from "./env";

export default defineMailer({
  host: env.SMTP_HOST,
  port: 587,
  secure: true,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

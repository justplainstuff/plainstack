import nodemailer from "nodemailer";
import type JSONTransport from "nodemailer/lib/json-transport";
import type Mail from "nodemailer/lib/mailer";
import { getLogger } from "./log";

const log = getLogger("mail");

const devTransporter = nodemailer.createTransport({
  jsonTransport: true,
});

/**
 * This outbox traps sent emails during testing (NODE_ENV=test).
 * Access the outbox during testing to assert on sent emails.
 */
export const outbox: JSONTransport.SentMessageInfo[] = [];

export function defineMailer(config: {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}): nodemailer.Transporter {
  return nodemailer.createTransport(config);
}

/** Send an email using the configured mailer. */
export async function sendMail(
  mailer: nodemailer.Transporter,
  mailOptions: Mail.Options,
): Promise<void> {
  if (
    process.env.NODE_ENV === "test" ||
    process.env.NODE_ENV === "development"
  ) {
    const result = await devTransporter.sendMail(mailOptions);
    outbox.push(result);
    log.info("email sent to dev outbox -------------", mailOptions);
    log.info(result.envelope);
    log.info(result.message);
    return;
  }
  await mailer.sendMail(mailOptions);
}

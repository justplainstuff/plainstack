import type { MailerConfig } from "config";
import { getLogger } from "log";
import nodemailer from "nodemailer";
import type JSONTransport from "nodemailer/lib/json-transport";
import type Mail from "nodemailer/lib/mailer";

const log = getLogger("mail");

const devTransporter = nodemailer.createTransport({
  jsonTransport: true,
});

/**
 * This outbox traps sent emails during testing (NODE_ENV=test).
 * Access the outbox during testing to assert on sent emails.
 */
export const outbox: JSONTransport.SentMessageInfo[] = [];

function instantiateMailer(config: MailerConfig): nodemailer.Transporter {
  if (
    "host" in config &&
    "port" in config &&
    "secure" in config &&
    "auth" in config
  ) {
    return nodemailer.createTransport(config);
  }
  return config as nodemailer.Transporter;
}

/** Send an email using the configured mailer. */
export async function sendMail(
  config: MailerConfig,
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
  await instantiateMailer(config).sendMail(mailOptions);
}

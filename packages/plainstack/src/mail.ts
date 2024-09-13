import nodemailer, { type Transporter } from "nodemailer";
import type JSONTransport from "nodemailer/lib/json-transport";
import type Mail from "nodemailer/lib/mailer";
import { getLogger } from "./log";

export const devMailer = nodemailer.createTransport({
  jsonTransport: true,
});

/**
 * This outbox traps sent emails during testing (NODE_ENV=test).
 * Access the outbox during testing to assert on sent emails.
 */
export const outbox: JSONTransport.SentMessageInfo[] = [];

/**
 * Define a mailer using nodemailer, that can be used to send emails.
 */
export function defineMailer(config: {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}): Transporter {
  return nodemailer.createTransport(config);
}

export function isMailer(m: unknown): m is Transporter {
  return typeof m === "object" && m !== null && "sendMail" in m;
}

/** Send an email by providing a mailers instance. */
export async function sendMail(
  mailer: Transporter,
  mailOptions: Mail.Options,
): Promise<void> {
  const log = getLogger("mail");
  if (
    process.env.NODE_ENV === "test" ||
    process.env.NODE_ENV === "development"
  ) {
    const result = await devMailer.sendMail(mailOptions);
    outbox.push(result);
    log.info("email sent to dev outbox -------------", mailOptions);
    log.info(result.envelope);
    log.info(result.message);
    return;
  }
  await mailer.sendMail(mailOptions);
}

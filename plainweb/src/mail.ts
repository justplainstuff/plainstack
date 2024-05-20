import Mail from "nodemailer/lib/mailer";
import nodemailer, { SentMessageInfo } from "nodemailer";

const devTransporter = nodemailer.createTransport({
  jsonTransport: true,
});

export const transporter: {
  transporter: nodemailer.Transporter;
} = {
  transporter: devTransporter,
};

export const outbox: SentMessageInfo[] = [];

export function useTransporter(mail: nodemailer.Transporter) {
  transporter.transporter = mail;
}

export async function sendMail(mailOptions: Mail.Options): Promise<void> {
  if (
    process.env.NODE_ENV === "test" ||
    process.env.NODE_ENV === "development"
  ) {
    const result = await devTransporter.sendMail(mailOptions);
    outbox.push(result);
    console.log("Email sent to dev outbox -------------", mailOptions);
    console.log(result.envelope);
    console.log(result.message);
    return;
  }
  await transporter.transporter.sendMail(mailOptions);
}

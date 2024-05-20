import { html, RouteHandler } from "plainweb";
import RootLayout from "~/app/root";
import z from "zod";
import { db } from "~/app/database/database";
import { contacts } from "~/app/database/schema";

export const POST: RouteHandler = async ({ res, req }) => {
  const parsed = z.object({ email: z.string() }).safeParse(req.body);
  if (!parsed.success) {
    return html(
      res,
      <div class="text-lg text-error leading-8">
        Please provide a valid email address
      </div>,
    );
  }
  await db
    .insert(contacts)
    .values({ email: parsed.data.email, created: Date.now() });
  return html(
    res,
    <div class="text-lg leading-8">
      Thanks for subscribing, I'll keep you posted!
    </div>,
  );
};

export const GET: RouteHandler = async ({ res }) => {
  return html(res, <RootLayout></RootLayout>);
};

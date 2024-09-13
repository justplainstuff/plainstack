import type { PropsWithChildren } from "@kitajs/html";
import type { Database } from "app/config/database";
import Layout from "app/layouts/root";
import { verifyDoubleOptIn } from "app/services/contacts";
import { defineHandler } from "plainstack";
import z from "zod";

function Message(props: PropsWithChildren) {
  return (
    <Layout>
      <div class="mx-auto max-w-4xl pb-24 py-10 sm:pb-32 px-8">
        <h2 class="text-4xl font-bold tracking-tight text-base-content">
          {props.children}
        </h2>
      </div>
    </Layout>
  );
}

export const GET = defineHandler(async ({ req, res }) => {
  const database = res.locals.database as Database;
  const parsed = z
    .object({
      email: z.string().transform((e) => decodeURIComponent(e)),
      token: z.string().transform((t) => decodeURIComponent(t)),
    })
    .safeParse(req.query);
  if (!parsed.success)
    return <Message>Invalid email or token provided, please try again</Message>;
  const contact = await verifyDoubleOptIn(database, parsed.data);
  if (!contact)
    return <Message>Invalid email or token provided, please try again</Message>;
  return <Message>Thanks for signing up!</Message>;
});

import Html from "@kitajs/html";
import { renderCode } from "~/app/services/render-code";

const features: { title: string; content: () => JSX.Element }[] = [
  {
    title: "app/routes/signup.tsx",
    content: async () => {
      const code = `
import { zfd } from "zod-form-data";
import { type Handler } from "plainweb";
import { database } from "~/app/config/database";
import { contacts } from "~/app/config/schema";
import { createContact } from "~/app/services/contacts";
import { Form } from "~/app/components/form";

export const POST: Handler = async ({ req }) => {
  const parsed = zfd 
    .formData({ email: zfd.text().refine((e) => e.includes("@")) })
    .safeParse(req.body);

  if (!parsed.success) { 
    return <Form email={parsed.data.email} error="Invalid email" />;
  }

  await createContact(database, parsed.data.email); 
  return <div>Thanks for subscribing!</div>;
}

export const GET: Handler = async () => {
  return <Form />;
}

`;
      const safeCode = await renderCode(code, "tsx");
      return <div>{safeCode}</div>;
    },
  },
  {
    title: "app/components/form.tsx",
    content: async () => {
      const code = `
export interface FormProps {
  email?: string;
  error?: string;
}

export function Form(props: FormProps) {
  return ( 
    <form hx-post="/signup">
      <input type="email" name="email" value={props.email} />
      {props.error && <span>{props.error}</span>}
      <button>Subscribe</button>
    </form>
  );
}

`;
      const safeCode = await renderCode(code, "tsx");
      return <div>{safeCode}</div>;
    },
  },
  {
    title: "app/services/contacts.ts",
    content: async () => {
      const code = `
import { sendMail } from "plainweb";
import { type Database } from "~/app/config/database";
import { contacts } from "~/app/config/schema";

export async function createContact(database: Database, email: string) {
   await sendMail({
     from: "sender@example.org",
     to: email,
     subject: "Hey there",
     text: "Thanks for signing up!",
   });
   await database.insert(contacts).values({ email });
}

`;
      const safeCode = await renderCode(code, "typescript");
      return <div>{safeCode}</div>;
    },
  },
  {
    title: "app/config/schema.ts",
    content: async () => {
      const code = `
import { text, sqliteTable, int } from "drizzle-orm/sqlite-core";

export const contacts = sqliteTable("contacts", {
  email: text("email").primaryKey(),
  created: int("created").notNull(),
  doubleOpted: int("double_opted"),
});

export type Contact = typeof contacts.$inferSelect;

`;
      const safeCode = await renderCode(code, "typescript");
      return <div>{safeCode}</div>;
    },
  },
  {
    title: "app/config/database.ts",
    content: async () => {
      const code = `
import BetterSqlite3Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { env } from "~/app/config/env";
import * as schema from "./schema";

const connection = new BetterSqlite3Database(env.DB_URL);
connection.pragma("journal_mode = WAL");

export const database = drizzle<typeof schema>(connection, { schema });
export type Database = typeof database;

`;
      const safeCode = await renderCode(code, "typescript");
      return <div>{safeCode}</div>;
    },
  },
  {
    title: "app/config/env.ts",
    content: async () => {
      const code = `
import dotenv from "dotenv";
import z from "zod";

dotenv.config();

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.coerce.number().default(3000),
  DB_URL: z.string().default("db.sqlite3")
})

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);

`;
      const safeCode = await renderCode(code, "typescript");
      return <div>{safeCode}</div>;
    },
  },
  {
    title: "app/cli/serve.ts",
    content: async () => {
      const code = `
import { debug, env } from "~/app/config/env";
import { http } from "~/app/config/http";

async function serve() {
  await http();
  debug && console.log(\`⚡️ http://localhost:\${env.PORT}\`);
}

void serve();

`;
      const safeCode = await renderCode(code, "typescript");
      return <div>{safeCode}</div>;
    },
  },
];

const fileTree = {
  app: {
    routes: ["signup.tsx"],
    components: ["form.tsx"],
    services: ["contacts.ts"],
    config: ["schema.ts", "database.ts", "env.ts"],
    cli: ["serve.ts"],
  },
};

function renderTree(tree: Record<string, unknown>, prefix = "", isRoot = true) {
  return (
    <ul class={`${isRoot ? "" : "ml-3"}`}>
      {Object.entries(tree).map(([safeKey, value], index, array) => {
        const isLastItem = index === array.length - 1;
        return (
          <li>
            <div>
              <span class="font-normal">
                {isRoot ? "" : isLastItem ? "└── " : "├── "}
                {safeKey}/
              </span>
            </div>
            {Array.isArray(value) ? (
              <ul class="ml-0">
                {value.map((file, fileIndex, fileArray) => (
                  <li>
                    <span>
                      {isLastItem ? " &nbsp; " : "│ "}
                      {fileIndex === fileArray.length - 1 ? "└── " : "├── "}
                    </span>
                    <button
                      type="submit"
                      x-on:click={`open = '${prefix}${safeKey}/${file}'`}
                      x-bind:class={`{'text-primary': open === '${prefix}${safeKey}/${file}'}`}
                      class="hover:text-primary focus:outline-none font-bold link"
                    >
                      {Html.escapeHtml(file)}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              renderTree(
                value as Record<string, unknown>,
                `${prefix}${safeKey}/`,
                false,
              )
            )}
          </li>
        );
      })}
    </ul>
  );
}

export async function Showcase() {
  return (
    <div x-data={`{open: '${features[0]?.title}'}`} class="mt-10 md:flex">
      <div class="font-mono overflow-y-auto max-h-[calc(100vh-200px)] pr-4 flex-shrink-0">
        {renderTree(fileTree)}
      </div>
      <div class="mt-2 lg:mt-0 lg:ml-6 border-l-2 p-2 px-2 lg:px-6 rounded-lg w-full bg-[#282A36] overflow-x-auto">
        {features.map((feature, idx) => {
          const safe = feature.content;
          return (
            <div
              x-show={`open === '${feature.title}'`}
              style={idx > 0 ? "display:none" : ""}
            >
              <div>{safe()}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

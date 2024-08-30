import Html from "@kitajs/html";
import { renderCode } from "app/services/render-code";

const features: { title: string; content: () => JSX.Element }[] = [
  {
    title: "repo/app/routes/signup.tsx",
    content: async () => {
      const code = `
import { zfd } from "zod-form-data";
import { type Handler } from "plainstack";
import { database } from "app/config/database";
import { contacts } from "app/schema";
import { createContact } from "app/services/contacts";
import { Form } from "app/components/form";

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
      return await renderCode(code, "tsx");
    },
  },
  {
    title: "repo/app/components/form.tsx",
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
      return await renderCode(code, "tsx");
    },
  },
  {
    title: "repo/app/services/contacts.ts",
    content: async () => {
      const code = `
import { sendMail } from "plainstack";
import { type Database } from "app/config/database";
import { contacts } from "app/schema";

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
      return await renderCode(code, "typescript");
    },
  },
  {
    title: "repo/plainweb.config.ts",
    content: async () => {
      const code = `
import { env } from "app/config/env";
import middleware from "app/config/middleware";
import * as schema from "app/schema";
import { defineConfig } from "plainstack";

export default defineConfig({
  nodeEnv: env.NODE_ENV,
  http: {
    port: env.PORT ?? 3000,
    staticPath: "/public",
    middleware,
  },
  database: {
    dbUrl: env.DB_URL ?? "db.sqlite3",
    schema: schema,
    pragma: {
      journal_mode: "WAL",
    },
  },
  mail: {
    default: {
      host: env.SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    },
  },
});

`;
      return await renderCode(code, "typescript");
    },
  },
  {
    title: "repo/app/schema.ts",
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
      return await renderCode(code, "typescript");
    },
  },
  {
    title: "repo/app/config/database.ts",
    content: async () => {
      const code = `
import { getDatabase } from "plainstack";
import config from "plainweb.config";

export const database = getDatabase(config);
export type Database = typeof database;

`;
      return await renderCode(code, "typescript");
    },
  },
  {
    title: "repo/app/config/env.ts",
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
      return await renderCode(code, "typescript");
    },
  },
  {
    title: "repo/app/cli/serve.ts",
    content: async () => {
      const code = `
import { getApp, log } from "plainstack";
import config from "plainweb.config";

async function serve() {
  const app = await getApp(config);
  app.listen(config.http.port);
  log.info(\`⚡️ http://localhost:\${config.http.port}\`);
}

serve();

`;
      return await renderCode(code, "typescript");
    },
  },
];

const fileTree = {
  repo: {
    "plainweb.config.ts": true,
    app: {
      "schema.ts": true,
      routes: ["signup.tsx"],
      components: ["form.tsx"],
      services: ["contacts.ts"],
      config: ["database.ts", "env.ts"],
      cli: ["serve.ts"],
    },
  },
};

function renderTree(tree: Record<string, unknown>, prefix = "", isRoot = true) {
  return (
    <ul class={`${isRoot ? "" : "ml-3"}`}>
      {Object.entries(tree).map(([key, value], index, array) => {
        const isLastItem = index === array.length - 1;
        const isFile = typeof value === "boolean";
        const safeKey = `${key}/`;

        return (
          <li>
            <div>
              <span class="font-normal">
                {isRoot ? "" : isLastItem ? "└── " : "├── "}
                {isFile ? (
                  <button
                    type="submit"
                    x-on:click={`open = '${prefix}${key}'`}
                    x-bind:class={`{'text-primary': open === '${prefix}${key}'}`}
                    class="hover:text-primary focus:outline-none font-bold link"
                  >
                    {Html.escapeHtml(key)}
                  </button>
                ) : (
                  safeKey
                )}
              </span>
            </div>
            {!isFile ? (
              Array.isArray(value) ? (
                <ul class="ml-0">
                  {value.map((file, fileIndex, fileArray) => (
                    <li>
                      <span>
                        {isLastItem ? " &nbsp; " : "│ "}
                        {fileIndex === fileArray.length - 1 ? "└── " : "├── "}
                      </span>
                      <button
                        type="submit"
                        x-on:click={`open = '${prefix}${key}/${file}'`}
                        x-bind:class={`{'text-primary': open === '${prefix}${key}/${file}'}`}
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
                  `${prefix}${key}/`,
                  false,
                )
              )
            ) : null}
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
      <div class="mt-2 lg:mt-0 lg:ml-6 px-2 lg:px-6 rounded-lg w-full bg-[#282A36] overflow-x-auto">
        {features.map((feature, idx) => {
          const safe = feature.content;
          return (
            <div
              x-show={`open === '${feature.title}'`}
              style={idx > 0 ? "display:none" : ""}
            >
              {safe()}
            </div>
          );
        })}
      </div>
    </div>
  );
}

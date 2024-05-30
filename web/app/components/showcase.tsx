import Html from "@kitajs/html";
import { renderCode } from "~/app/services/render-code";

const features: { title: string; content: () => JSX.Element }[] = [
  {
    title: "HTMX",
    content: async () => {
      const code = `// app/routes/click.tsx
        
export const POST: Handler = async () => {
  return (<div>Clicked!</div>);
};

export const GET: Handler = async () => {
  return (
    <button hx-post="/click" hx-swap="outerHTML">
      Click Me
    </button>
  );
};       `;
      const safeCode = await renderCode(code);
      return <div>{safeCode}</div>;
    },
  },
  {
    title: "Routing",
    content: async () => {
      const code = `// app/routes/health.tsx

export const GET: Handler = async () => {
  try {
    await db.query.users.findFirst();
    return { status: "ok" };
  } catch (e) {
    return json({ status: "degraded" }, { status: 500 });
  }
};

// curl localhost:3000/health -> {"status":"ok"}

`;
      const safeCode = await renderCode(code);
      return <div>{safeCode}</div>;
    },
  },
  {
    title: "Streaming",
    content: async () => {
      const code = `// app/routes/index.tsx

async function HelloUser() {
  const user = await db.query.users.findFirst();
  return <div>Hello {user.name}</div>;
}

export const GET: Handler = async () => {
  return stream((rid) => (
    // Without React!
    <Suspense
      rid={rid}
      fallback={<div>Loading...</div>}
      catch={() => <div>Something went wrong</div>}
    >
      <HelloUser />
    </Suspense>
  ));
};

`;
      const safeCode = await renderCode(code);
      return <div class="bg-[#282A36] rounded-lg">{safeCode}</div>;
    },
  },
  {
    title: "Forms",
    content: async () => {
      const code = `// app/routes/signup.tsx
      
export const POST: Handler = async ({ req }) => {
  const parsed = zfd
    .formData({ email: zfd.text().refine((e) => e.includes("@")) })
    .safeParse(req.body);
  if (!parsed.success) {
    return <div>Please provide a valid email address</div>;
  }

  await createContact({ email: parsed.data.emaill });
  return <div>Thanks for subscribing!</div>;
};

      `;
      const safeCode = await renderCode(code);
      return <div class="bg-[#282A36] rounded-lg">{safeCode}</div>;
    },
  },
  {
    title: "Database",
    content: async () => {
      const code = `// app/config/schema.ts

export const contacts = sqliteTable("contacts", {
  email: text("email").primaryKey(),
  created: int("created").notNull(),
  doubleOpted: integer("double_opted"),
});

export type Contact = typeof contacts.$inferSelect;

// pnpm db:generate -> create .sql files
// pnpm db:migrate  -> apply .sql files

// app/routes/contacts.tsx

const contacts = await db.query.contacts.findMany({
  where: (contacts, { lte }) =>
    lte(contacts.created, Date.now() - 1000 * 60 * 60 * 24 * 7),
});

`;
      const safeCode = await renderCode(code);
      return <div>{safeCode}</div>;
    },
  },
  {
    title: "Tasks",
    content: async () => {
      const code = `// app/config/schema.ts

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  data: text("data", { mode: "json" }).notNull(),
  created: int("created").notNull(),
  failedLast: int("failed_last"),
  failedNr: int("failed_nr"),
  failedError: text("failed_error"),
});

// app/tasks/double-opt-in.ts

export default defineDatabaseTask<Contact>(database, {
  batchSize: 5,
  async process({ data }) {
    await sendDoubleOptInEmail(database, data);
  },
  async success({ data }) {
    await database
      .update(contacts)
      .set({ doubleOptInSent: Date.now() })
      .where(eq(contacts.email, data.email));
  },
});

// app/routes/index.tsx

await perform(doubleOptIn, contact)

      `;
      const safeCode = await renderCode(code);
      return <div>{safeCode}</div>;
    },
  },
  {
    title: "Emails",
    content: async () => {
      const code = `// app/config/mail.ts
      
export const mail = createTransport({
  host: env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

// app/services/contacts.ts

await sendMail({
  from: "sender@example.org",
  to: contact.email,
  subject: "Hey there",
  text: "Thanks for signing up!", // TODO
});

      `;
      const safeCode = await renderCode(code);
      return <div>{safeCode}</div>;
    },
  },
  {
    title: "Testing",
    content: async () => {
      const code = `// app/services/users.test.ts

describe("users", async () => {
  before(() => migrate(db));
 
  test("createUser already exists", async () =>
    isolate(db, async (tx) => {
      await createUser(tx, "aang@example.org");

      await assert.rejects(async () => {
        await createUser(tx, "aang@example.org");
      });
    }));
});

// pnpm test
// ▶ users
//  ✔ createUser (1.838375ms)
//  ✔ createUser already exists (0.833208ms)

`;
      const safeCode = await renderCode(code);
      return <div>{safeCode}</div>;
    },
  },
  {
    title: "Server",
    content: async () => {
      const code = `// app/config/http.ts
      
export async function http() {
  const app = express();
  if (env.NODE_ENV !== "production") app.use(morgan("dev"));
  if (env.NODE_ENV === "production") app.use(morgan("combined"));
  if (env.NODE_ENV === "development") app.use(errorHandler());
  if (env.NODE_ENV === "production") app.use(limiter);
  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static("public"));
  app.use(await fileRouter({ dir: "app/routes", debug: true }));
  app.listen(env.PORT);
}

        `;
      const safeCode = await renderCode(code);
      return <div>{safeCode}</div>;
    },
  },
  {
    title: "Env",
    content: async () => {
      const code = `// app/env.ts 
      
import dotenv from "dotenv";
import z from "zod";

dotenv.config();

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.coerce.number().default(3000),
  DB_URL: z.string().default("db.sqlite3"),
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);

`;
      const safeCode = await renderCode(code);
      return <div>{safeCode}</div>;
    },
  },
];

export async function Showcase() {
  return (
    <div
      x-data={`{open: '${features[0]!.title}'}`}
      class="mt-10 shadow-xl rounded-lg flex"
    >
      <div class="flex flex-col items-start rounded-l-lg whitespace-nowrap">
        {features.map((feature) => (
          <button
            x-on:click={`open = '${feature.title}'`}
            class={`btn btn-ghost w-full justify-start ${feature.title === features[0]!.title ? "btn-active" : ""}`}
            x-bind:class={`{'btn-active': open === '${feature.title}'}`}
          >
            {Html.escapeHtml(feature.title)}
          </button>
        ))}
      </div>
      <div class="border-l-2 p-2  px-2 lg:px-6 rounded-lg w-full bg-[#282A36] overflow-x-auto">
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

import Html from "@kitajs/html";
import { renderCode } from "~/app/utils/render-code";

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
    title: "Components",
    content: async () => {
      const code = `// app/components/video.tsx

export interface VideoProps {
  title: string;
  url: string;
  thumbnail: string;
}

export function Video({ title, url, string }: VideoProps) {
  return (
    <div>
      <a href={url}>
        <h3>{title}</h3>
      </a>
    </div>
  );
}

`;
      const safeCode = await renderCode(code);
      return <div class="bg-[#282A36] rounded-lg">{safeCode}</div>;
    },
  },
  {
    title: "Forms",
    content: async () => {
      const safeCode = await renderCode("");
      return <div class="bg-[#282A36] rounded-lg">{safeCode}</div>;
    },
  },
  {
    title: "Database",
    content: async () => {
      const code = `// app/database/schema.ts

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
    title: "Middleware",
    content: async () => {
      const code = `// app/http.ts
      
export async function http() {
  const app = express();
  if (env.NODE_ENV === "development") app.use(morgan("dev"));
  else app.use(morgan("combined"));
  if (env.NODE_ENV === "development") app.use(errorHandler());
  app.use(compression());
  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static("public"));
  app.use(await fileRouter({ dir: "app/routes" }));
  return app;
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
      <div class="border-l-2 p-2  px-2 lg:px-6 rounded-lg w-full bg-[#282A36]">
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

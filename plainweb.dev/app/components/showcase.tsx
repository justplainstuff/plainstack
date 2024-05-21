import Html from "@kitajs/html";
import { renderCode } from "~/app/utils/render-code";

const placeHolder = `// app/routes/index.tsx

export const POST: RouteHandler = async ({ req, res }) => {
  return json(res, { message: "Pong!" });
};

export const GET: RouteHandler = async ({ req, res }) => {
  return html(res, <div>Hello World!<div>);
};`;

const features: { title: string; content: () => JSX.Element }[] = [
  {
    title: "File Based Routing",
    content: async () => {
      const safeCode = await renderCode(placeHolder);
      return <div>{safeCode}</div>;
    },
  },
  {
    title: "JSX Components",
    content: async () => {
      const code = `// app/components/video.tsx

export interface VideoProps {
  video: {
    title: string;
    url: string;
    thumbnail: string;
  };
}

export function Video({ video }: VideoProps) {
  return (
    <div>
      <Thumbnail video={video} />
      <a href={video.url}>
        <h3 safe>{video.title}</h3>
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
    title: "Streaming",
    content: async () => {
      const safeCode = await renderCode(placeHolder);
      return <div class="bg-[#282A36] rounded-lg">{safeCode}</div>;
    },
  },
  {
    title: "Built for HTMX",
    content: async () => {
      const code = `// app/routes/click.tsx
        
export const POST: RouteHandler = async ({ req, res }) => {
  return html(res, <div>Clicked!</div>);
};

export const GET: RouteHandler = async ({ req, res }) => {
  return html(
    res,
    <RootLayout>
      <button hx-post="/click" hx-swap="outerHTML">
        Click Me
      </button>
    </RootLayout>
  );
};       `;
      const safeCode = await renderCode(code);
      return <div>{safeCode}</div>;
    },
  },
  {
    title: "SQLite",
    content: async () => {
      const safeCode = await renderCode(placeHolder);
      return <div>{safeCode}</div>;
    },
  },
  {
    title: "Explicit & Intuitive API",
    content: async () => {
      const safeCode = await renderCode(placeHolder);
      return <div>{safeCode}</div>;
    },
  },
  {
    title: "Simple Deployment",
    content: async () => {
      const safeCode = await renderCode(placeHolder);
      return <div>{safeCode}</div>;
    },
  },
  {
    title: "Testing",
    content: async () => {
      const safeCode = await renderCode(placeHolder);
      return <div>{safeCode}</div>;
    },
  },
  {
    title: "Cron Schedules",
    content: async () => {
      const safeCode = await renderCode(placeHolder);
      return <div>{safeCode}</div>;
    },
  },
  {
    title: "Middleware Stack",
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
    title: "Type-safe Env Vars",
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

export const env: Env = envSchema.parse(process.env);`;
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
            class="btn btn-ghost"
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

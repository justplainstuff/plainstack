const features: {
  title: string;
  content: string;
}[] = [
  {
    title: "Server-side rendering 🖥️",
    content: "Compose and render JSX on the server. Fully type-safe.",
  },
  {
    title: "No bundle.js 🚀",
    content: "Sprinkle HTMX and Alpine.js on top. No frontend build process.",
  },
  {
    title: "Streaming 🌊",
    content:
      "Stream responses using <Suspense/> without client-side JavaScript.",
  },
  {
    title: "File-based routing 📁",
    content:
      "The file system determines the URL paths. No more need to name your routes.",
  },
  {
    title: "Simple deployment 🔌",
    content: "A single process to deploy and manage.",
  },
  {
    title: "Type-safe SQL 🛡️",
    content: "Type-safe SQL query builder that gets out of your way.",
  },
  {
    title: "Background Tasks ⏱️",
    content:
      "Run persistent tasks in the background, concurrently or in-parallel.",
  },
  {
    title: "Testable 🧪",
    content: "Test services, components, routes, emails and tasks with ease.",
  },
  {
    title: "Minimal lock-in 🔓",
    content:
      "plainweb = SQLite + drizzle + Node.js + express + zod + nodemailer + HTMX",
  },
];

export function FeatureSection() {
  return (
    <div class="mx-auto max-w-4xl pb-24 py-10 sm:pb-32 px-2 md:px-8">
      <h2 class="text-4xl font-bold tracking-tight text-neutral">
        Key features
      </h2>
      <div class="my-10 text-xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature) => (
          <div class="rounded-lg shadow border p-4">
            <h2 safe class="text-xl font-semibold text-neutral mb-4">
              {feature.title}
            </h2>
            <p class={"text-base"} safe>
              {feature.content}
            </p>
          </div>
        ))}
      </div>
      <div class={"text-right"}>
        <a href="/docs/getting-started" class="link">
          Docs →
        </a>
      </div>
    </div>
  );
}

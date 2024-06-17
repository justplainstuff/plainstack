const features: string[] = [
  "Single process to deploy and manage",
  "No frontend build process",
  "HTMX support",
  "Server-side rendering",
  "File-based routing",
  "Response streaming",
  "Form validation",
  "Type-safe queries",
  "Migrations",
  "Testing",
  "Environment variables",
  "Tasks",
  "Emails",
];

export function FeatureSection() {
  return (
    <div class="mx-auto max-w-4xl pb-24 py-10 sm:pb-32 px-8">
      <h2 class="text-4xl font-bold tracking-tight text-neutral">Features</h2>
      <div class="mt-10 text-xl grid grid-cols-2">
        {features.map((feature) => (
          <p safe>✅ {feature}</p>
        ))}
      </div>
    </div>
  );
}

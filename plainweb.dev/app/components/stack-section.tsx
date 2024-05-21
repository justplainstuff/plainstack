const tech: string[] = [
  "htmx",
  "alpine",
  "daisy",
  "drizzle",
  "eslint",
  "express",
  "fly",
  "prettier",
  "sqlite",
  "tailwind",
  "typescript",
  "zod",
];

export function StackSection() {
  return (
    <div class="mx-auto max-w-4xl pb-24 py-10 sm:pb-32 px-8">
      <h2 class="text-4xl font-bold tracking-tight text-neutral">
        Solid tools, playing nice together
      </h2>
      <ul class="mt-6 text-neutral flex flex-wrap">
        {tech.map((name) => (
          <img
            loading="lazy"
            src={`/images/tech-logos/${name}.webp`}
            class="w-40"
          />
        ))}
      </ul>
    </div>
  );
}

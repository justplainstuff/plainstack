const tech: { name: string; width: number; height: number }[] = [
  { name: "htmx", width: 666, height: 126 },
  { name: "sqlite", width: 666, height: 316 },
  { name: "typescript", width: 666, height: 234 },
  // { name: "alpine", width: 666, height: 107 },
  // { name: "drizzle", width: 666, height: 166 },
  // { name: "express", width: 666, height: 183 },
  // { name: "tailwind", width: 666, height: 82 },
  // { name: "zod", width: 666, height: 349 },
  // { name: "node", width: 666, height: 408 },
];

export function StackSection() {
  return (
    <div class="mx-auto max-w-4xl pb-24 py-10 sm:pb-32 px-8">
      <h2 class="text-4xl font-bold tracking-tight text-neutral">
        A simple and rock solid foundation
      </h2>
      <ul class="mt-10 flex justify-between flex-wrap space-y-4">
        {tech.map(({ name, width, height }) => (
          <img
            loading="lazy"
            width={width}
            height={height}
            src={`/images/tech-logos/${name}.webp`}
            class="w-64 object-contain"
          />
        ))}
      </ul>
    </div>
  );
}

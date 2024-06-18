const tech: {
  name: string;
  width: number;
  height: number;
  alt: string;
  href?: string;
}[] = [
  // {
  //   name: "grug",
  //   width: 745,
  //   height: 663,
  //   alt: "Grug Brained Developer",
  //   href: "https://grugbrain.dev/",
  // },
  { name: "htmx", width: 666, height: 126, alt: "HTMX" },
  { name: "sqlite", width: 666, height: 316, alt: "SQLite" },
  { name: "typescript", width: 666, height: 234, alt: "TypeScript" },
  //  { name: "alpine", width: 666, height: 107, alt: "Alpine.js" },
  // { name: "drizzle", width: 666, height: 166, alt: "Drizzle" },
  // { name: "express", width: 666, height: 183, alt: "Express" },
  // { name: "tailwind", width: 666, height: 82, alt: "Tailwind CSS" },
  // { name: "zod", width: 666, height: 349, alt: "zod" },
  // { name: "node", width: 666, height: 408, alt: "Node.js" },
];

export function StackSection() {
  return (
    <div class="mx-auto max-w-4xl pb-24 py-10 sm:pb-32 px-8">
      <h2 class="text-4xl font-bold tracking-tight text-neutral">
        Built on simplicity
      </h2>
      <div class="mt-10 flex flex-col md:flex-row items-center justify-around flex-wrap space-y-4">
        {tech.map(({ name, width, height, alt, href }) =>
          href ? (
            <a href={href} aria-label={alt} target="_blank" rel="noopener">
              <img
                loading="lazy"
                width={width}
                height={height}
                alt={alt}
                src={`/public/images/tech-logos/${name}.webp`}
                class="h-14 w-auto object-contain"
              />
            </a>
          ) : (
            <img
              loading="lazy"
              width={width}
              height={height}
              alt={alt}
              src={`/public/images/tech-logos/${name}.webp`}
              class="h-14 w-auto object-contain"
            />
          )
        )}
      </div>
    </div>
  );
}

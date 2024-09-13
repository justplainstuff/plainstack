export async function PlatformSection() {
  const webConcepts = [
    "Query Params",
    "GET",
    "Form Data",
    "Migrations",
    "SQL",
    "Environment Variables",
    "POST",
    "JSON",
  ];

  return (
    <div class="mx-auto max-w-6xl pb-24 py-10 sm:pb-48 px-4 md:px-8 text-base-content">
      <h2 class="text-5xl md:text-6xl font-bold tracking-tight text-center">
        Use the Platform
      </h2>
      <p class="text-3xl font-bold text-center mt-6 text-base-content/70">
        If you know <span class="underline decoration-primary">web</span>, you
        know plainstack
      </p>
      <div class="mt-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {webConcepts.map((concept) => (
          <div class="bg-base-200 p-4 rounded-lg flex items-center">
            <svg
              class="w-6 h-6 text-success mr-3 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Checkmark</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span safe class="text-lg">
              {concept}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

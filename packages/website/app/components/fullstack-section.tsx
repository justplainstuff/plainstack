import { renderCode } from "app/services/render-code";

const code = `
export const POST = defineHandler(async ({ req }) => {
  const parsed = zfd
    .formData({ email: zfd.text() })
    .safeParse(req.body);

  if (!parsed.success) {
    return <Form email={parsed.data.email} error="Invalid email" />;
  }

  await database
    .insertInto("contacts")
    .values({ email: parsed.data.email })
    .execute();
  await perform(sendWelcomeEmail, parsed.data.email);
  return <div>Thanks for subscribing!</div>;
});

export const GET = defineHandler(async () => {
  return <Form />;
});

`;

export async function FullstackSection() {
  const safe = await renderCode(code, "tsx");
  return (
    <div class="mx-auto max-w-6xl pb-24 py-10 sm:pb-48 px-4 md:px-8 text-base-content">
      <h2 class="text-5xl md:text-6xl font-bold tracking-tight text-center">
        Truly Fullstack
      </h2>
      <p class="text-3xl font-bold text-center mt-6 text-base-content/70">
        Plainstack is a fullstack web framework for TypeScript
      </p>
      <div class="flex flex-col md:flex-row md:space-x-12 mt-20 text-lg">
        <div class="mb-8 md:mb-0 flex-1">
          <p>Think Laravel or Rails, with the good parts of Next.js:</p>
          <div class="mt-6 flex flex-col space-y-2">
            <div class="flex items-center">
              <span class="text-base-content">✅</span>
              <span class="ml-2">File Routes</span>
            </div>
            <div class="flex items-center">
              <span class="text-base-content">✅</span>
              <span class="ml-2">Type-safe JSX templates</span>
            </div>
            <div class="flex items-center">
              <span class="text-base-content">✅</span>
              <span class="ml-2">Database</span>
            </div>
            <div class="flex items-center">
              <span class="text-base-content">✅</span>
              <span class="ml-2">Schedules</span>
            </div>
            <div class="flex items-center">
              <span class="text-base-content">✅</span>
              <span class="ml-2">Mail</span>
            </div>
            <div class="flex items-center">
              <span class="text-base-content">✅</span>
              <span class="ml-2">Background Jobs</span>
            </div>
            <div class="flex items-center">
              <span class="text-base-content">✅</span>
              <span class="ml-2">
                ...and much{" "}
                <a class="link" href="/docs/getting-started">
                  more
                </a>
              </span>
            </div>
          </div>
        </div>
        <div class="md:flex-1">
          <div class="text-sm mt-2 w-full md:w-auto lg:mt-0 px-4 md:px-6 lg:px-8 py-6 rounded-lg bg-[#282A36] overflow-x-auto">
            {safe}
          </div>
        </div>
      </div>
    </div>
  );
}

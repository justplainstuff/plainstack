import { GithubIcon } from "app/components/icons";

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

export async function HeroSection() {
  return (
    <div class="mx-auto max-w-5xl pb-24 py-10 sm:pb-32 px-4 md:px-8 mt-20 lg:mt-26">
      <h1 class="text-7xl md:text-8xl font-bold tracking-tight text-base-content text-center">
        TypeScript web apps
        <br />{" "}
        <span
          class="underline cursor-pointer confetti-trigger decoration-primary"
          x-on:click="confetti({particleCount: 200, spread: 200, origin: { y: 0.6 }});"
        >
          plain
        </span>{" "}
        and simple
      </h1>
      <div class="mx-auto max-w-xl flex justify-center items-center space-x-2 mt-12">
        <a href="/docs/getting-started" class="btn btn-primary">
          Get Started →
        </a>
        <a
          href="https://github.com/justplainstuff/plainstack"
          class="btn btn-outline"
        >
          <GithubIcon class="size-7" />
        </a>
      </div>
      <div class="mt-10 text-center">
        <div class="select-all cursor-text rounded-lg px-5 py-2.5 inline-block border-2 border-base-content">
          <pre class="text-xl text-base-content">npm create plainstack</pre>
        </div>{" "}
      </div>
    </div>
  );
}

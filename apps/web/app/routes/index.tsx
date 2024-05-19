import { html, RouteHandler } from "plainweb";
import RootLayout from "~/app/root";
import z from "zod";
import { db } from "~/app/database/database";
import { contacts } from "~/app/database/schema";

const code = `import { type RouteHandler, html } from "plainweb";
import RootLayout from "~/app/root";

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
};`;

async function HeroSection() {
  const { codeToHtml } = await import("shiki");
  const safeCode = await codeToHtml(code, {
    lang: "javascript",
    theme: "vitesse-dark",
  });
  return (
    <div>
      <div class="mx-auto max-w-7xl pb-24 pt-10 sm:pb-32 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-40">
        <div class="px-6 lg:px-0 lg:pt-4">
          <div class="mx-auto max-w-2xl">
            <div class="max-w-lg">
              <h1 class="text-4xl font-bold tracking-tight text-neutral sm:text-6xl">
                Plain web development
              </h1>
              <p class="mt-6 text-lg leading-8 text-neutral-700">
                Plainweb is a simpler way to build apps, inspired by the grug
                brained developer{" "}
                <a href="https://grugbrain.dev/" class="btn-link">
                  <img src="/images/grug.png" class="inline-block w-6 h-6" />
                </a>
                . Stop overengineering, start shipping.
              </p>
              <div class="mt-10 gap-x-6">
                <p class="text-lg leading-8 mb-2 text-neutral-700">
                  Coming soon, get notified about the launch.
                </p>
                <form class="join" hx-post="/" hx-swap="outerHTML">
                  <input
                    name="email"
                    type="email"
                    class="input input-bordered join-item"
                    placeholder="Email"
                  />
                  <button type="submit" class="btn btn-primary join-item">
                    Sign up
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div class="md:mx-auto md:max-w-2xl lg:mx-0 mt-20 lg:mt-0 lg:w-screen px-8 md:px-0">
          <div class="shadow-xl rounded-lg bg-[#121212] p-5">{safeCode}</div>
        </div>
      </div>
    </div>
  );
}

function LogoCloudSection() {
  return (
    <div class="py-24 sm:py-32">
      <div class="mx-auto max-w-7xl px-6 lg:px-8">
        <div class="grid grid-cols-1 items-center gap-x-8 gap-y-16 lg:grid-cols-2">
          <div class="mx-auto w-full max-w-xl lg:mx-0">
            <h2 class="text-3xl font-bold tracking-tight text-gray-900">
              Only the most simple tools
            </h2>
            <p class="mt-6 text-lg leading-8 text-gray-600">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Et,
              egestas tempus tellus etiam sed. Quam a scelerisque amet
              ullamcorper eu enim et fermentum, augue.
            </p>
          </div>
          <div class="mx-auto grid w-full max-w-xl grid-cols-2 items-center gap-y-12 sm:gap-y-14 lg:mx-0 lg:max-w-none lg:pl-8">
            <img
              class="max-h-12 w-full object-contain object-left"
              src="https://tailwindui.com/img/logos/tuple-logo-gray-900.svg"
              alt="Tuple"
              width={105}
              height={48}
            />
            <img
              class="max-h-12 w-full object-contain object-left"
              src="https://tailwindui.com/img/logos/reform-logo-gray-900.svg"
              alt="Reform"
              width={104}
              height={48}
            />
            <img
              class="max-h-12 w-full object-contain object-left"
              src="https://tailwindui.com/img/logos/savvycal-logo-gray-900.svg"
              alt="SavvyCal"
              width={140}
              height={48}
            />
            <img
              class="max-h-12 w-full object-contain object-left"
              src="https://tailwindui.com/img/logos/laravel-logo-gray-900.svg"
              alt="Laravel"
              width={136}
              height={48}
            />
            <img
              class="max-h-12 w-full object-contain object-left"
              src="https://tailwindui.com/img/logos/transistor-logo-gray-900.svg"
              alt="Transistor"
              width={158}
              height={48}
            />
            <img
              class="max-h-12 w-full object-contain object-left"
              src="https://tailwindui.com/img/logos/statamic-logo-gray-900.svg"
              alt="Statamic"
              width={147}
              height={48}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FooterSection() {
  return (
    <footer class="mx-auto w-64 my-24 flex justify-around">
      <span>
        built with a 🪨 for{" "}
        <a href="https://grugbrain.dev/" class="btn-link">
          <img src="/images/grug.png" class="inline-block w-5 h-5" />
        </a>{" "}
      </span>
    </footer>
  );
}

export const POST: RouteHandler = async ({ res, req }) => {
  const parsed = z.object({ email: z.string() }).safeParse(req.body);
  if (!parsed.success) {
    return html(
      res,
      <div class="text-lg text-error leading-8">
        Please provide a valid email address
      </div>
    );
  }
  await db
    .insert(contacts)
    .values({ email: parsed.data.email, created: Date.now() });
  return html(
    res,
    <div class="text-lg leading-8">
      Thanks for subscribing, I'll keep you posted!
    </div>
  );
};

export const GET: RouteHandler = async ({ res }) => {
  return html(
    res,
    <RootLayout>
      <HeroSection />
      <FooterSection />
    </RootLayout>
  );
};

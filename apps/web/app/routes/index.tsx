import { html, RouteHandler } from "plainweb";
import RootLayout from "~/app/root";

const code = `import { RouteHandler, html } from "plainweb";

export const GET: RouteHandler = async ({ req, res }) => {
  return html(res, <h1>Hello, world!</h1>);
};
`;

export const GET: RouteHandler = async ({ res }) => {
  const { codeToHtml } = await import("shiki");
  const safeCode = await codeToHtml(code, {
    lang: "javascript",
    theme: "vitesse-dark",
  });
  return html(
    res,
    <RootLayout>
      <div>
        <div class="mx-auto max-w-7xl pb-24 pt-10 sm:pb-32 lg:grid lg:grid-cols-2 lg:gap-x-8 lg:px-8 lg:py-40">
          <div class="px-6 lg:px-0 lg:pt-4">
            <div class="mx-auto max-w-2xl">
              <div class="max-w-lg">
                <h1 class="text-4xl font-bold tracking-tight text-neutral sm:text-6xl">
                  Worse is better
                </h1>
                <p class="mt-6 text-lg leading-8 text-neutral-700">
                  Stop overengineering and start shipping.{" "}
                  <br>
                    Plainweb is a starter template, a small library and
                    documentation for the{" "}
                    <a href="https://grugbrain.dev/" class="btn-link">
                      Grug Brained Developer
                    </a>
                    .
                  </br>
                </p>
                <div class="mt-10 flex items-center gap-x-6">
                  <a href="/docs" class="btn btn-primary">
                    Documentation
                  </a>
                  <a
                    href="https://github.com/joseferben/plainweb"
                    class="btn btn-ghost"
                  >
                    View on GitHub <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div class="md:mx-auto md:max-w-2xl lg:mx-0 mt-20 lg:w-screen px-8 md:px-0">
            <div class="shadow-xl rounded-lg bg-[#121212] p-5">{safeCode}</div>
          </div>
        </div>
      </div>
    </RootLayout>
  );
};

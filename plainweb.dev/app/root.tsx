import Html from "@kitajs/html";

export default function RootLayout(
  props: Html.PropsWithChildren<{
    head?: string | Promise<string>;
    description?: string;
    title?: string;
  }>
) {
  return (
    <>
      {"<!doctype html>"}
      <html lang="en" data-theme="light">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>{props.title || "plain web development"}</title>
          <meta
            name="description"
            content={
              props.description ||
              "a simpler way to build web apps for the grug brained developer"
            }
          />
          <link rel="stylesheet" href="/output.css" />
          <script
            defer
            src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js"
          ></script>
          <script
            defer
            src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.0/dist/cdn.min.js"
          ></script>
          <script defer src="https://unpkg.com/htmx.org@1.9.12"></script>
          <script
            async
            defer
            src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          ></script>
          {props.head ? Html.escapeHtml(props.head) : null}
        </head>
        <body>{props.children}</body>
      </html>
    </>
  );
}

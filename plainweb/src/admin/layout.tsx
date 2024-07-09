import type Html from "@kitajs/html";

export default function RootLayout(
  props: Html.PropsWithChildren<{
    description?: string;
    title?: string;
  }>,
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
          <title>{props.title || "plainweb"}</title>
          <meta
            name="description"
            content={
              props.description ||
              "Build web app with less complexity and more joy."
            }
          />
          <link rel="stylesheet" href="/output.css" />
          <script
            defer
            src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js"
          />
          <script
            defer
            src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.0/dist/cdn.min.js"
          />
          <script defer src="https://unpkg.com/htmx.org@1.9.12" />
        </head>
        <body>{props.children}</body>
      </html>
    </>
  );
}

import Html from "@kitajs/html";

export default function RootLayout(
  props: Html.PropsWithChildren<{
    head?: string | Promise<string>;
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
          <title>{props.title || "plain web development"}</title>
          <meta
            name="description"
            content={
              props.description ||
              "a simpler way to build web apps for the grug brained developer"
            }
          />
          <link rel="stylesheet" href="/output.css" />
          <script src="https://unpkg.com/htmx.org@1.9.12"></script>
          {props.head ? Html.escapeHtml(props.head) : null}
        </head>
        <body>
          <div class="navbar bg-base-100">
            <div class="flex-1">
              <a class="btn btn-ghost text-xl">plainweb.dev</a>
            </div>
          </div>
          {props.children}
        </body>
      </html>
    </>
  );
}

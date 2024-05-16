import Html from "@kitajs/html";

export function Layout(
  props: Html.PropsWithChildren<{
    head?: string | Promise<string>;
    title?: string;
  }>
) {
  return (
    <>
      {"<!doctype html>"}
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>{props.title || "Hello World!"}</title>
          <link rel="stylesheet" href="/style.css" />
          <script src="/script.js" />
          {props.head ? Html.escapeHtml(props.head) : ""}
        </head>
        <body>{props.children}</body>
      </html>
    </>
  );
}

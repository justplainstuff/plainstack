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
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>{props.title ?? "Title"}</title>
          <meta
            name="description"
            content={props.description || "Description"}
          />
          <link rel="stylesheet" href="/public/output.css" />
          <script defer src="https://unpkg.com/htmx.org@1.9.12" />
          <script defer src="//unpkg.com/alpinejs" />
          {props.head ? Html.escapeHtml(props.head) : null}
        </head>
        <body>{props.children}</body>
      </html>
    </>
  );
}
